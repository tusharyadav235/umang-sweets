// ==========================================
// VANILLA JS IMAGE STACK GALLERY COMPONENT
// ==========================================
class ImageStack {
  constructor(containerId, images) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.images = images;
    this.init();
  }
  
  init() {
    this.container.innerHTML = ''; // clear any placeholders
    this.container.classList.add('stack-container');
    
    // Create card elements
    this.cards = this.images.map((src, idx) => {
      const card = document.createElement('div');
      card.className = 'card-rotate-disabled';
      
      const cardInner = document.createElement('div');
      cardInner.className = 'card';
      
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Gallery Image ${idx + 1}`;
      img.className = 'card-image';
      
      cardInner.appendChild(img);
      card.appendChild(cardInner);
      this.container.appendChild(card);
      
      return { id: idx, element: card };
    });
    
    // Set up click handlers to send top card to back
    this.cards.forEach(card => {
      card.element.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sendToBack(card.id);
      });
    });
    
    this.updatePositions();
  }
  
  sendToBack(id) {
    const cardIndex = this.cards.findIndex(c => c.id === id);
    if (cardIndex === -1) return;
    
    // Only allow clicking the top card to send to back
    if (cardIndex !== this.cards.length - 1) return;
    
    const [card] = this.cards.splice(cardIndex, 1);
    this.cards.unshift(card);
    
    this.updatePositions();
  }
  
  updatePositions() {
    const len = this.cards.length;
    this.cards.forEach((card, index) => {
      // index: 0 is bottom, len-1 is top
      const offsetIndex = len - index - 1; // 0 for top, len-1 for bottom
      
      const rotateZ = offsetIndex * 4;
      const scale = 1 - offsetIndex * 0.06;
      
      card.element.style.zIndex = index + 10;
      card.element.style.transform = `scale(${scale}) rotateZ(${rotateZ}deg)`;
      card.element.style.transformOrigin = '90% 90%';
      card.element.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
  }
}

// ==========================================
// OTHER WEBPAGE INTERACTION INTERACTIVITY
// ==========================================

// Sticky Header Transition (Transparent -> Blurry background on scroll)
const navbar = document.getElementById('main-nav');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Mobile Menu Toggle
const mobileToggle = document.getElementById('mobile-toggle');
const mobileMenuPanel = document.getElementById('mobile-menu-panel');

if (mobileToggle && mobileMenuPanel) {
  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    mobileMenuPanel.classList.toggle('active');
  });
}

function toggleMobileMenu() {
  if (mobileToggle && mobileMenuPanel) {
    mobileToggle.classList.remove('active');
    mobileMenuPanel.classList.remove('active');
  }
}

// Scroll Reveal Animations
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.05,
  rootMargin: '0px 0px -30px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// Switch Menu Categories
function switchMenuCategory(category, buttonElement) {
  // Update active button state
  const tabButtons = document.querySelectorAll('#menu-section button.btn');
  tabButtons.forEach(btn => {
    btn.classList.remove('active-tab');
  });
  
  if (buttonElement) {
    buttonElement.classList.add('active-tab');
  }
  
  // Hide all panels, show the targeted one
  const panels = document.querySelectorAll('.menu-category-panel');
  panels.forEach(panel => {
    panel.classList.remove('active');
  });
  
  const targetPanel = document.getElementById(`category-${category}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }
}

// ==========================================
// SHOPPING CART / BASKET STATE MANAGEMENT
// ==========================================

let basket = {}; // Stores item details: { "Dal Makhni": { price: 200, qty: 1 } }

// Add item to basket
function addToBasket(name, price) {
  if (basket[name]) {
    basket[name].qty += 1;
  } else {
    basket[name] = { price: parseInt(price), qty: 1 };
  }
  renderBasket();
}

// Decrease/Increase item quantity
function updateBasketQty(name, delta) {
  if (!basket[name]) return;
  
  basket[name].qty += delta;
  
  if (basket[name].qty <= 0) {
    delete basket[name];
  }
  
  renderBasket();
}

// Toggle Cart Sidebar Drawer
function toggleCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.toggle('active');
    overlay.classList.toggle('active');
  }
}

