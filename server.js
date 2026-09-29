'use strict';

const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const CATALOG_FILE = path.join(DATA_DIR, 'products.json');
const UPLOAD_DIR = path.join(ROOT, 'assets', 'uploads');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const CATEGORIES = new Set(['Whey Protein','Isolate Protein','Creatine','Mass Gainers','Pre-Workout','Amino Acids','Vitamins & Minerals','Fish Oil & Wellness','Other Supplements']);
const sessions = new Map();
const loginAttempts = new Map();
const SESSION_MS = 12 * 60 * 60 * 1000;
const MAX_BODY = 20 * 1024 * 1024;
const MIME_TYPES = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'};

async function ensureCatalog() {
  await fsp.mkdir(DATA_DIR, {recursive:true});
  await fsp.mkdir(UPLOAD_DIR, {recursive:true});
  try { return JSON.parse(await fsp.readFile(CATALOG_FILE,'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const context = {window:{}};
    const source = await fsp.readFile(path.join(ROOT,'assets','catalog.js'),'utf8');
    vm.runInNewContext(source,context,{timeout:1000,filename:'assets/catalog.js'});
    const products = context.window.RS_CATALOG;
    if (!Array.isArray(products) || !products.length) throw new Error('The starting product catalogue could not be loaded.');
    await fsp.writeFile(CATALOG_FILE,JSON.stringify(products,null,2)+'\n','utf8');
    return products;
  }
}

async function readBody(req) {
  const chunks=[]; let length=0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > MAX_BODY) throw Object.assign(new Error('Request is too large.'),{status:413});
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch (_) { throw Object.assign(new Error('Please send valid JSON.'),{status:400}); }
}

function sendJson(res,status,payload,extraHeaders={}) {
  const body=JSON.stringify(payload);
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extraHeaders});
  res.end(body);
}

function getSession(req) {
  const cookie=(req.headers.cookie||'').split(';').map(item=>item.trim()).find(item=>item.startsWith('rs_owner_session='));
  if (!cookie) return null;
  const id=cookie.slice('rs_owner_session='.length);
  const session=sessions.get(id);
  if (!session || session.expiresAt < Date.now()) { sessions.delete(id); return null; }
  session.expiresAt=Date.now()+SESSION_MS;
  return {id,session};
}

function sameOrigin(req) {
  const origin=req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch (_) { return false; }
}

function passwordMatches(expected,provided) {
  if (!expected || typeof provided !== 'string') return false;
  const a=crypto.createHash('sha256').update(expected).digest();
  const b=crypto.createHash('sha256').update(provided).digest();
  return crypto.timingSafeEqual(a,b);
}

