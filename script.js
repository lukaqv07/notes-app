const products = [
  {id:1,name:"E-Ride City Pro",category:"City",description:"Urban comfort. Maximum range.",price:1899,oldPrice:2199,badge:"Bestseller",rating:4.9,reviews:48,image:"https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=85"},
  {id:2,name:"E-Ride Mountain X",category:"Mountain",description:"Power for every trail.",price:2199,oldPrice:2499,badge:"−12%",rating:4.8,reviews:36,image:"https://images.unsplash.com/photo-1544191696-15693072a0e6?auto=format&fit=crop&w=800&q=85"},
  {id:3,name:"E-Ride Trek 800",category:"Trekking",description:"Go further, explore more.",price:1799,oldPrice:null,badge:"New",rating:4.7,reviews:24,image:"https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=85"},
  {id:4,name:"E-Ride Fold Mini",category:"Folding",description:"Big possibilities. Small size.",price:1199,oldPrice:1349,badge:"−10%",rating:4.6,reviews:19,image:"https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=85"},
  {id:5,name:"E-Ride City Lite",category:"City",description:"Your daily commute, upgraded.",price:1499,oldPrice:null,badge:"Popular",rating:4.7,reviews:31,image:"https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=85"},
  {id:6,name:"E-Ride Trail Pro",category:"Mountain",description:"Confident control on rough terrain.",price:2699,oldPrice:2999,badge:"−10%",rating:4.9,reviews:27,image:"https://images.unsplash.com/photo-1544191696-15693072a0e6?auto=format&fit=crop&w=800&q=85"},
  {id:7,name:"E-Ride Tour 500",category:"Trekking",description:"Comfort built for longer days.",price:1999,oldPrice:null,badge:"New",rating:4.8,reviews:15,image:"https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=800&q=85"},
  {id:8,name:"E-Ride Fold Go",category:"Folding",description:"Easy to store. Ready to roll.",price:999,oldPrice:1149,badge:"−13%",rating:4.5,reviews:22,image:"https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=85"}
];
const $ = s => document.querySelector(s);
const money = n => new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);
let cart = [];
let favorites = new Set();
let currentCategory = "All";
let searchTerm = "";
let showAll = false;
let toastTimer;

