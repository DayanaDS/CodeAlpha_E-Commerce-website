const products = [
  {name:'Red Summer Dress',price:1250,image:'red summer dress.jpg',category:'clothing',tag:'Summer favorite'},
  {name:'Saree',price:2000,image:'saree.webp',category:'clothing',tag:'Made to move'},
  {name:'Salwar Kameez',price:2500,image:'salwar kameez.webp',category:'clothing'},
  {name:'Lehenga',price:5000,image:'Lehenga.webp',category:'clothing',tag:'Occasion wear'},
  {name:'Everyday Formals',price:1000,image:'Formals.webp',category:'clothing'},
  {name:'Anarkali Suit',price:1500,image:'Anarkali suit.jpg',category:'clothing'},
  {name:'Churidar Suit',price:600,image:'Churidar suits.jpg',category:'clothing'},
  {name:'Patiala Suit',price:800,image:'Patiala suit.webp',category:'clothing'},
  {name:'Golden Party Dress',price:2505,image:'golden party wear dress.webp',category:'clothing',tag:'For the occasion'},
  {name:'Black Party Dress',price:2700,image:'black party wear dress.webp',category:'clothing'},
  {name:'Blue Evening Dress',price:6000,image:'blue evening dress.webp',category:'clothing'},
  {name:'Black Cocktail Dress',price:900,image:'black cocktail dress.jpg',category:'clothing'},
  {name:'Green Floral Dress',price:1600,image:'green floral dress.webp',category:'clothing'},
  {name:'White Maxi Dress',price:800,image:'white maxi dress.webp',category:'clothing'},
  {name:'Black Leather Shoes',price:1000,image:'black shoes.avif',category:'shoes'},
  {name:'White Sneakers',price:800,image:'white shoes.webp',category:'shoes',tag:'Everyday essential'},
  {name:'Brown Loafers',price:2000,image:'brown shoes.webp',category:'shoes'},
  {name:'Red High Heels',price:2800,image:'red heels.webp',category:'shoes'},
  {name:'Running Shoes',price:750,image:'running shoes.jpg',category:'shoes'},
  {name:'Summer Sandals',price:400,image:'summer sanndals.jpg',category:'sandals'},
  {name:'Beach Flip Flops',price:500,image:'beach flip flop.jpg',category:'sandals'},
  {name:'Leather Sandals',price:3500,image:'leather sandal.webp',category:'sandals'},
  {name:'Casual Slippers',price:800,image:'slippers.webp',category:'sandals'},
  {name:'Strappy Sandals',price:350,image:'strappy sandals.jpg',category:'sandals'}
];

const money = amount => new Intl.NumberFormat('en-IN').format(amount);
let cart = JSON.parse(localStorage.getItem('theEditCart') || '[]');
let selectedCategory = 'all';
const grid = document.getElementById('product-grid');
const toast = document.getElementById('toast');
let toastTimer;

function renderProducts() {
  const query = document.getElementById('search').value.trim().toLowerCase();
  const shown = products.map((product, id) => ({...product,id})).filter(product =>
    (selectedCategory === 'all' || product.category === selectedCategory) && product.name.toLowerCase().includes(query)
  );
  grid.innerHTML = shown.map(product => `<article class="product-card">
    <div class="product-image-wrap"><img src="${product.image}" alt="${product.name}" loading="lazy">${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}
      <button class="add-button" data-add="${product.id}" aria-label="Add ${product.name} to bag">+</button></div>
    <div class="product-info"><div><h3>${product.name}</h3><p>${product.category[0].toUpperCase()+product.category.slice(1)}</p></div><span class="product-price">₹${money(product.price)}</span></div>
  </article>`).join('');
  document.getElementById('empty-results').hidden = shown.length > 0;
}

function saveCart() {
  localStorage.setItem('theEditCart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const count = cart.reduce((sum,item) => sum + item.quantity, 0);
  const total = cart.reduce((sum,item) => sum + item.price * item.quantity, 0);
  document.getElementById('bag-count').textContent = count;
  document.getElementById('cart-caption').textContent = `${count} ${count === 1 ? 'piece' : 'pieces'}`;
  document.getElementById('cart-total').textContent = money(total);
  if (!cart.length) {
    container.innerHTML = '<p class="cart-empty">Your bag is taking a little breather.<br>Go find something you love.</p>';
    return;
  }
  container.innerHTML = cart.map((item,index) => `<article class="cart-row"><img src="${item.image}" alt=""><div><h3>${item.name}</h3><p>Quantity: ${item.quantity}</p></div><strong>₹${money(item.price * item.quantity)}</strong><button class="remove-button" data-remove="${index}" aria-label="Remove ${item.name}">Remove</button></article>`).join('');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
}

document.querySelector('.filters').addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  selectedCategory = button.dataset.category;
  document.querySelectorAll('.filter').forEach(filter => filter.classList.toggle('active', filter === button));
  renderProducts();
});

document.getElementById('search').addEventListener('input', renderProducts);
grid.addEventListener('click', event => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const product = products[Number(button.dataset.add)];
  const existing = cart.find(item => item.name === product.name);
  if (existing) existing.quantity++;
  else cart.push({...product,quantity:1});
  saveCart();
  showToast(`${product.name} added to your bag`);
});

document.getElementById('cart-items').addEventListener('click', event => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  cart.splice(Number(button.dataset.remove),1);
  saveCart();
});

document.getElementById('checkout-btn').addEventListener('click', () => {
  if (!cart.length) return showToast('Your bag is empty — find something you love first.');
  showToast('Thanks for shopping The Edit. Checkout is coming soon.');
});

renderProducts();
renderCart();