// Re-render Cart Drawer items & Inline Quantity Controls
function renderBasket() {
  const badge = document.getElementById('cart-badge-count');
  const drawerItems = document.getElementById('cart-drawer-items');
  const totalVal = document.getElementById('cart-total-val');
  
  let totalItems = 0;
  let totalPrice = 0;
  let itemsHTML = '';
  
  const basketKeys = Object.keys(basket);
  
  if (basketKeys.length === 0) {
    itemsHTML = `<p class="cart-empty-message">Your basket is empty.<br>Add some delicious items!</p>`;
  } else {
    basketKeys.forEach(name => {
      const item = basket[name];
      const itemSubtotal = item.price * item.qty;
      totalItems += item.qty;
      totalPrice += itemSubtotal;
      
      itemsHTML += `
        <div class="cart-item-row">
          <div class="cart-item-details">
            <span class="cart-item-name">${name}</span>
            <span class="cart-item-subprice">₹${item.price} each</span>
          </div>
          <div class="cart-item-actions">
            <div class="qty-ctrl-inline">
              <button class="qty-btn-inline minus" onclick="updateBasketQty('${name}', -1)">-</button>
              <span class="qty-val-inline">${item.qty}</span>
              <button class="qty-btn-inline plus" onclick="updateBasketQty('${name}', 1)">+</button>
            </div>
            <span class="cart-item-total">₹${itemSubtotal}</span>
          </div>
        </div>
      `;
    });
  }
  
  // Update badges & pricing
  if (badge) badge.innerText = totalItems;
  if (drawerItems) drawerItems.innerHTML = itemsHTML;
  if (totalVal) totalVal.innerText = `₹${totalPrice}`;
  
  // Render Inline Add/+/- controls in the menu section
  const controls = document.querySelectorAll('.dish-control');
  controls.forEach(ctrl => {
    const name = ctrl.getAttribute('data-dish');
    const price = ctrl.getAttribute('data-price');
    const item = basket[name];
    
    if (item && item.qty > 0) {
      ctrl.innerHTML = `
        <div class="qty-ctrl-inline">
          <button class="qty-btn-inline minus" onclick="updateBasketQty('${name}', -1)" aria-label="Decrease quantity">-</button>
          <span class="qty-val-inline">${item.qty}</span>
          <button class="qty-btn-inline plus" onclick="updateBasketQty('${name}', 1)" aria-label="Increase quantity">+</button>
        </div>
      `;
    } else {
      ctrl.innerHTML = `
        <button class="add-btn-inline" onclick="addToBasket('${name}', ${price})" aria-label="Add ${name}">+ Add</button>
      `;
    }
  });
}

// Compile order list and open WhatsApp
function placeCartOrder() {
  const basketKeys = Object.keys(basket);
  if (basketKeys.length === 0) {
    alert("Your basket is empty. Please add items to checkout!");
    return;
  }
  
  let orderText = "Hello Umang Sweets! I would like to place an order for:\n\n";
  let grandTotal = 0;
  
  basketKeys.forEach((name, index) => {
    const item = basket[name];
    const itemTotal = item.price * item.qty;
    grandTotal += itemTotal;
    orderText += `${index + 1}. ${name} x ${item.qty} = ₹${itemTotal}\n`;
  });
  
  orderText += `\n*Grand Total: ₹${grandTotal}*`;
  
  const encodedText = encodeURIComponent(orderText);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=917037106909&text=${encodedText}`;
  
  window.open(whatsappUrl, '_blank');
}

// Run initial render to set "+ Add" buttons on page load
document.addEventListener('DOMContentLoaded', () => {
  renderBasket();
  
  // Initialize the gallery stack
  const galleryImages = [
    "ghewar_mava.png",
    "ras_malai.png",
    "pistachio_sweets.png",
    "gift_hamper.png"
  ];
  new ImageStack('gallery-stack', galleryImages);
});

// Execute right away just in case DOMContentLoaded has already fired
renderBasket();
