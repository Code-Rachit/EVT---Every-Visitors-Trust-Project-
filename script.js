/* =========================
   EVT - script.js
   Complete frontend logic:
   - Particles (vibrant Netflix-style)
   - Demo data + localStorage persistence
   - Login/signup (localStorage)
   - Cart system (persistent)
   - Search/Filter/Sort
   - Product detail modal
   - Checkout (mock)
   - Admin DBMS console simulation + SQL log
   - Backup & Restore
   - Toast/popups & scroll reveal
   ========================= */

/* ------------------ UTILS & TOASTS ------------------ */
const toastContainer = (() => {
  const c = document.createElement('div');
  c.id = 'toastContainer';
  c.style.position = 'fixed';
  c.style.right = '20px';
  c.style.bottom = '20px';
  c.style.zIndex = '9999';
  document.body.appendChild(c);
  return c;
})();
function showToast(msg, type = 'info', timeout = 2500) {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.style.marginTop = '8px';
  t.style.padding = '10px 14px';
  t.style.background = type === 'error' ? 'linear-gradient(90deg,#ff5252,#ff1744)' :
                   type === 'success' ? 'linear-gradient(90deg,#4caf50,#388e3c)' :
                   'linear-gradient(90deg,#2196f3,#1e88e5)';
  t.style.color = 'white';
  t.style.borderRadius = '8px';
  t.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
  t.style.fontWeight = '600';
  t.textContent = msg;
  toastContainer.appendChild(t);
  setTimeout(()=> { t.style.transform = 'translateY(-10px)'; t.style.opacity = '0'; }, timeout);
  setTimeout(()=> t.remove(), timeout + 600);
}

/* ------------------ PARTICLES CANVAS ------------------ */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W = canvas.width = innerWidth;
let H = canvas.height = innerHeight;
window.addEventListener('resize', () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; });

class P {
  constructor(){
    this.r = Math.random()*3 + 1;
    this.x = Math.random()*W;
    this.y = Math.random()*H;
    this.vx = (Math.random()-0.5)*0.6;
    this.vy = (Math.random()-0.5)*0.6;
    this.h = Math.floor(Math.random()*360);
    this.alpha = 0.6 + Math.random()*0.4;
  }
  update(){
    this.x += this.vx;
    this.y += this.vy;
    if(this.x < -50) this.x = W + 50;
    if(this.x > W + 50) this.x = -50;
    if(this.y < -50) this.y = H + 50;
    if(this.y > H + 50) this.y = -50;
  }
  draw(){
    ctx.beginPath();
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r*8);
    g.addColorStop(0, `hsla(${this.h},85%,65%,${this.alpha})`);
    g.addColorStop(1, `hsla(${this.h},85%,65%,0)`);
    ctx.fillStyle = g;
    ctx.arc(this.x, this.y, this.r*8, 0, Math.PI*2);
    ctx.fill();
  }
}
let ps = [];
function initParticles(n=90){ ps = []; for(let i=0;i<n;i++) ps.push(new P()); }
function loopParticles(){
  ctx.clearRect(0,0,W,H);
  for(const p of ps){ p.update(); p.draw(); }
  requestAnimationFrame(loopParticles);
}
initParticles(); loopParticles();

/* ------------------ DEMO DATA + PERSISTENCE ------------------ */
const SAMPLE_USERS = [
  { id: 1, name: 'Admin', email: 'admin@evt.com', password: 'admin123', role: 'admin' },
  { id: 2, name: 'Rachit', email: 'user@evt.com', password: 'user123', role: 'user' }
];
// Example product data block (replace your existing demoProducts / SAMPLE_PRODUCTS)
const products = [
  { id: 1, name: "Men’s Jacket", category: "fashion", price: 1299, rating: 4.5, description: "Stylish and warm winter jacket made of premium fabric.", img: "./images/jacket.jpg" },
  { id: 2, name: "Smartphone X", category: "electronics", price: 49999, rating: 4.7, description: "Latest smartphone with AI-powered camera and 5G performance.", img: "./images/phone.jpg" },
  { id: 3, name: "Mixer Grinder Pro", category: "kitchen", price: 2499, rating: 4.3, description: "Powerful 3-jar mixer grinder for all your blending needs.", img: "./images/mixer.jpg" },
  { id: 4, name: "Wooden Furniture", category: "home", price: 5999, rating: 4.2, description: "Premium oakwood chair set with elegant finish.", img: "./images/furniture.jpg" },
  { id: 5, name: "Glow Face Cream", category: "beauty", price: 799, rating: 4.4, description: "Natural glowing face cream with vitamin E and aloe vera.", img: "./images/cream.jpg" },
  { id: 6, name: "Pro Football", category: "sports", price: 999, rating: 4.6, description: "Durable football with grip surface — official size and weight.", img: "./images/ball.jpg" }
];