function safeProduct(product,oldProduct) {
  if (!product || typeof product !== 'object') throw Object.assign(new Error('Product information is missing.'),{status:400});
  const name=String(product.name||'').trim();
  const brand=String(product.brand||'').trim();
  const category=String(product.category||'');
  if (!name || name.length>140) throw Object.assign(new Error('Enter a product name under 140 characters.'),{status:400});
  if (!brand || brand.length>100) throw Object.assign(new Error('Enter a brand or keep “Brand not specified”.'),{status:400});
  if (!CATEGORIES.has(category)) throw Object.assign(new Error('Choose one of the listed supplement categories.'),{status:400});
  if (!Array.isArray(product.variants) || !product.variants.length || product.variants.length>80) throw Object.assign(new Error('A product needs at least one variant.'),{status:400});
  const previousVariants=new Map((oldProduct?.variants||[]).map(variant=>[variant.id,variant]));
  const seen=new Set();
  const variants=product.variants.map(input=>{
    const id=String(input.id||'variant-'+crypto.randomUUID());
    if (seen.has(id)) throw Object.assign(new Error('Each flavor and size option needs its own ID.'),{status:400});
    seen.add(id);
    const price=Number(input.price);
    if (!Number.isFinite(price) || price<0 || price>100000000) throw Object.assign(new Error('Enter a valid price in rupees for every variant.'),{status:400});
    const previous=previousVariants.get(id);
    const variant={...(previous||{}),...input,id,price,
      flavor:String(input.flavor||''),origin:String(input.origin||''),size:String(input.size||''),
      image:String(input.image||''),imageSource:String(input.imageSource||previous?.imageSource||''),
      review:String(input.review||previous?.review||''),entries:Array.isArray(input.entries)?input.entries:(previous?.entries||[])
    };
    if (variant.imageData) {
      const match=String(variant.imageData).match(/^data:image\/(jpeg|png|webp|gif);base64,([A-Za-z0-9+/=]+)$/);
      if (!match) throw Object.assign(new Error('Upload a JPG, PNG, WebP, or GIF product image.'),{status:400});
      const image=Buffer.from(match[2],'base64');
      if (!image.length || image.length>8*1024*1024) throw Object.assign(new Error('Product images must be smaller than 8 MB.'),{status:400});
      const ext=match[1]==='jpeg'?'jpg':match[1];
      const filename=crypto.randomUUID()+'.'+ext;
      fs.writeFileSync(path.join(UPLOAD_DIR,filename),image,{flag:'wx'});
      variant.image='assets/uploads/'+filename;
      delete variant.imageData;
    } else if (variant.image && !/^(https?:\/\/|assets\/)/i.test(variant.image)) {
      throw Object.assign(new Error('Image must be an http(s) URL or an uploaded product image.'),{status:400});
    }
    return variant;
  });
  const slug=name.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'product';
  const id=oldProduct?.id||String(product.id||`${slug}-${crypto.randomUUID().slice(0,8)}`);
  return {...(oldProduct||{}),id,name,brand,category,featured:Boolean(product.featured),variants};
}

