// SentirseBien E-commerce - Main JavaScript
// Manages products catalog, cart state, dynamic rendering, and WhatsApp Checkout

// Configuration
const WHATSAPP_NUMBER = "573113278815"; // Client's WhatsApp number (Colombian code +57)
let catalogProducts = [];
let cart = JSON.parse(localStorage.getItem('sentirsebien_cart')) || [];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initCommonUI();
  fetchCatalog();
});

// Common UI Initializations (Header, Cart Drawer)
function initCommonUI() {
  // Hamburger Menu
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      menuToggle.innerHTML = navMenu.classList.contains('open') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
    });
  }

  // Cart Drawer Opening/Closing
  const cartBtn = document.getElementById('cart-btn');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartClose = document.getElementById('cart-close');

  if (cartBtn && cartOverlay) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      cartOverlay.classList.add('open');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
  }

  if (cartOverlay) {
    // Close on X button
    if (cartClose) {
      cartClose.addEventListener('click', () => {
        cartOverlay.classList.remove('open');
        document.body.style.overflow = 'auto';
      });
    }
    // Close on clicking overlay background
    cartOverlay.addEventListener('click', (e) => {
      if (e.target === cartOverlay) {
        cartOverlay.classList.remove('remove');
        cartOverlay.classList.remove('open');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // Update Cart Count Badge on load
  updateCartBadge();
  renderCartItems();
}

// Fetch Catalog Data
async function fetchCatalog() {
  try {
    const response = await fetch('/Catalogo.json');
    if (!response.ok) {
      throw new Error('No se pudo cargar el catálogo de productos');
    }
    catalogProducts = await response.json();
    
    // Check which page we are on and render accordingly
    const isHomePage = document.getElementById('featured-products-grid') !== null;
    const isShopPage = document.getElementById('shop-products-grid') !== null;
    
    if (isHomePage) {
      renderFeaturedProducts();
    }
    if (isShopPage) {
      initShopFilters();
      renderShopProducts();
    }
  } catch (error) {
    console.error('Error fetching catalog:', error);
  }
}

// Format Currency to Colombian Peso (COP)
function formatCOP(number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(number);
}

// Update Cart Badge Count
function updateCartBadge() {
  const badgeCount = cart.reduce((total, item) => total + item.quantity, 0);
  const badges = document.querySelectorAll('.cart-count-badge');
  badges.forEach(badge => {
    badge.textContent = badgeCount;
    badge.style.display = badgeCount > 0 ? 'flex' : 'none';
  });
}

// Render Cart Drawer Content
function renderCartItems() {
  const container = document.getElementById('cart-items-container');
  const subtotalVal = document.getElementById('cart-subtotal-val');
  const checkoutBtn = document.getElementById('checkout-whatsapp-btn');
  
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-message">
        <i class="fas fa-shopping-basket"></i>
        <p>Tu carrito está vacío</p>
        <a href="tienda.html" class="btn btn-outline" style="margin-top: 1.5rem;">Ir a la tienda</a>
      </div>
    `;
    if (subtotalVal) subtotalVal.textContent = formatCOP(0);
    if (checkoutBtn) checkoutBtn.setAttribute('disabled', 'true');
    return;
  }

  if (checkoutBtn) checkoutBtn.removeAttribute('disabled');

  let html = '';
  let subtotal = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    // Default placeholder image if target is missing
    const imageSrc = item.image ? `imagenes/${item.image}` : 'https://placehold.co/100x100?text=SentirseBien';

    html += `
      <div class="cart-item" data-index="${index}">
        <div class="cart-item-image">
          <img src="${imageSrc}" alt="${item.name}" onerror="this.src='https://placehold.co/100x100?text=SentirseBien'">
        </div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p class="cart-item-presentation">${item.presentationType} - ${item.size}</p>
          <div class="cart-item-qty">
            <span class="qty-btn dec" onclick="changeCartQty(${index}, -1)">-</span>
            <span class="qty-val">${item.quantity}</span>
            <span class="qty-btn inc" onclick="changeCartQty(${index}, 1)">+</span>
          </div>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-price">${formatCOP(itemTotal)}</span>
          <i class="fas fa-trash-alt cart-item-remove" onclick="removeCartItem(${index})"></i>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (subtotalVal) subtotalVal.textContent = formatCOP(subtotal);
}

// Global functions for cart mutations (attached to window for inline onclick triggers)
window.changeCartQty = (index, delta) => {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  updateCartBadge();
  renderCartItems();
};

window.removeCartItem = (index) => {
  cart.splice(index, 1);
  saveCart();
  updateCartBadge();
  renderCartItems();
};

function saveCart() {
  localStorage.setItem('sentirsebien_cart', JSON.stringify(cart));
}

// Add Item to Cart
function addToCart(product, presentationIndex, qty = 1) {
  const presentation = product.presentaciones[presentationIndex];
  const size = presentation.peso || presentation.volumen || presentation.cantidad || "Estándar";
  
  // Create unique key based on product ID and presentation details
  const cartItemId = `${product.id}-${presentation.tipo}-${size}`;
  
  const existingItemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += qty;
  } else {
    cart.push({
      cartItemId: cartItemId,
      id: product.id,
      name: product.nombre,
      price: presentation.precio,
      presentationType: presentation.tipo + (presentation.variedad ? ` (${presentation.variedad})` : ''),
      size: size,
      image: product.imagen_referencia,
      quantity: qty
    });
  }
  
  saveCart();
  updateCartBadge();
  renderCartItems();
  
  // Open Cart Drawer to show user the result
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartOverlay) {
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

// WhatsApp Checkout Redirect
window.checkoutWhatsApp = () => {
  if (cart.length === 0) return;

  let message = `¡Hola SentirseBien! 🌟 Me gustaría realizar un pedido desde el sitio web:\n\n`;
  message += `🛒 *RESUMEN DEL PEDIDO:*\n`;
  
  let subtotal = 0;
  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    message += `• *${item.name}*\n  _${item.presentationType} [${item.size}]_ \n  ${item.quantity} x ${formatCOP(item.price)} = *${formatCOP(itemTotal)}*\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *TOTAL A PAGAR: ${formatCOP(subtotal)} COP*\n\n`;
  message += `📍 *DATOS PARA LA ENTREGA Y PAGO:*\n`;
  message += `• Nombre Completo:\n`;
  message += `• Ciudad / Departamento:\n`;
  message += `• Dirección de Envío:\n`;
  message += `• Teléfono de Contacto:\n\n`;
  message += `📌 _Por favor, confírmenme el costo del envío y los métodos de pago disponibles (Transferencia Bancaria, Nequi, Daviplata o Contraentrega)._`;

  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
  
  window.open(whatsappUrl, '_blank');
};

// Render Home Page Featured Products (Take first 4 products for showcase)
function renderFeaturedProducts() {
  const container = document.getElementById('featured-products-grid');
  if (!container || catalogProducts.length === 0) return;

  // Let's take 4 iconic products from different categories
  const featuredIds = ['colageno-marino-natural', 'aceite-coco-organico', 'plata-coloidal-solucion', 'bebida-refdex'];
  const featured = catalogProducts.filter(p => featuredIds.includes(p.id));
  
  // If we didn't find specific ones, just take the first 4
  const displayProducts = featured.length > 0 ? featured : catalogProducts.slice(0, 4);

  let html = '';
  displayProducts.forEach(product => {
    const defaultPresentation = product.presentaciones[0];
    const defaultPrice = defaultPresentation.precio;
    const defaultSize = defaultPresentation.peso || defaultPresentation.volumen || defaultPresentation.cantidad || '';
    
    const imageSrc = product.imagen_referencia ? `imagenes/${product.imagen_referencia}` : 'https://placehold.co/300x300?text=SentirseBien';

    html += `
      <div class="product-card">
        <span class="badge product-badge">${product.categoria}</span>
        <div class="product-card-image-wrapper">
          <img src="${imageSrc}" alt="${product.nombre}" class="product-card-image" onerror="this.src='https://placehold.co/300x300?text=SentirseBien'">
        </div>
        <div class="product-card-content">
          <span class="product-card-category">${product.categoria}</span>
          <h3 class="product-card-title">${product.nombre}</h3>
          <p class="product-card-benefits">${product.beneficios.length > 0 ? product.beneficios[0] : product.descripcion}</p>
          
          <div class="product-card-footer">
            <div class="product-price-presentation">
              <span class="product-price">${formatCOP(defaultPrice)}</span>
              <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">${defaultPresentation.tipo} ${defaultSize}</span>
            </div>
            <button onclick="window.quickViewProduct('${product.id}')" class="btn btn-outline btn-block">Ver Detalles</button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Shop Filtering and Logic
let currentCategory = 'all';
let searchQuery = '';

function initShopFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('shop-search');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentCategory = button.getAttribute('data-category');
      renderShopProducts();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderShopProducts();
    });
  }
}

function renderShopProducts() {
  const container = document.getElementById('shop-products-grid');
  if (!container || catalogProducts.length === 0) return;

  // Apply filters
  let filtered = catalogProducts;
  
  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.categoria.toLowerCase().includes(currentCategory.toLowerCase()) || 
                                     (currentCategory === 'pulverizados' && p.categoria.includes('Pulverizados')) ||
                                     (currentCategory === 'aceites' && p.categoria.includes('Aceites')) ||
                                     (currentCategory === 'homeopaticos' && p.categoria.includes('Homeopáticos')) ||
                                     (currentCategory === 'jarabes' && p.categoria.includes('Jarabes')) ||
                                     (currentCategory === 'alimentacion' && p.categoria.includes('Alimentación')));
  }

  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.nombre.toLowerCase().includes(searchQuery) || 
      p.descripcion.toLowerCase().includes(searchQuery) ||
      p.categoria.toLowerCase().includes(searchQuery)
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i class="fas fa-search-minus" style="font-size: 3rem; margin-bottom: 1.5rem; display: block; color: var(--border-color);"></i>
        <h3>No encontramos productos que coincidan con tu búsqueda</h3>
        <p style="margin-top: 0.5rem;">Intenta con otros términos o cambia la categoría.</p>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(product => {
    const defaultPresentation = product.presentaciones[0];
    const defaultPrice = defaultPresentation.precio;
    const defaultSize = defaultPresentation.peso || defaultPresentation.volumen || defaultPresentation.cantidad || '';
    const imageSrc = product.imagen_referencia ? `imagenes/${product.imagen_referencia}` : 'https://placehold.co/300x300?text=SentirseBien';

    html += `
      <div class="product-card">
        <div class="product-card-image-wrapper">
          <img src="${imageSrc}" alt="${product.nombre}" class="product-card-image" onerror="this.src='https://placehold.co/300x300?text=SentirseBien'">
        </div>
        <div class="product-card-content">
          <span class="product-card-category">${product.categoria}</span>
          <h3 class="product-card-title">${product.nombre}</h3>
          <p class="product-card-benefits">${product.beneficios.length > 0 ? product.beneficios[0] : product.descripcion}</p>
          
          <div class="product-card-footer">
            <div class="product-price-presentation">
              <span class="product-price">${formatCOP(defaultPrice)}</span>
              <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">${defaultPresentation.tipo} ${defaultSize}</span>
            </div>
            <button onclick="window.quickViewProduct('${product.id}')" class="btn btn-outline btn-block">Ver Detalles</button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Product Quick View Modal Controller
let activeProduct = null;
let activePresentationIndex = 0;

window.quickViewProduct = (productId) => {
  const product = catalogProducts.find(p => p.id === productId);
  if (!product) return;

  activeProduct = product;
  activePresentationIndex = 0;

  const modalOverlay = document.getElementById('product-modal-overlay');
  if (!modalOverlay) return;

  // Render Modal Content
  const modalImg = document.getElementById('modal-product-img');
  const modalCat = document.getElementById('modal-product-category');
  const modalTitle = document.getElementById('modal-product-title');
  const modalDesc = document.getElementById('modal-product-desc');
  const modalBenefitsList = document.getElementById('modal-product-benefits-list');
  const modalPresentationOptions = document.getElementById('modal-presentation-options');
  const modalPrice = document.getElementById('modal-product-price');

  if (modalImg) {
    const imageSrc = product.imagen_referencia ? `imagenes/${product.imagen_referencia}` : 'https://placehold.co/300x300?text=SentirseBien';
    modalImg.src = imageSrc;
    modalImg.alt = product.nombre;
    modalImg.onerror = function() { this.src = 'https://placehold.co/300x300?text=SentirseBien'; };
  }
  if (modalCat) modalCat.textContent = product.categoria;
  if (modalTitle) modalTitle.textContent = product.nombre;
  if (modalDesc) modalDesc.textContent = product.descripcion;
  
  if (modalBenefitsList) {
    if (product.beneficios.length > 0) {
      modalBenefitsList.parentElement.style.display = 'block';
      modalBenefitsList.innerHTML = product.beneficios.map(b => `
        <li><i class="fas fa-check-circle"></i><span>${b}</span></li>
      `).join('');
    } else {
      modalBenefitsList.parentElement.style.display = 'none';
    }
  }

  // Render presentations selector
  if (modalPresentationOptions) {
    modalPresentationOptions.innerHTML = product.presentaciones.map((p, idx) => {
      const sizeLabel = p.peso || p.volumen || p.cantidad || '';
      const varLabel = p.variedad ? ` - ${p.variedad}` : '';
      return `
        <button class="presentation-option ${idx === 0 ? 'active' : ''}" 
                data-index="${idx}" 
                onclick="window.selectModalPresentation(${idx})">
          ${p.tipo} ${sizeLabel}${varLabel}
        </button>
      `;
    }).join('');
  }

  // Update Price
  if (modalPrice) {
    modalPrice.textContent = formatCOP(product.presentaciones[0].precio);
  }

  // Open Modal
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.selectModalPresentation = (index) => {
  activePresentationIndex = index;
  const options = document.querySelectorAll('.presentation-option');
  options.forEach((opt, idx) => {
    if (idx === index) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });

  const modalPrice = document.getElementById('modal-product-price');
  if (modalPrice && activeProduct) {
    modalPrice.textContent = formatCOP(activeProduct.presentaciones[index].precio);
  }
};

window.closeProductModal = () => {
  const modalOverlay = document.getElementById('product-modal-overlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = 'auto';
  }
  activeProduct = null;
};

window.addActiveProductToCart = () => {
  if (!activeProduct) return;
  addToCart(activeProduct, activePresentationIndex, 1);
  window.closeProductModal();
};