function renderProducts() {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";

  products.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <div class="product-image">
        <img src="${p.img}" alt="${p.name}" onerror="this.src='./images/default.jpg'">
        <div class="verified-badge">✔ Verified</div>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">₹${p.price}</div>
        <div class="product-rating">⭐ ${p.rating}</div>
        <div class="product-actions">
          <button class="add-to-cart-btn" onclick="addToCart(${p.id})">Add to Cart</button>
          <button class="view-details-btn" onclick="showProductDetails(${p.id})">View Details</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", renderProducts);

function showProductDetails(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  document.getElementById("modalProductImage").src = product.img;
  document.getElementById("modalProductName").textContent = product.name;
  document.getElementById("modalProductDesc").textContent = product.description;
  document.getElementById("modalProductPrice").textContent = `Price: ₹${product.price}`;

  document.getElementById("modalAddToCart").onclick = () => addToCart(id);

  document.getElementById("productModal").style.display = "flex";
}

function closeProductModal() {
  document.getElementById("productModal").style.display = "none";
  document.getElementById("modalBuyNow").onclick = () => proceedToCheckout(id);

}

let currentCheckoutProduct = null;

function proceedToCheckout(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  currentCheckoutProduct = product;

  const html = `
    <img src="${product.img}" class="modal-product-img" alt="${product.name}">
    <h3>${product.name}</h3>
    <p><strong>Price:</strong> ₹${product.price}</p>
    <p><strong>Total (incl. tax):</strong> ₹${(product.price * 1.18).toFixed(2)}</p>
  `;
  document.getElementById("checkoutDetails").innerHTML = html;

  document.getElementById("checkoutModal").style.display = "flex";
}

function closeCheckout() {
  document.getElementById("checkoutModal").style.display = "none";
}

function confirmOrder() {
  if (!currentCheckoutProduct) return;

  const orderId = "EVT" + Math.floor(Math.random() * 1000000);
  document.getElementById("checkoutDetails").innerHTML = `
    <h3>🎉 Order Confirmed!</h3>
    <p>Thank you for purchasing <strong>${currentCheckoutProduct.name}</strong>.</p>
    <p>Your Order ID: <strong>${orderId}</strong></p>
    <p>We’ll notify you when your product ships. 💌</p>
  `;
}


// ✅ Function to Render Products Dynamically
function renderProducts() {
  const grid = document.getElementById("productGrid");
  console.log("Rendering products...", products);
  grid.innerHTML = ""; // Clear previous content if any

  products.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    card.innerHTML = `
      <div class="product-image" onclick="openImage('${p.img}', '${p.name}')">
        <img src="${p.img}" alt="${p.name}" onerror="this.src='images/default.jpg'">
        <div class="verified-badge">✔ Verified</div>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-seller">By ${p.seller}</div>
        <div class="product-rating">⭐ ${p.rating}</div>
        <div class="product-price">₹${p.price}</div>
        <div class="product-actions">
          <button class="add-to-cart-btn" onclick="addToCart(${p.id})">Add to Cart</button>
          <button class="view-details-btn" onclick="viewProduct(${p.id})">View Details</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}



function ensureInitialData(){
  if(!localStorage.getItem('evt_users')) localStorage.setItem('evt_users', JSON.stringify(SAMPLE_USERS));
  if(!localStorage.getItem('products')) localStorage.setItem('products', JSON.stringify(SAMPLE_PRODUCTS));
  if(!localStorage.getItem('evtCart')) localStorage.setItem('evtCart', JSON.stringify([]));
  if(!localStorage.getItem('sqlLog')) localStorage.setItem('sqlLog', JSON.stringify([]));
}
ensureInitialData();

/* ------------------ AUTH (LOGIN / SIGNUP) ------------------ */
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');

function openModal(){ loginModal.classList.add('show'); }
function closeModal(){ loginModal.classList.remove('show'); }

function setSession(user){
  localStorage.setItem('evtUser', JSON.stringify(user));
  loginBtn.innerHTML = `<i class='fas fa-user'></i> ${user.name}`;
  loginBtn.onclick = () => openAccountMenu();
}

function clearSession(){
  localStorage.removeItem('evtUser');
  loginBtn.innerHTML = `<i class='fas fa-sign-in-alt'></i> Login`;
  loginBtn.onclick = () => openModal();
}

function initSessionUI(){
  const u = JSON.parse(localStorage.getItem('evtUser') || 'null');
  if(u) setSession(u);
  else clearSession();
}
initSessionUI();

function handleLogin(e){
  e.preventDefault();
  const em = document.getElementById('email').value.trim().toLowerCase();
  const pw = document.getElementById('password').value.trim();
  const users = JSON.parse(localStorage.getItem('evt_users'));
  const found = users.find(u => u.email === em && u.password === pw);
  if(found){
    setSession(found);
    showToast(`Welcome, ${found.name}!`, 'success');
    closeModal();
    logSQL(`-- LOGIN: SELECT * FROM users WHERE email='${em}'; -- Result: Found id=${found.id}`);
  } else {
    // Auto-create account for demo if email not found
    const emailExists = users.some(u => u.email === em);
    if(!emailExists){
      const newId = users[users.length-1].id + 1;
      const newUser = { id: newId, name: em.split('@')[0], email: em, password: pw, role: 'user' };
      users.push(newUser);
      localStorage.setItem('evt_users', JSON.stringify(users));
      setSession(newUser);
      showToast(`Account created & logged in as ${newUser.name}`, 'success');
      logSQL(`INSERT INTO users (id, name, email) VALUES (${newId}, '${newUser.name}', '${em}');`);
      closeModal();
    } else {
      showToast('Invalid credentials', 'error');
    }
  }
}

/* OPEN ACCOUNT MENU (small popup) */
function openAccountMenu(){
  const div = document.createElement('div');
  div.className = 'account-popup';
  div.style.position = 'fixed';
  div.style.right = '20px';
  div.style.top = '70px';
  div.style.background = 'rgba(255,255,255,0.95)';
  div.style.border = '1px solid rgba(0,0,0,0.06)';
  div.style.padding = '12px';
  div.style.borderRadius = '10px';
  div.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
  div.style.zIndex = 4000;
  const u = JSON.parse(localStorage.getItem('evtUser'));
  div.innerHTML = `<strong>${u.name}</strong><br><small>${u.email}</small><br><hr style="margin:8px 0"><button onclick="openAdminIfAdmin()" class="mini-btn">Admin Console</button> <button onclick="logout()" class="mini-btn">Logout</button>`;
  document.body.appendChild(div);
  setTimeout(()=> document.addEventListener('click', removeAccountMenu, {once:true}), 50);
  function removeAccountMenu(e){
    if(!div.contains(e.target)) div.remove();
  }
}
function logout(){
  clearSession();
  showToast('Logged out', 'info');
  document.querySelectorAll('.account-popup').forEach(x=>x.remove());
}

/* ADMIN QUICK ACCESS */
function openAdminIfAdmin(){
  const u = JSON.parse(localStorage.getItem('evtUser') || 'null');
  if(u && u.role === 'admin'){
    openAdminConsole();
    document.querySelectorAll('.account-popup').forEach(x=>x.remove());
  } else {
    showToast('Admin access only', 'error');
  }
}

/* ------------------ PRODUCTS RENDER + SEARCH/FILTER/SORT ------------------ */
const productsGrid = document.getElementById('productsGrid');
const sortSelect = document.getElementById('sortSelect');

function getProducts(){ return JSON.parse(localStorage.getItem('products') || '[]'); }

function renderProducts(list){
  productsGrid.innerHTML = '';
  if(!list || list.length === 0){
    const p = document.createElement('p');
    p.textContent = 'No products found.';
    p.style.gridColumn = '1/-1';
    p.style.textAlign = 'center';
    p.style.color = '#777';
    productsGrid.appendChild(p);
    return;
  }
  for(const p of list){
    const card = document.createElement('div'); card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">${p.img}
        <div class="verified-badge">✔</div>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-seller">by ${p.seller}</div>
        <div class="product-rating"><span class="stars">⭐ ${p.rating}</span></div>
        <div class="product-price">₹${p.price}</div>
        <div class="product-actions">
          <button class="add-to-cart-btn">Add to Cart</button>
          <button class="view-details-btn">View</button>
        </div>
      </div>`;
    // Add handlers
    card.querySelector('.add-to-cart-btn').addEventListener('click', ()=> addToCart(p.id));
    card.querySelector('.view-details-btn').addEventListener('click', ()=> openProductModal(p.id));
    productsGrid.appendChild(card);
  }
}

