(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const categories=['Whey Protein','Isolate Protein','Creatine','Mass Gainers','Pre-Workout','Amino Acids','Vitamins & Minerals','Fish Oil & Wellness','Other Supplements'];
  const money=value=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const variantInfo=variant=>[variant.flavor,variant.origin,variant.size].filter(Boolean).join(' · ')||'Variant details not supplied';
  const state={products:[],gallery:[],editorVariants:[],toastTimer:null};
  const dialog=$('productDialog');
  async function api(url,options={}){
    const response=await fetch(url,{credentials:'same-origin',...options,headers:{...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})}});
    const payload=await response.json().catch(()=>({}));
    if(response.status===401){location.assign('/admin-login.html');throw new Error('Owner sign-in required.');}
    if(!response.ok)throw new Error(payload.error||'The request could not be completed.');
    return payload;
  }
  function toast(message){const node=$('toast');node.textContent=message;node.classList.add('show');clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>node.classList.remove('show'),2600);}
  function displayStatus(message,error=false){const node=$('pageStatus');node.textContent=message;node.style.color=error?'#ffaaa4':'#d5f36b';}
  function variantCount(product){return product.variants.length+' variant'+(product.variants.length===1?'':'s');}
  function priceRange(product){const values=product.variants.map(variant=>Number(variant.price)).sort((a,b)=>a-b);return values.length>1&&values[0]!==values[values.length-1]?money(values[0])+' – '+money(values[values.length-1]):money(values[0]||0);}
  function rowMarkup(product){
    const first=product.variants[0];
    const details=product.variants.length===1?variantInfo(first):product.variants.slice(0,2).map(variantInfo).join(' / ')+(product.variants.length>2?' / +'+(product.variants.length-2)+' more':'');
    const thumb=first.image?'<img src="'+esc(first.image)+'" alt="" loading="lazy">':'<span>RS</span>';
    return '<tr><td data-label="Product"><div class="product-cell"><div class="thumb">'+thumb+'</div><div><div class="product-name">'+esc(product.name)+'</div><div class="product-sub">'+esc(details)+' · '+esc(variantCount(product))+'</div></div></div></td><td data-label="Brand">'+esc(product.brand)+'</td><td data-label="Price">'+esc(priceRange(product))+'</td><td data-label="Category"><span class="category-pill">'+esc(product.category)+'</span></td><td data-label="Actions"><div class="actions"><a class="icon-button" href="supplements.html#product/'+encodeURIComponent(product.id)+'" target="_blank" rel="noopener" title="View in storefront" aria-label="View in storefront">◉</a><button class="icon-button" data-edit="'+esc(product.id)+'" title="Edit product" aria-label="Edit product">✎</button><button class="icon-button delete" data-delete="'+esc(product.id)+'" title="Delete product" aria-label="Delete product">⌫</button></div></td></tr>';
  }
  function renderProducts(){
    const query=$('productSearch').value.trim().toLocaleLowerCase();
    const matches=state.products.filter(product=>[product.name,product.brand,product.category,...product.variants.flatMap(variant=>[variant.flavor,variant.origin,variant.size])].join(' ').toLocaleLowerCase().includes(query));
    $('productRows').innerHTML=matches.length?matches.map(rowMarkup).join(''):'<tr><td colspan="5"><div class="empty">No product listings match your search.</div></td></tr>';
    $('productRows').querySelectorAll('[data-edit]').forEach(button=>button.addEventListener('click',()=>openEditor(button.dataset.edit)));
    $('productRows').querySelectorAll('[data-delete]').forEach(button=>button.addEventListener('click',()=>deleteProduct(button.dataset.delete)));
    $('productCount').textContent=state.products.length;
    const variants=state.products.reduce((sum,product)=>sum+product.variants.length,0);
    $('variantCount').textContent=variants;
    const withImage=state.products.reduce((sum,product)=>sum+product.variants.filter(variant=>variant.image).length,0);
    $('imageCount').innerHTML=withImage+'<span> / '+variants+'</span>';
    $('tableSummary').textContent='Showing '+matches.length+' of '+state.products.length+' product listings';
  }
  function renderGallery(){
    const grid=$('ownerGalleryGrid');
    $('galleryCount').textContent=state.gallery.length+' photo'+(state.gallery.length===1?'':'s');
    if(!state.gallery.length){grid.innerHTML='<div class="empty">No gym photos yet. Upload the first one above.</div>';return;}
    grid.innerHTML=state.gallery.map(image=>'<article class="owner-gallery-card"><img src="'+esc(image.url)+'" alt="'+esc(image.caption||'R.S. Square gym photo')+'" loading="lazy"><p>'+esc(image.caption||'Gym photo')+'</p><button class="icon-button delete" type="button" data-delete-gallery="'+esc(image.id)+'" title="Remove photo" aria-label="Remove gym photo">⌫</button></article>').join('');
    grid.querySelectorAll('[data-delete-gallery]').forEach(button=>button.addEventListener('click',()=>deleteGalleryImage(button.dataset.deleteGallery)));
  }
  async function loadGallery(){
    try{
      const data=await api('/api/gallery');state.gallery=Array.isArray(data.images)?data.images:[];renderGallery();
      $('galleryStatus').textContent='Photos appear in the gallery on the fitness centre homepage.';
    }catch(error){
      state.gallery=[];renderGallery();$('galleryStatus').textContent=error.message;
    }
  }
  async function uploadGalleryPhoto(event){
    event.preventDefault();const file=$('gymGalleryFile').files?.[0];if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){toast('Choose a JPG, PNG, or WebP gym photo.');return;}
    if(file.size>20*1024*1024){toast('Choose a gym photo smaller than 20 MB.');return;}
    const button=$('uploadGymPhoto');button.disabled=true;button.textContent='Uploading…';
    try{
      const imageData=await optimizeGalleryImage(file);
      const result=await api('/api/admin/gallery',{method:'POST',body:JSON.stringify({imageData,caption:$('gymGalleryCaption').value.trim()})});
      state.gallery.unshift(result.image);renderGallery();$('gymGalleryForm').reset();$('galleryStatus').textContent='Photo uploaded and visible on the fitness centre homepage.';toast('Gym photo uploaded.');
    }catch(error){$('galleryStatus').textContent=error.message;toast(error.message);}
    finally{button.disabled=false;button.textContent='Upload photo';}
  }
  async function deleteGalleryImage(id){
    const image=state.gallery.find(item=>item.id===id);if(!image)return;
    if(!confirm('Remove this photo from the gym gallery?'))return;
    try{await api('/api/admin/gallery/'+encodeURIComponent(id),{method:'DELETE'});state.gallery=state.gallery.filter(item=>item.id!==id);renderGallery();$('galleryStatus').textContent='Photo removed from the gym gallery.';}
    catch(error){$('galleryStatus').textContent=error.message;toast(error.message);}
  }
  function createVariant(variant={}){return {id:variant.id||'variant-'+crypto.randomUUID(),flavor:variant.flavor||'',origin:variant.origin||'',size:variant.size||'',price:variant.price??'',image:variant.image||'',imageData:variant.imageData||'',imageSource:variant.imageSource||'',review:variant.review||'',entries:variant.entries||[]};}
  function variantMarkup(variant,index){
    const fileId='variant-file-'+index;
    const imageState=variant.imageData?'New image selected':(variant.image?'Current image saved':'No image yet');
    const preview=variant.imageData||variant.image;
    return '<section class="variant-card" data-variant="'+index+'"><div class="variant-top"><span>Variant '+(index+1)+'</span><span>'+esc(variant.id)+'</span></div><div class="variant-fields"><div class="field"><label>Flavor</label><input data-field="flavor" value="'+esc(variant.flavor)+'" placeholder="Leave blank if not supplied"></div><div class="field"><label>Origin / label note</label><input data-field="origin" value="'+esc(variant.origin)+'" placeholder="Optional, as supplied"></div><div class="field"><label>Size</label><input data-field="size" value="'+esc(variant.size)+'" placeholder="Leave blank if not supplied"></div><div class="field"><label>Price (₹)</label><input data-field="price" type="number" min="0.01" step="0.01" value="'+esc(variant.price)+'" required></div></div><div class="variant-images"><div class="field"><label>Product image URL</label><input data-field="image" value="'+esc(variant.image)+'" placeholder="Optional direct image URL"></div><div class="field"><label for="'+fileId+'">Upload exact packshot</label><input id="'+fileId+'" data-file type="file" accept="image/png,image/jpeg,image/webp,image/gif"><div class="image-preview" data-image-preview>'+(preview?'<img src="'+esc(preview)+'" alt="">':'')+'<span>'+imageState+'</span></div></div></div><div class="variant-actions"><button class="btn danger" data-remove-variant="'+index+'" type="button" '+(state.editorVariants.length<=1?'disabled':'')+'>Remove variant</button></div></section>';
  }
  function renderVariants(){
    $('variantEditor').innerHTML=state.editorVariants.map(variantMarkup).join('');
    $('variantEditor').querySelectorAll('[data-field]').forEach(input=>input.addEventListener('input',()=>{
      const row=input.closest('[data-variant]');const item=state.editorVariants[Number(row.dataset.variant)];item[input.dataset.field]=input.value;
      if(input.dataset.field==='image'){item.imageData='';const preview=row.querySelector('[data-image-preview]');preview.innerHTML=input.value?'<img src="'+esc(input.value)+'" alt=""><span>Image URL preview</span>':'<span>No image yet</span>';const image=preview.querySelector('img');if(image)image.addEventListener('error',()=>{preview.innerHTML='<span>Could not load that image URL</span>';},{once:true});}
    }));
    $('variantEditor').querySelectorAll('[data-file]').forEach(input=>input.addEventListener('change',async()=>{
      const file=input.files&&input.files[0];if(!file)return;if(!file.type.startsWith('image/')){toast('Choose a product image file.');return;}
      try{const data=await optimizeImage(file);const item=state.editorVariants[Number(input.closest('[data-variant]').dataset.variant)];item.imageData=data;item.image='';const preview=input.closest('[data-variant]').querySelector('[data-image-preview]');preview.innerHTML='<img src="'+data+'" alt=""><span>New image ready to save</span>';const urlInput=input.closest('[data-variant]').querySelector('[data-field="image"]');urlInput.value='';}
      catch(_){toast('Could not read that image. Choose another file.');}
    }));
    $('variantEditor').querySelectorAll('[data-remove-variant]').forEach(button=>button.addEventListener('click',()=>{state.editorVariants.splice(Number(button.dataset.removeVariant),1);renderVariants();}));
  }
  async function optimizeImage(file){
    let bitmap;try{bitmap=await createImageBitmap(file);}catch(_){const url=URL.createObjectURL(file);bitmap=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Could not open image.'))};img.src=url;});}
    const scale=Math.min(1,1400/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);if(bitmap.close)bitmap.close();return new Promise((resolve,reject)=>canvas.toBlob(blob=>{if(!blob)return reject(new Error('Could not prepare image.'));const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);},'image/webp',.84));
  }
  async function optimizeGalleryImage(file){
    let bitmap;try{bitmap=await createImageBitmap(file);}catch(_){const url=URL.createObjectURL(file);bitmap=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Could not open that photo.'))};img.src=url;});}
    let scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));let blob;const canvas=document.createElement('canvas');
    for(let sizePass=0;sizePass<5;sizePass++){
      canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
      for(const quality of [.8,.72,.64,.56,.48]){blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));if(blob&&blob.size<=1200000)break;}
      if(blob&&blob.size<=1200000)break;scale*=.8;
    }
    if(bitmap.close)bitmap.close();if(!blob||blob.size>1200000)throw new Error('This photo is too large to store. Please choose a smaller image.');
    return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});
  }
  function openEditor(id){
    const product=state.products.find(item=>item.id===id);
    $('productForm').reset();$('productId').value=product?.id||'';$('dialogTitle').textContent=product?'Edit product':'Add product';
    $('productName').value=product?.name||'';$('productBrand').value=product?.brand||'Brand not specified';$('productCategory').value=product?.category||categories[0];$('productFeatured').checked=Boolean(product?.featured);
    state.editorVariants=product?product.variants.map(createVariant):[createVariant()];renderVariants();dialog.showModal();
  }
  async function deleteProduct(id){
    const product=state.products.find(item=>item.id===id);if(!product)return;
    if(!confirm('Remove “'+product.name+'” and all of its variants from the storefront?'))return;
    try{await api('/api/admin/products/'+encodeURIComponent(id),{method:'DELETE'});state.products=state.products.filter(item=>item.id!==id);renderProducts();displayStatus('Product removed from the storefront.');}
    catch(error){displayStatus(error.message,true);}
  }
  async function saveProduct(event){
    event.preventDefault();const id=$('productId').value;
    const variants=state.editorVariants.map(variant=>({...variant,price:Number(variant.price)}));
    if(variants.some(variant=>!Number.isFinite(variant.price)||variant.price<=0)){toast('Enter a price greater than zero for every variant.');return;}
    const product={id:id||undefined,name:$('productName').value.trim(),brand:$('productBrand').value.trim(),category:$('productCategory').value,featured:$('productFeatured').checked,variants};
    $('saveProduct').disabled=true;$('saveProduct').textContent='Saving…';
    try{const result=await api(id?'/api/admin/products/'+encodeURIComponent(id):'/api/admin/products',{method:id?'PUT':'POST',body:JSON.stringify({product})});
      const index=state.products.findIndex(item=>item.id===result.product.id);if(index<0)state.products.unshift(result.product);else state.products[index]=result.product;
      dialog.close();renderProducts();displayStatus('Product saved and storefront updated.');toast('Product saved.');
    }catch(error){toast(error.message);}
    finally{$('saveProduct').disabled=false;$('saveProduct').textContent='Save product';}
  }
  async function init(){
    try{const session=await api('/api/admin/me');if(!session.authenticated){location.replace('/admin-login.html');return;}const data=await api('/api/products');state.products=data;renderProducts();displayStatus('Catalogue ready. Changes are stored on this website.');await loadGallery();}
    catch(error){displayStatus(error.message,true);}
  }
  $('productSearch').addEventListener('input',renderProducts);
  $('addProduct').addEventListener('click',()=>openEditor(''));
  $('addVariant').addEventListener('click',()=>{state.editorVariants.push(createVariant());renderVariants();});
  $('closeDialog').addEventListener('click',()=>dialog.close());
  $('cancelEditor').addEventListener('click',()=>dialog.close());
  $('productForm').addEventListener('submit',saveProduct);
  $('gymGalleryForm').addEventListener('submit',uploadGalleryPhoto);
  $('logoutButton').addEventListener('click',async()=>{await api('/api/admin/logout',{method:'POST',body:'{}'}).catch(()=>{});location.replace('/admin-login.html');});
  $('logoutButtonMobile').addEventListener('click',async()=>{await api('/api/admin/logout',{method:'POST',body:'{}'}).catch(()=>{});location.replace('/admin-login.html');});
  init();
})();