async function handle(req,res) {
  const baseHeaders={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'SAMEORIGIN','Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
  for (const [key,value] of Object.entries(baseHeaders)) res.setHeader(key,value);
  let pathname;
  try { pathname=decodeURIComponent(new URL(req.url,'http://local').pathname); }
  catch (_) { return sendJson(res,400,{error:'Invalid URL.'}); }
  const routeName=pathname.toLowerCase();

  if (pathname==='/api/products' && req.method==='GET') {
    try { return sendJson(res,200,await ensureCatalog()); }
    catch (_) { return sendJson(res,500,{error:'The product catalogue could not be loaded.'}); }
  }
  if (pathname==='/api/admin/me' && req.method==='GET') return sendJson(res,200,{authenticated:Boolean(getSession(req)),configured:Boolean(process.env.RS_ADMIN_USER&&process.env.RS_ADMIN_PASSWORD)});
  if (pathname==='/api/admin/login' && req.method==='POST') {
    if (!sameOrigin(req)) return sendJson(res,403,{error:'Request origin could not be verified.'});
    if (!process.env.RS_ADMIN_USER || !process.env.RS_ADMIN_PASSWORD) return sendJson(res,503,{error:'Owner sign-in is not configured. Start the site with your owner username and password.'});
    const ip=req.socket.remoteAddress||'unknown'; const attempt=loginAttempts.get(ip)||{count:0,until:Date.now()+15*60*1000};
    if (attempt.until<Date.now()) {attempt.count=0;attempt.until=Date.now()+15*60*1000;}
    if (attempt.count>=8) return sendJson(res,429,{error:'Too many sign-in attempts. Wait 15 minutes, then try again.'});
    const body=await readBody(req);
    const usernameMatches=passwordMatches(process.env.RS_ADMIN_USER,String(body.username||''));
    const passwordOk=passwordMatches(process.env.RS_ADMIN_PASSWORD,String(body.password||''));
    if (!usernameMatches || !passwordOk) {attempt.count++;loginAttempts.set(ip,attempt);return sendJson(res,401,{error:'The username or password is incorrect.'});}
    loginAttempts.delete(ip);
    const id=crypto.randomBytes(32).toString('base64url'); sessions.set(id,{expiresAt:Date.now()+SESSION_MS});
    const secure=process.env.NODE_ENV==='production'||req.headers['x-forwarded-proto']==='https';
    const cookie=`rs_owner_session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(SESSION_MS/1000)}${secure?'; Secure':''}`;
    return sendJson(res,200,{ok:true},{'Set-Cookie':cookie});
  }
  if (pathname==='/api/admin/logout' && req.method==='POST') {
    if (!sameOrigin(req)) return sendJson(res,403,{error:'Request origin could not be verified.'});
    const current=getSession(req); if (current) sessions.delete(current.id);
    return sendJson(res,200,{ok:true},{'Set-Cookie':'rs_owner_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'});
  }
  if (pathname.startsWith('/api/admin/products')) {
    if (!getSession(req)) return sendJson(res,401,{error:'Owner sign-in required.'});
    if (!sameOrigin(req)) return sendJson(res,403,{error:'Request origin could not be verified.'});
    let products; try {products=await ensureCatalog();} catch (_) {return sendJson(res,500,{error:'The product catalogue could not be loaded.'});}
    try {
      if (pathname==='/api/admin/products' && req.method==='POST') {
        const body=await readBody(req); const product=safeProduct(body.product);
        if (products.some(item=>item.id===product.id)) product.id += '-'+crypto.randomUUID().slice(0,6);
        products.push(product); await fsp.writeFile(CATALOG_FILE,JSON.stringify(products,null,2)+'\n','utf8');
        return sendJson(res,201,{product});
      }
      const match=pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
      if (!match) return sendJson(res,404,{error:'Product route not found.'});
      const id=match[1]; const index=products.findIndex(item=>item.id===id);
      if (index<0) return sendJson(res,404,{error:'Product not found.'});
      if (req.method==='PUT') {
        const body=await readBody(req); products[index]=safeProduct({...body.product,id},products[index]);
        await fsp.writeFile(CATALOG_FILE,JSON.stringify(products,null,2)+'\n','utf8');
        return sendJson(res,200,{product:products[index]});
      }
      if (req.method==='DELETE') {
        products.splice(index,1); await fsp.writeFile(CATALOG_FILE,JSON.stringify(products,null,2)+'\n','utf8');
        return sendJson(res,200,{ok:true});
      }
      return sendJson(res,405,{error:'Method not allowed.'},{Allow:'PUT, DELETE'});
    } catch (error) { return sendJson(res,error.status||500,{error:error.status?error.message:'The product changes could not be saved.'}); }
  }

  if ((routeName==='/admin.html'||routeName==='/admin') && !getSession(req)) {
    res.writeHead(302,{Location:'/admin-login.html','Cache-Control':'no-store'});return res.end();
  }
  if (routeName==='/admin'||routeName==='/admin.html') pathname='/admin.html';
  if (['/server.js','/start-site.ps1','/start-site.cmd'].includes(routeName)) return sendJson(res,404,{error:'Page not found.'});
  if (pathname==='/') pathname='/index.html';
  const absolute=path.resolve(ROOT,'.'+pathname);
  if (!absolute.startsWith(ROOT+path.sep) && absolute!==ROOT) return sendJson(res,403,{error:'Access denied.'});
  try {
    const stat=await fsp.stat(absolute);
    if (!stat.isFile()) return sendJson(res,404,{error:'Page not found.'});
    const ext=path.extname(absolute).toLowerCase();
    if (ext==='.html' && (pathname==='/admin.html'||pathname==='/admin-login.html')) res.setHeader('Cache-Control','no-store');
    res.writeHead(200,{'Content-Type':MIME_TYPES[ext]||'application/octet-stream'});
    fs.createReadStream(absolute).pipe(res);
  } catch (_) { sendJson(res,404,{error:'Page not found.'}); }
}

const server=http.createServer((req,res)=>{handle(req,res).catch(error=>{if (!res.headersSent) sendJson(res,error.status||500,{error:error.status?error.message:'Unexpected server error.'});else res.destroy();});});
server.listen(PORT,HOST,()=>{
  console.log(`R.S. Square and R.S. Supplements are available at http://${HOST}:${PORT}`);
  console.log(process.env.RS_ADMIN_USER&&process.env.RS_ADMIN_PASSWORD?'Owner sign-in is configured.':'Owner sign-in is disabled until RS_ADMIN_USER and RS_ADMIN_PASSWORD are set.');
});