/* Initial render */
renderProducts(getProducts());

/* SEARCH */
function searchProducts(){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const all = getProducts();
  const res = all.filter(p => {
    return p.name.toLowerCase().includes(q) ||
           p.category.toLowerCase().includes(q) ||
           p.seller.toLowerCase().includes(q) ||
           (p.desc && p.desc.toLowerCase().includes(q));
  });
  renderProducts(res);
  if(res.length) {
    window.location.hash = '#products';
    document.getElementById('productsGrid').scrollIntoView({ behavior:'smooth' });
  }
}

/* FILTER BY CATEGORY */
function filterByCategory(cat){
  const all = getProducts();
  const res = all.filter(p=>p.category === cat);
  renderProducts(res);
  window.location.hash = '#products';
  document.getElementById('productsGrid').scrollIntoView({ behavior:'smooth' });
  showToast(`Filtered by ${cat}`, 'info');
}

/* SORTING */
function sortProducts(type){
  let all = getProducts().slice();
  if(type === 'price-low') all.sort((a,b)=>a.price-b.price);
  else if(type === 'price-high') all.sort((a,b)=>b.price-a.price);
  else if(type === 'rating') all.sort((a,b)=>b.rating-a.rating);
  else if(type === 'newest') all.sort((a,b)=>b.createdAt - a.createdAt);
  renderProducts(all);
}