function toast(message) {
  const el = $("#toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2300);
}
function productCard(p) {
  const fav = favorites.has(p.id);
  return `<article class="product-card">
    <div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy"><span class="product-badge ${p.badge.includes("%")||p.badge.includes("−")?"sale":""}">${p.badge}</span>
    <button class="favorite-btn ${fav?"active":""}" data-favorite="${p.id}" aria-label="${fav?"Remove from":"Add to"} favorites">${fav?"♥":"♡"}</button></div>
    <div class="product-info"><h3>${p.name}</h3><p class="description">${p.description}</p>
    <div class="product-bottom"><div><div class="price-line"><span class="price">${money(p.price)}</span>${p.oldPrice?`<span class="old-price">${money(p.oldPrice)}</span>`:""}</div>
    <div class="rating" aria-label="${p.rating} out of 5 stars">★★★★★ <span>(${p.reviews})</span></div></div>
    <button class="add-cart" data-add="${p.id}" aria-label="Add ${p.name} to cart" title="Add to cart">🛒</button></div></div></article>`;
}
function renderProducts() {
  let list = products.filter(p => {
    const matchesCategory = currentCategory === "All" || p.category === currentCategory;
    const matchesSearch = `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFav = !favoritesOnly || favorites.has(p.id);
    return matchesCategory && matchesSearch && matchesFav;
  });
  const sort = $("#sortSelect").value;
  if(sort==="price-low") list.sort((a,b)=>a.price-b.price);
  if(sort==="price-high") list.sort((a,b)=>b.price-a.price);
  if(sort==="name") list.sort((a,b)=>a.name.localeCompare(b.name));
  if(!showAll && currentCategory==="All" && !searchTerm && !favoritesOnly) list = list.slice(0,4);
  $("#productGrid").innerHTML = list.map(productCard).join("");
  $("#emptyState").hidden = list.length > 0;
  $("#resultsLabel").textContent = favoritesOnly ? "Your saved rides" : currentCategory==="All" ? (searchTerm ? `${list.length} matching product${list.length===1?"":"s"}` : "Our most-loved rides") : `${currentCategory} e-bikes`;
  $("#viewAllBtn").textContent = showAll ? "Featured only ↑" : "View all →";
}
let favoritesOnly = false;
function updateCounts() {
  $("#favoriteCount").textContent = favorites.size;
  $("#cartCount").textContent = cart.reduce((sum,item)=>sum+item.qty,0);
  $("#drawerCartCount").textContent = `(${cart.reduce((sum,item)=>sum+item.qty,0)})`;
}
function renderCart() {
  const count = cart.reduce((sum,item)=>sum+item.qty,0);
  $("#cartItems").innerHTML = cart.map(item => `<div class="cart-item">
    <img src="${item.image}" alt="${item.name}"><div><h3>${item.name}</h3><p>${money(item.price)}</p>
    <div class="qty-controls"><button data-qty="${item.id}" data-change="-1" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button data-qty="${item.id}" data-change="1" aria-label="Increase quantity">+</button></div></div>
    <button class="remove-item" data-remove="${item.id}" aria-label="Remove ${item.name}">✕</button></div>`).join("");
  $("#cartEmpty").style.display = count ? "none" : "block";
  $("#cartSummary").hidden = !count;
  $("#cartSubtotal").textContent = money(cart.reduce((sum,item)=>sum+item.price*item.qty,0));
  updateCounts();
}
function openCart(){ $("#cartDrawer").classList.add("open"); $("#drawerBackdrop").classList.add("open"); $("#cartDrawer").setAttribute("aria-hidden","false"); document.body.classList.add("drawer-open"); }
function closeCart(){ $("#cartDrawer").classList.remove("open"); $("#drawerBackdrop").classList.remove("open"); $("#cartDrawer").setAttribute("aria-hidden","true"); document.body.classList.remove("drawer-open"); }

$("#productGrid").addEventListener("click", e => {
  const favBtn = e.target.closest("[data-favorite]");
  const addBtn = e.target.closest("[data-add]");
  if(favBtn){const id=Number(favBtn.dataset.favorite);favorites.has(id)?favorites.delete(id):favorites.add(id);updateCounts();renderProducts();return;}
  if(addBtn){const p=products.find(x=>x.id===Number(addBtn.dataset.add));const existing=cart.find(x=>x.id===p.id);existing?existing.qty++:cart.push({...p,qty:1});renderCart();toast(`${p.name} added to cart`);}
});
$("#cartItems").addEventListener("click",e=>{
  const qty=e.target.closest("[data-qty]"); const remove=e.target.closest("[data-remove]");
  if(qty){const item=cart.find(x=>x.id===Number(qty.dataset.qty));item.qty+=Number(qty.dataset.change);if(item.qty<=0)cart=cart.filter(x=>x.id!==item.id);renderCart();}
  if(remove){cart=cart.filter(x=>x.id!==Number(remove.dataset.remove));renderCart();}
});
$("#searchInput").addEventListener("input",e=>{searchTerm=e.target.value.trim();favoritesOnly=false;currentCategory="All";showAll=true;renderProducts();});
$("#searchBtn").addEventListener("click",()=>{$("#bikes").scrollIntoView({behavior:"smooth"});$("#searchInput").focus();});
$("#sortSelect").addEventListener("change",renderProducts);
$("#viewAllBtn").addEventListener("click",()=>{showAll=!showAll;renderProducts();});
document.querySelectorAll(".category-card").forEach(card=>card.addEventListener("click",()=>{currentCategory=card.dataset.category;searchTerm="";favoritesOnly=false;showAll=true;$("#searchInput").value="";renderProducts();}));
$("#favoritesBtn").addEventListener("click",()=>{favoritesOnly=!favoritesOnly;currentCategory="All";searchTerm="";showAll=true;$("#searchInput").value="";renderProducts();$("#bikes").scrollIntoView({behavior:"smooth"});if(favoritesOnly)toast("Showing your saved rides");});
$("#cartBtn").addEventListener("click",openCart);$("#closeCart").addEventListener("click",closeCart);$("#drawerBackdrop").addEventListener("click",closeCart);
$("#continueShopping").addEventListener("click",closeCart);
$("#checkoutBtn").addEventListener("click",()=>toast("Demo checkout — connect a payment provider to accept orders."));
$("#accountBtn").addEventListener("click",()=>toast("Customer accounts can be added with a backend."));
$("#mobileMenu").addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
document.querySelectorAll(".main-nav a").forEach(a=>a.addEventListener("click",()=>$("#mainNav").classList.remove("open")));
$("#newsletterForm").addEventListener("submit",e=>{e.preventDefault();$("#newsletterNote").textContent="Thanks for subscribing! (Demo only)";$("#newsletterEmail").value="";});
renderProducts();renderCart();
