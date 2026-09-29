(async () => {
  'use strict';

  const MYBILLBOOK_STORE_URL = 'https://mybillbook.in/store/r_s_supplements';

  let products = window.RS_CATALOG || [];
  try {
    const response = await fetch('/api/products',{cache:'no-store'});
    if (response.ok) { const savedProducts = await response.json(); if (Array.isArray(savedProducts)) { products = savedProducts; window.RS_CATALOG = products; } }
  } catch (_) {}
  const categories = ['Whey Protein','Isolate Protein','Creatine','Mass Gainers','Pre-Workout','Amino Acids','Vitamins & Minerals','Fish Oil & Wellness','Other Supplements'];
  const variantList = products.flatMap(product => product.variants.map(variant => ({ product, variant })));
  const variantById = new Map(variantList.map(row => [row.variant.id, row]));
  const productById = new Map(products.map(product => [product.id, product]));
  const formatMoney = value => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const unique = values => [...new Set(values)];
  const $ = id => document.getElementById(id);
  const state = { cart: readCart(), detailProduct: null, detailVariant: null, detailQty: 1, toastTimer: null };
  const overlay = $('overlay');
  const cartDrawer = $('cartDrawer');
  const detailModal = $('detailModal');

  function readCart() {
    try { return new Map(JSON.parse(localStorage.getItem('rsSupplementsCart') || '[]')); } catch (_) { return new Map(); }
  }
  function saveCart() { localStorage.setItem('rsSupplementsCart', JSON.stringify([...state.cart.entries()])); }
  function variantDescription(variant) {
    return [variant.flavor, variant.origin, variant.size].filter(Boolean).join(' · ');
  }
  function variantLabel(variant) {
    return (variantDescription(variant) || 'Product details not supplied') + ' · ' + formatMoney(variant.price);
  }
  function imageAlt(product, variant) {
    return [product.brand !== 'Brand not specified' ? product.brand : '', product.name, variant.flavor, variant.origin, variant.size].filter(Boolean).join(' — ');
  }
  function placeholderMarkup(product, variant) {
    const details = variantDescription(variant);
    return '<div class="placeholder-image" role="img" aria-label="Packshot not supplied for ' + esc(imageAlt(product,variant)) + '">' +
      '<span class="placeholder-mark">RS</span><span class="placeholder-brand">R.S. Supplements · packshot pending</span>' +
      '<strong class="placeholder-name">' + esc(product.name) + '</strong>' +
      '<span class="placeholder-variant">' + esc(details || (product.brand !== 'Brand not specified' ? product.brand : 'Product details not supplied')) + '</span>' +
      '<span class="placeholder-needed">Owner can add a matching product packshot</span></div>';
  }
  function imageMarkup(product, variant, className) {
    const image = variant._effectiveImage || variant.image || '';
    if (!image) return placeholderMarkup(product,variant);
    return '<img class="' + esc(className || 'product-image') + '" data-variant-image="' + esc(variant.id) + '" src="' + esc(image) + '" alt="' + esc(imageAlt(product,variant)) + '" loading="lazy">';
  }
  function wireImageFallbacks(root) {
    root.querySelectorAll('img[data-variant-image]').forEach(img => {
      if (img.dataset.fallbackWired) return;
      img.dataset.fallbackWired = '1';
      img.addEventListener('error', () => {
        const row = variantById.get(img.dataset.variantImage);
        if (!row) return;
        const box = img.parentElement;
        if (box) box.innerHTML = placeholderMarkup(row.product,row.variant);
      }, {once:true});
    });
  }
  function showToast(message) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toast.classList.remove('show'),2600);
  }
  function anyPanelOpen() {
    return cartDrawer.classList.contains('open') || detailModal.classList.contains('open');
  }
  function syncOverlay() {
    overlay.classList.toggle('open',anyPanelOpen());
    document.body.style.overflow = anyPanelOpen() ? 'hidden' : '';
  }
  function openCart() { closeDetail(false); cartDrawer.classList.add('open'); syncOverlay(); $('closeCart').focus(); }
  function closeCart() { cartDrawer.classList.remove('open'); syncOverlay(); }
  function closeDetail(changeHash) {
    detailModal.classList.remove('open');
    if (changeHash && location.hash.startsWith('#product/')) history.pushState({},'', '#catalog');
    syncOverlay();
  }

  function getMatchingVariants(product, filters) {
    return product.variants.filter(variant => {
      if (filters.flavor && variant.flavor !== filters.flavor) return false;
      if (filters.size && variant.size !== filters.size) return false;
      return true;
    });
  }
  function currentFilters() {
    return {
      query: $('searchInput').value.trim().toLocaleLowerCase(),
      brand: $('brandFilter').value,
      category: $('categoryFilter').value,
      flavor: $('flavorFilter').value,
      size: $('sizeFilter').value,
      sort: $('sortFilter').value
    };
  }
  function matchesSearch(product, variants, query) {
    if (!query) return true;
    const text = [product.name,product.brand,product.category,...variants.flatMap(v => [v.flavor,v.origin,v.size])].join(' ').toLocaleLowerCase();
    return text.includes(query);
  }
  function cardMarkup(product, variant, availableVariants) {
    const familyVariantCount = product.variants.length;
    const matchedVariants = availableVariants || product.variants;
    const shownPrice = matchedVariants.length > 1 ? 'From ' + formatMoney(Math.min(...matchedVariants.map(v => v.price))) : formatMoney(variant.price);
    const optionNote = variantDescription(variant) || 'Variant details not supplied';
    const itemCount = familyVariantCount === 1 ? '1 variant' : familyVariantCount + ' variants';
    const imageTag = product.brand !== 'Brand not specified' ? '<span class="image-brand-tag">' + esc(product.brand) + '</span>' : '';
    return '<article class="product-card">' +
      '<div class="product-image-box">' + imageTag + imageMarkup(product,variant,'product-image') + '</div>' +
      '<div class="card-content"><div class="brand-line">' + esc(product.brand) + ' · ' + esc(product.category) + '</div>' +
      '<h3>' + esc(product.name) + '</h3><div class="variant-caption">' + esc(optionNote) + '</div>' +
      '<div class="card-meta"><span class="price">' + shownPrice + '</span><span class="variant-count">' + itemCount + '</span></div>' +
      '<div class="card-actions"><button type="button" data-detail="' + esc(product.id) + '" data-variant="' + esc(variant.id) + '">View details</button>' +
      '<button type="button" class="primary" data-add="' + esc(variant.id) + '">Add to cart</button></div></div></article>';
  }
  function wireCardButtons(root) {
    root.querySelectorAll('[data-detail]').forEach(button => button.addEventListener('click',() => openDetail(button.dataset.detail,button.dataset.variant,true)));
    root.querySelectorAll('[data-add]').forEach(button => button.addEventListener('click',() => addToCart(button.dataset.add,1)));
    wireImageFallbacks(root);
  }
  function renderCards(root, rows) {
    if (!rows.length) {
      root.innerHTML = '<div class="empty-results">No products match these filters.<br>Try clearing one or more filters.</div>';
      return;
    }
    root.innerHTML = rows.map(row => cardMarkup(row.product,row.variant,row.variants)).join('');
    wireCardButtons(root);
  }
  function sortRows(rows, sort) {
    const result = rows.slice();
    if (sort === 'price-asc') result.sort((a,b) => a.minPrice - b.minPrice || a.product.name.localeCompare(b.product.name));
    else if (sort === 'price-desc') result.sort((a,b) => b.minPrice - a.minPrice || a.product.name.localeCompare(b.product.name));
    else if (sort === 'name-asc') result.sort((a,b) => a.product.name.localeCompare(b.product.name,'en') || a.product.brand.localeCompare(b.product.brand,'en'));
    else if (sort === 'name-desc') result.sort((a,b) => b.product.name.localeCompare(a.product.name,'en') || a.product.brand.localeCompare(b.product.brand,'en'));
    else result.sort((a,b) => Number(b.product.featured) - Number(a.product.featured) || products.indexOf(a.product) - products.indexOf(b.product));
    return result;
  }
  function renderCatalog() {
    const filters = currentFilters();
    let rows = [];
    products.forEach(product => {
      if (filters.brand && product.brand !== filters.brand) return;
      if (filters.category && product.category !== filters.category) return;
      const variants = getMatchingVariants(product,filters);
      if (!variants.length || !matchesSearch(product,variants,filters.query)) return;
      const sortedVariants = variants.slice().sort((a,b) => a.price - b.price);
      rows.push({product,variant:sortedVariants[0],variants:sortedVariants,minPrice:Math.min(...variants.map(v => v.price))});
    });
    rows = sortRows(rows,filters.sort);
    const matchedVariants = products.reduce((count,product) => count + getMatchingVariants(product,filters).filter(v => matchesSearch(product,[v],filters.query) && (!filters.brand || product.brand === filters.brand) && (!filters.category || product.category === filters.category)).length,0);
    $('resultsCount').textContent = rows.length + ' product listings · ' + matchedVariants + ' matching variants';
    renderCards($('catalogGrid'),rows);
  }
  function renderFeatured() {
    const featuredRows = products.filter(product => product.featured).map(product => ({product,variant:product.variants.slice().sort((a,b) => a.price - b.price)[0]}));
    renderCards($('featuredGrid'),featuredRows);
  }
  function setOptions(select, values, firstLabel) {
    const previous = select.value;
    select.innerHTML = '<option value="">' + esc(firstLabel) + '</option>' + values.map(value => '<option value="' + esc(value) + '">' + esc(value) + '</option>').join('');
    if (values.includes(previous)) select.value = previous;
  }
  function initFilters() {
    const brands = unique(products.map(p => p.brand)).sort((a,b) => a.localeCompare(b,'en'));
    const flavors = unique(variantList.map(row => row.variant.flavor).filter(Boolean)).sort((a,b) => a.localeCompare(b,'en'));
    const sizes = unique(variantList.map(row => row.variant.size).filter(Boolean)).sort((a,b) => a.localeCompare(b,'en'));
    setOptions($('brandFilter'),brands,'All brands');
    setOptions($('categoryFilter'),categories,'All categories');
    setOptions($('flavorFilter'),flavors,'All flavors');
    setOptions($('sizeFilter'),sizes,'All sizes');
    const strip = $('supplementCategories');
    strip.innerHTML = '<span>Shop category</span><button class="category-chip active" type="button" data-category="">All products</button>' + categories.map(category => '<button class="category-chip" type="button" data-category="' + esc(category) + '">' + esc(category) + '</button>').join('');
    strip.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click',() => {
      $('categoryFilter').value = button.dataset.category;
      strip.querySelectorAll('.category-chip').forEach(chip => chip.classList.toggle('active',chip === button));
      renderCatalog();
      location.hash = 'catalog';
    }));
    $('catalogIntro').textContent = products.length + ' product listings · ' + variantList.length + ' catalog variants. Product details, flavors, sizes, and prices follow the supplied catalogue.';
  }
  function updateCategoryChip() {
    const value = $('categoryFilter').value;
    document.querySelectorAll('.category-chip').forEach(button => button.classList.toggle('active',button.dataset.category === value));
  }

  function openDetail(productId,variantId,pushHash) {
    const product = productById.get(productId);
    if (!product) return;
    const variant = product.variants.find(v => v.id === variantId) || product.variants[0];
    state.detailProduct = product;
    state.detailVariant = variant;
    state.detailQty = Math.max(1,state.detailQty || 1);
    if (pushHash && location.hash !== '#product/' + product.id) history.pushState({},'','#product/' + product.id);
    closeCart();
    renderDetail();
    detailModal.classList.add('open');
    syncOverlay();
  }
  function selectorMarkup(label,field,values,current) {
    if (values.length < 2) return '';
    const options = values.map(value => {
      const valueLabel = value || 'Not specified';
      return '<option value="' + esc(value) + '" ' + (value === current ? 'selected' : '') + '>' + esc(valueLabel) + '</option>';
    }).join('');
    return '<div class="field"><label>' + esc(label) + '</label><select data-detail-option="' + field + '">' + options + '</select></div>';
  }
  function renderDetail() {
    const product = state.detailProduct;
    const variant = state.detailVariant;
    if (!product || !variant) return;
    const flavors = unique(product.variants.map(v => v.flavor));
    const sizes = unique(product.variants.map(v => v.size));
    const facts = [];
    if (variant.flavor) facts.push(['Flavor',variant.flavor]);
    if (variant.origin) facts.push(['Origin',variant.origin]);
    if (variant.size) facts.push(['Size',variant.size]);
    facts.push(['Category',product.category]);
    const review = variant.review ? '<div class="detail-review">' + esc(variant.review) + '</div>' : '';
    $('detailContent').innerHTML = '<div class="detail-layout"><div class="detail-image">' + imageMarkup(product,variant,'product-image') + '</div>' +
      '<div class="detail-info"><div class="detail-brand">' + esc(product.brand) + '</div><h2>' + esc(product.name) + '</h2><span class="detail-category">' + esc(product.category) + '</span>' +
      '<div class="detail-price">' + formatMoney(variant.price) + '</div>' +
      '<div class="detail-options">' + selectorMarkup('Flavor','flavor',flavors,variant.flavor) + selectorMarkup('Size','size',sizes,variant.size) + '</div>' +
      '<div class="detail-facts">' + facts.map(f => '<div class="detail-fact"><span>' + esc(f[0]) + '</span><strong>' + esc(f[1]) + '</strong></div>').join('') + '</div>' + review +
      '<div class="detail-qty"><label for="detailQuantity">Quantity</label><div class="quantity-controls"><button type="button" data-detail-qty="-1" aria-label="Decrease quantity">−</button><span id="detailQuantity">' + state.detailQty + '</span><button type="button" data-detail-qty="1" aria-label="Increase quantity">+</button></div></div>' +
      '<button type="button" class="button detail-add" id="detailAdd">Add to cart · ' + formatMoney(variant.price) + '</button></div></div>';
    const root = $('detailContent');
    root.querySelectorAll('[data-detail-option]').forEach(select => select.addEventListener('change',() => {
      const flavorSelect = root.querySelector('[data-detail-option="flavor"]');
      const sizeSelect = root.querySelector('[data-detail-option="size"]');
      const wantedFlavor = flavorSelect ? flavorSelect.value : variant.flavor;
      const wantedSize = sizeSelect ? sizeSelect.value : variant.size;
      const candidates = product.variants.filter(v => v.flavor === wantedFlavor && v.size === wantedSize);
      const next = candidates[0] || product.variants.find(v => v.flavor === wantedFlavor) || product.variants.find(v => v.size === wantedSize) || product.variants[0];
      state.detailVariant = next;
      renderDetail();
    }));
    root.querySelectorAll('[data-detail-qty]').forEach(button => button.addEventListener('click',() => {
      state.detailQty = Math.max(1,Math.min(99,state.detailQty + Number(button.dataset.detailQty)));
      renderDetail();
    }));
    $('detailAdd').addEventListener('click',() => addToCart(variant.id,state.detailQty));
    wireImageFallbacks(root);
  }

  function getVariantRow(id) { return variantById.get(id); }
  function addToCart(variantId,qty) {
    if (!variantById.has(variantId)) return;
    state.cart.set(variantId,(state.cart.get(variantId) || 0) + qty);
    saveCart();
    renderCart();
    const row = getVariantRow(variantId);
    showToast(row.product.name + ' added to your cart');
  }
  function updateCartQuantity(variantId,delta) {
    const next = (state.cart.get(variantId) || 0) + delta;
    if (next < 1) state.cart.delete(variantId); else state.cart.set(variantId,next);
    saveCart(); renderCart();
  }
  function removeCartItem(variantId) { state.cart.delete(variantId); saveCart(); renderCart(); }
  function renderCart() {
    let count = 0;
    let subtotalCents = 0;
    const validRows = [...state.cart.entries()].filter(([id]) => variantById.has(id));
    state.cart = new Map(validRows);
    validRows.forEach(([id,qty]) => { count += qty; subtotalCents += Math.round(variantById.get(id).variant.price * 100) * qty; });
    $('cartCount').textContent = count;
    $('cartLineCount').textContent = '(' + count + ')';
    $('cartSubtotal').textContent = formatMoney(subtotalCents / 100);
    $('pickupOrder').disabled = count === 0;
    $('whatsappOrder').disabled = count === 0;
    $('myBillBookOrder').disabled = count === 0;
    $('myBillBookNote').hidden = count === 0;
    if (!validRows.length) {
      $('cartLines').innerHTML = '<div class="cart-empty">Your cart is empty.<br>Find a product in the catalogue to get started.</div>';
      return;
    }
    $('cartLines').innerHTML = validRows.map(([id,qty]) => {
      const row = variantById.get(id);
      const thumb = row.variant._effectiveImage || row.variant.image;
      return '<div class="cart-line"><div class="cart-thumb">' + (thumb ? '<img data-variant-image="' + esc(id) + '" src="' + esc(thumb) + '" alt="' + esc(imageAlt(row.product,row.variant)) + '" loading="lazy">' : '<span class="placeholder-brand">RS</span>') + '</div><div><h3>' + esc(row.product.name) + '</h3><small>' + esc(row.product.brand) + (variantDescription(row.variant) ? ' · ' + esc(variantDescription(row.variant)) : '') + '</small><div class="quantity-controls"><button type="button" data-cart-step="-1" data-cart-id="' + esc(id) + '" aria-label="Decrease quantity">−</button><span>' + qty + '</span><button type="button" data-cart-step="1" data-cart-id="' + esc(id) + '" aria-label="Increase quantity">+</button><button type="button" class="remove-line" data-remove="' + esc(id) + '">Remove</button></div></div><div class="cart-line-price">' + formatMoney(row.variant.price * qty) + '</div></div>';
    }).join('');
    $('cartLines').querySelectorAll('[data-cart-step]').forEach(button => button.addEventListener('click',() => updateCartQuantity(button.dataset.cartId,Number(button.dataset.cartStep))));
    $('cartLines').querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click',() => removeCartItem(button.dataset.remove)));
    wireImageFallbacks($('cartLines'));
  }
  function buildWhatsAppOrder(intent = 'order') {
    const isPickup = intent === 'pickup';
    const isBulk = intent === 'bulk';
    const lines = [isPickup
      ? 'Hello R.S. Supplements, I would like to reserve this order for pickup at the store:'
      : isBulk
        ? 'Hello R.S. Supplements, I would like to discuss this bulk order:'
        : 'Hello R.S. Supplements, I would like to place this order:'];
    let subtotalCents = 0;
    for (const [id,qty] of state.cart.entries()) {
      const row = variantById.get(id);
      if (!row) continue;
      const details = variantDescription(row.variant);
      lines.push('- ' + row.product.name + (details ? ' — ' + details : '') + ' × ' + qty + ' = ' + formatMoney(row.variant.price * qty));
      subtotalCents += Math.round(row.variant.price * 100) * qty;
    }
    lines.push('Subtotal: ' + formatMoney(subtotalCents / 100));
    lines.push(isPickup
      ? 'Please confirm availability and when I can collect it.'
      : 'Please confirm availability, delivery, and payment details.');
    return 'https://wa.me/919952392499?text=' + encodeURIComponent(lines.join('\n'));
  }

  function renderAll() { renderFeatured(); renderCatalog(); renderCart(); wireImageFallbacks(document); }

  $('searchInput').addEventListener('input',renderCatalog);
  ['brandFilter','categoryFilter','flavorFilter','sizeFilter','sortFilter'].forEach(id => $(id).addEventListener('change',() => { if (id === 'categoryFilter') updateCategoryChip(); renderCatalog(); }));
  $('clearFilters').addEventListener('click',() => {
    $('searchInput').value = '';
    ['brandFilter','categoryFilter','flavorFilter','sizeFilter'].forEach(id => $(id).value = '');
    $('sortFilter').value = 'featured';
    updateCategoryChip(); renderCatalog();
  });
  $('openCart').addEventListener('click',openCart);
  $('closeCart').addEventListener('click',closeCart);
  $('closeDetail').addEventListener('click',() => closeDetail(true));
  overlay.addEventListener('click',() => { closeCart(); closeDetail(true); });
  document.addEventListener('keydown',event => { if (event.key === 'Escape') { closeCart(); closeDetail(true); } });
  $('menuToggle').addEventListener('click',event => {
    const nav = $('mainNav'); const open = nav.classList.toggle('open');
    event.currentTarget.setAttribute('aria-expanded',String(open)); event.currentTarget.textContent = open ? '×' : '☰';
  });
  document.querySelectorAll('#mainNav a').forEach(link => link.addEventListener('click',() => { $('mainNav').classList.remove('open'); $('menuToggle').setAttribute('aria-expanded','false'); $('menuToggle').textContent = '☰'; }));
  $('pickupOrder').addEventListener('click',() => { if (state.cart.size) window.open(buildWhatsAppOrder('pickup'),'_blank','noopener'); });
  $('whatsappOrder').addEventListener('click',() => { if (state.cart.size) window.open(buildWhatsAppOrder('bulk'),'_blank','noopener'); });
  $('myBillBookOrder').addEventListener('click',() => {
    if (state.cart.size) window.open(MYBILLBOOK_STORE_URL,'_blank','noopener');
  });
  window.addEventListener('hashchange',() => {
    const match = location.hash.match(/^#product\/(.+)$/);
    if (match && productById.has(match[1])) openDetail(match[1],productById.get(match[1]).variants[0].id,false);
    else if (detailModal.classList.contains('open')) closeDetail(false);
  });

  initFilters();
  renderAll();
  if (location.hash.startsWith('#product/')) {
    const id = decodeURIComponent(location.hash.slice('#product/'.length));
    if (productById.has(id)) openDetail(id,productById.get(id).variants[0].id,false);
  }
})();