/* ------------------ PRODUCT DETAILS MODAL ------------------ */
const productModal = document.getElementById('productModal');
function openProductModal(id){
  const p = getProducts().find(x=>x.id===id);
  const holder = document.getElementById('productDetails');
  holder.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div style="font-size:4rem;text-align:center">${p.img}</div>
      <div style="text-align:left">
        <h3 style="margin:0">${p.name} <span style="font-size:0.9rem;color:#666">by ${p.seller}</span></h3>
        <p style="color:#666;margin:6px 0">${p.desc}</p>
        <div style="display:flex;gap:12px;align-items:center"><strong style="color:#e53935;font-size:1.4rem">₹${p.price}</strong><span style="color:#999">Rating: ${p.rating}</span><span style="color:#999">Stock: ${p.stock}</span></div>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="add-to-cart-btn">Add to Cart</button>
        <button class="view-details-btn" onclick="closeProductModal()">Close</button>
      </div>
    </div>`;
  productModal.classList.add('show');
  // add-to-cart inside modal
  holder.querySelector('.add-to-cart-btn').addEventListener('click', ()=> { addToCart(p.id); closeProductModal(); });
}
function closeProductModal(){ productModal.classList.remove('show'); }

function openImage(src, caption = '') {
  const modal = document.getElementById('imageModal');
  const img = document.getElementById('modalImage');
  const cap = document.getElementById('imageCaption');
  img.src = src;
  cap.textContent = caption;
  modal.classList.add('show');      // if you use .modal.show to display
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');

  // allow ESC to close
  function escClose(e){
    if(e.key === 'Escape'){ closeImage(); document.removeEventListener('keydown', escClose); }
  }
  document.addEventListener('keydown', escClose);
}

function closeImage(){
  const modal = document.getElementById('imageModal');
  modal.classList.remove('show');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  document.getElementById('modalImage').src = '';
  document.getElementById('imageCaption').textContent = '';
}


/* ------------------ CART (Advanced) ------------------ */
let cart = JSON.parse(localStorage.getItem('evtCart') || '[]');

function saveCart(){
  localStorage.setItem('evtCart', JSON.stringify(cart));
  renderCart();
}

function addToCart(id){
  const prod = getProducts().find(p => p.id === id);
  if(!prod) { showToast('Product not found', 'error'); return; }
  if(prod.stock <= 0) { showToast('Out of stock', 'error'); return; }
  const item = cart.find(i => i.id === id);
  if(item){
    if(item.qty + 1 > prod.stock){ showToast('Stock limit reached', 'error'); return; }
    item.qty++;
  } else {
    cart.push({ id: prod.id, name: prod.name, price: prod.price, img: prod.img, qty: 1 });
  }
  saveCart();
  showToast(`${prod.name} added to cart`, 'success');
  logSQL(`INSERT INTO cart (user_id, product_id, quantity) VALUES (CURRENT_USER, ${id}, 1);`);
}

function removeItem(id){
  cart = cart.filter(i=>i.id !== id);
  saveCart();
}

function changeQty(id, delta){
  const it = cart.find(i=>i.id===id);
  if(!it) return;
  const prod = getProducts().find(p=>p.id===id);
  it.qty += delta;
  if(it.qty <= 0) removeItem(id);
  if(it.qty > prod.stock){ it.qty = prod.stock; showToast('Stock limit', 'error'); }
  saveCart();
}

function renderCart(){
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const countEl = document.getElementById('cartCount');
  container.innerHTML = '';
  let total = 0;
  if(cart.length === 0){
    container.innerHTML = `<div class="empty-cart"><i class="fas fa-box-open"></i><p>Your cart is empty</p></div>`;
  } else {
    for(const i of cart){
      total += i.price * i.qty;
      const el = document.createElement('div'); el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item-image">${i.img}</div>
        <div class="cart-item-details">
          <div class="cart-item-name">${i.name}</div>
          <div class="cart-item-price">₹${i.price * i.qty}</div>
          <div class="cart-item-quantity">
            <button class="qty-btn">-</button>
            <span style="min-width:28px;text-align:center;display:inline-block">${i.qty}</span>
            <button class="qty-btn">+</button>
          </div>
        </div>
        <button class="remove-item-btn">Remove</button>
      `;
      // handlers
      el.querySelectorAll('.qty-btn')[0].addEventListener('click', ()=> changeQty(i.id, -1));
      el.querySelectorAll('.qty-btn')[1].addEventListener('click', ()=> changeQty(i.id, 1));
      el.querySelector('.remove-item-btn').addEventListener('click', ()=> removeItem(i.id));
      container.appendChild(el);
    }
  }
  totalEl.textContent = `₹${total}`;
  countEl.textContent = cart.reduce((a,b)=>a+b.qty, 0);
  localStorage.setItem('evtCart', JSON.stringify(cart));
}

/* OPEN / CLOSE CART */
function openCart(){ document.getElementById('cartSidebar').classList.add('active'); renderCart(); }
function closeCart(){ document.getElementById('cartSidebar').classList.remove('active'); }

/* CHECKOUT (mock) */
function proceedToCheckout(){
  const user = JSON.parse(localStorage.getItem('evtUser') || 'null');
  if(!user){ showToast('Please login to checkout', 'error'); openModal(); return; }
  if(cart.length === 0){ showToast('Cart is empty', 'error'); return; }
  // validate stock
  const products = getProducts();
  for(const it of cart){
    const p = products.find(x=>x.id===it.id);
    if(!p || p.stock < it.qty){ showToast(`Insufficient stock for ${it.name}`, 'error'); return; }
  }
  // reduce stock (simulate order)
  for(const it of cart){
    const p = products.find(x=>x.id===it.id);
    p.stock -= it.qty;
    logSQL(`UPDATE products SET stock = ${p.stock} WHERE id = ${p.id};`);
  }
  localStorage.setItem('products', JSON.stringify(products));
  // create "order" (mock)
  const order = {
    id: Date.now(),
    userId: user.id,
    items: cart,
    total: cart.reduce((a,b)=>a+b.price*b.qty, 0),
    createdAt: Date.now()
  };
  // append to localStorage orders
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  logSQL(`INSERT INTO orders (...) VALUES (...); -- mock order id ${order.id}`);
  showToast('Order placed successfully!', 'success');
  // clear cart
  cart = []; saveCart(); closeCart();
  renderProducts(getProducts()); // refresh UI stock
}

/* ------------------ ADMIN: SQL LOG + DBMS CONSOLE SIM ------------------ */
function logSQL(q){
  const log = JSON.parse(localStorage.getItem('sqlLog') || '[]');
  log.unshift({ q, at: new Date().toLocaleString() });
  localStorage.setItem('sqlLog', JSON.stringify(log.slice(0,200)));
}
function openAdminConsole(){
  // Build a modal-like admin console (simple)
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.left = '50%';
  modal.style.top = '50%';
  modal.style.transform = 'translate(-50%,-50%)';
  modal.style.width = '900px';
  modal.style.maxWidth = '95%';
  modal.style.height = '70vh';
  modal.style.zIndex = 5000;
  modal.style.background = 'rgba(255,255,255,0.98)';
  modal.style.borderRadius = '12px';
  modal.style.boxShadow = '0 12px 60px rgba(0,0,0,0.25)';
  modal.style.padding = '16px';
  modal.id = 'adminConsole';
  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3>Admin Console - Simulated DBMS</h3>
      <div><button id="adminClose" class="mini-btn">Close</button></div>
    </div>
    <div style="display:flex;gap:12px;margin-top:12px;height:calc(100% - 70px);">
      <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
        <textarea id="sqlInput" placeholder="Type SQL here (simulated)..." style="flex:1;padding:10px;border-radius:8px;border:1px solid #eee"></textarea>
        <div style="display:flex;gap:8px;">
          <button id="runSqlBtn" class="mini-btn">Run SQL</button>
          <button id="refreshSql" class="mini-btn">Refresh Log</button>
          <button id="exportBackup" class="mini-btn">Export Backup</button>
          <button id="importBackupBtn" class="mini-btn">Import Backup</button>
          <input id="importFile" type="file" accept="application/json" style="display:none" />
        </div>
      </div>
      <div style="width:420px;overflow:auto;background:#f7f9fc;padding:10px;border-radius:8px;">
        <h4>SQL Log</h4>
        <div id="sqlLogArea" style="font-family:monospace;font-size:13px;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('adminClose').addEventListener('click', ()=> modal.remove());
  document.getElementById('runSqlBtn').addEventListener('click', runSimulatedSQL);
  document.getElementById('refreshSql').addEventListener('click', refreshSQLLog);
  document.getElementById('exportBackup').addEventListener('click', exportBackup);
  document.getElementById('importBackupBtn').addEventListener('click', ()=> document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', handleImportFile);
  refreshSQLLog();
}

function runSimulatedSQL(){
  const q = document.getElementById('sqlInput').value.trim();
  if(!q) { showToast('Type an SQL query to run (simulated)', 'info'); return; }
  // Very basic parser to simulate a few statements
  const L = q.toLowerCase();
  let res = '';
  try {
    if(L.startsWith('select')){
      if(L.includes('* from products')) {
        res = JSON.stringify(getProducts(), null, 2);
      } else if(L.includes('* from users')) {
        res = JSON.stringify(JSON.parse(localStorage.getItem('evt_users')||'[]'), null, 2);
      } else if(L.includes('* from cart')) {
        res = JSON.stringify(JSON.parse(localStorage.getItem('evtCart')||'[]'), null, 2);
      } else {
        res = 'Simulated select executed. (custom result)';
      }
    } else if(L.startsWith('insert') || L.startsWith('update') || L.startsWith('delete')){
      // log only, simulate success
      res = 'Statement executed (simulated).';
    } else {
      res = 'Statement parsed (simulated).';
    }
    logSQL(q);
    refreshSQLLog();
    document.getElementById('sqlInput').value = '';
    showToast('SQL executed (simulated)', 'success');
  } catch(err){
    showToast('Error executing SQL', 'error');
    logSQL('-- ERROR: ' + err.message);
  }
}

function refreshSQLLog(){
  const log = JSON.parse(localStorage.getItem('sqlLog')||'[]');
  const area = document.getElementById('sqlLogArea');
  if(!area) return;
  area.innerHTML = log.map(l => `<div style="margin-bottom:8px"><strong style="color:#333">${l.at}</strong><pre style="background:#fff;padding:8px;border-radius:6px;border:1px solid #eee">${l.q}</pre></div>`).join('');
}

/* ------------------ BACKUP & RESTORE ------------------ */
function exportBackup(){
  const data = {
    users: JSON.parse(localStorage.getItem('evt_users') || '[]'),
    products: JSON.parse(localStorage.getItem('products') || '[]'),
    cart: JSON.parse(localStorage.getItem('evtCart') || '[]'),
    orders: JSON.parse(localStorage.getItem('orders') || '[]'),
    sqlLog: JSON.parse(localStorage.getItem('sqlLog') || '[]')
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `evt_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Backup exported', 'success');
}

function handleImportFile(e){
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = function(ev){
    try {
      const json = JSON.parse(ev.target.result);
      if(confirm('Importing will overwrite current data. Continue?')){
        if(json.users) localStorage.setItem('evt_users', JSON.stringify(json.users));
        if(json.products) localStorage.setItem('products', JSON.stringify(json.products));
        if(json.cart) localStorage.setItem('evtCart', JSON.stringify(json.cart));
        if(json.orders) localStorage.setItem('orders', JSON.stringify(json.orders));
        if(json.sqlLog) localStorage.setItem('sqlLog', JSON.stringify(json.sqlLog));
        showToast('Backup imported', 'success');
        renderProducts(getProducts());
        cart = JSON.parse(localStorage.getItem('evtCart') || '[]'); saveCart();
      }
    } catch(err){
      showToast('Invalid JSON file', 'error');
    }
  };
  reader.readAsText(f);
}

/* ------------------ BACKUP BUTTONS (simple helpers) ------------------ */
document.addEventListener('keydown', (e) => {
  // Ctrl+B to export quick backup (demo)
  if(e.ctrlKey && e.key.toLowerCase() === 'b'){ e.preventDefault(); exportBackup(); }
});

/* ------------------ SCROLL REVEAL (data-animate) ------------------ */
const observer = new IntersectionObserver(entries => {
  entries.forEach(ent => {
    if(ent.isIntersecting) ent.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

/* ------------------ INIT UI + HOOKS ------------------ */
document.getElementById('loginBtn').addEventListener('click', openModal);
document.querySelectorAll('.close-btn').forEach(b => b.addEventListener('click', closeModal));
document.getElementById('searchInput').addEventListener('keyup', (e) => { if(e.key === 'Enter') searchProducts(); });

document.querySelectorAll('.category-card').forEach(c => {
  c.addEventListener('click', ()=> {
    const t = c.querySelector('h3').textContent.toLowerCase().split('&')[0].trim();
    filterByCategory(t === 'home' ? 'home' : t);
  });
});

/* product modal close */
document.getElementById('productModal').addEventListener('click', (e) => {
  if(e.target === document.getElementById('productModal')) closeProductModal();
});

/* cart sidebar close on overlay click (optional) */
document.getElementById('cartSidebar').addEventListener('click', (e) => {
  if(e.target === document.getElementById('cartSidebar')) closeCart();
});

/* login form hookup */
document.querySelector('#loginModal form').addEventListener('submit', handleLogin);

/* small UI cosmetic: update cart count and render periodically */
setInterval(()=> { renderCart(); renderProducts(getProducts()); }, 1500);

/* initial render */
renderProducts(getProducts());
renderCart();

/* ------------------ HELPER: open Admin Console (public) ------------------ */
window.openAdminConsole = openAdminConsole;

/* ------------------ GUIDE / DEMO HELPER ------------------ */
function showDemoGuide(){
  const guide = `
EVT DEMO QUICK START GUIDE
--------------------------
1) Demo Accounts:
   - Admin: admin@evt.com / admin123
   - User: user@evt.com / user123
   (Login via the Login button.)

2) Search / Filter:
   - Use search box to search name, category, description, seller.
   - Click category cards to filter by the 6 categories.
   - Use Sort dropdown to sort by price, rating, newest.

3) Product Details:
   - Click 'View' to open product details modal.
   - Inside modal you can add the product to cart.

4) Cart:
   - Click cart icon to open slide-in cart.
   - Use +/- to change quantities, Remove to discard item.
   - Proceed to Checkout to place a mock order (will deduct stock).

5) Admin / DBMS Simulation:
   - Login as Admin, click on the user button and choose 'Admin Console'
   - Run SELECT queries like: SELECT * FROM products;
   - Use Export Backup and Import Backup to demonstrate DB import/export.
   - SQL Log shows simulated SQL statements executed during actions.

6) Backup:
   - Press Ctrl+B to export a quick backup JSON file.

7) Extra:
   - Click Login and try sign-up with an email not present: it auto-creates a demo account.
   - Use the DBMS Console to run simple SELECT statements to show product/user lists.

Press OK to continue.
  `;
  alert(guide);
}
window.showDemoGuide = showDemoGuide;

// Pop-up Modals for Footer Links
function openStory() { document.getElementById("storyModal").style.display = "flex"; }
function closeStory() { document.getElementById("storyModal").style.display = "none"; }

function openCareers() { document.getElementById("careerModal").style.display = "flex"; }
function closeCareers() { document.getElementById("careerModal").style.display = "none"; }

function openSeller() { document.getElementById("sellerModal").style.display = "flex"; }
function closeSeller() { document.getElementById("sellerModal").style.display = "none"; }

function openSafety() {
  document.getElementById("safetyModal").style.display = "flex";
}
function closeSafety() {
  document.getElementById("safetyModal").style.display = "none";
}

// ✅ Load all products when page opens
document.addEventListener("DOMContentLoaded", renderProducts);

// ===== EVT Cart System =====

function addToCart(index) {
  const product = allProducts[index];
  const existing = cart.find(item => item.name === product.name);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const cartCount = document.getElementById("cartCount");

  let html = "";
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = `<p>Your cart is empty</p>`;
    cartTotal.textContent = "₹0";
    cartCount.textContent = "0";
    return;
  }

  cart.forEach((item, i) => {
    total += item.price * item.qty;
    html += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" style="width:60px;height:60px;border-radius:8px;">
        <div class="cart-item-details">
          <p>${item.name}</p>
          <p>₹${item.price} × ${item.qty}</p>
        </div>
        <div>
          <button onclick="changeQty(${i}, -1)">−</button>
          <button onclick="changeQty(${i}, 1)">+</button>
          <button onclick="removeItem(${i})">🗑</button>
        </div>
      </div>
    `;
  });

  cartItems.innerHTML = html;
  cartTotal.textContent = "₹" + total;
  cartCount.textContent = cart.length;
}

function changeQty(i, delta) {
  cart[i].qty += delta;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  updateCart();
}

function removeItem(i) {
  cart.splice(i, 1);
  updateCart();
}

function toggleCart() {
  document.getElementById("cartSidebar").classList.toggle("active");
}

function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  alert("🎉 Order placed successfully! Thank you for shopping with EVT.");
  cart = [];
  updateCart();
  toggleCart();
}


// ===== PRODUCT DATA =====
const allProducts = [
  { name: "Winter Jacket", price: 1999, category: "fashion", image: "images/jacket.jpg" },
  { name: "Smart Phone", price: 24999, category: "electronics", image: "images/phone.jpg" },
  { name: "Mixer Grinder", price: 2999, category: "kitchen", image: "images/mixer.jpg" },
  { name: "Wooden Furniture", price: 4999, category: "home", image: "images/funiture.jpg" },
  { name: "Beauty Cream", price: 799, category: "beauty", image: "images/cream.jpg" },
  { name: "Sports Ball", price: 499, category: "sports", image: "images/ball.jpg" }
];

let filteredProducts = [...allProducts];

// ===== RENDER PRODUCTS =====
function renderProducts(products) {
  const container = document.getElementById("productsGrid");
  container.innerHTML = "";

  products.forEach((p) => {
    container.innerHTML += `
      <div class="product-card">
        <div class="product-image">
          <img src="${p.image}" alt="${p.name}" style="width:100%; height:250px; object-fit:cover;">
        </div>
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-seller">EVT ${p.category.charAt(0).toUpperCase() + p.category.slice(1)}</p>
          <p class="product-price">₹${p.price}</p>
          <div class="product-actions">
            <button class="add-to-cart-btn" onclick="addToCart('${p.name}', ${p.price}, '${p.image}')">Add to Cart</button>
            <button class="view-details-btn">View Details</button>
          </div>
        </div>
      </div>`;
  });
}

// ===== FILTER BY CATEGORY =====
function filterByCategory(category) {
  filteredProducts = allProducts.filter(p => p.category === category);
  renderProducts(filteredProducts);

  // Auto-scroll to the products section
  document.querySelector('#products').scrollIntoView({ behavior: 'smooth' });
}

// ===== SORT PRODUCTS =====
function sortProducts(type) {
  if (type === "price-low") filteredProducts.sort((a, b) => a.price - b.price);
  else if (type === "price-high") filteredProducts.sort((a, b) => b.price - a.price);
  else if (type === "rating") alert("⭐ Ratings filter will be added soon!");
  else if (type === "newest") filteredProducts.reverse();

  renderProducts(filteredProducts);
}

// ===== INITIAL RENDER =====
document.addEventListener("DOMContentLoaded", () => {
  renderProducts(allProducts);
});


/* ------------------ END OF SCRIPT ------------------ */