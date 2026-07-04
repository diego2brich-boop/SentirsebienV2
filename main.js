// SentirseBien E-commerce - Main JavaScript
// Manages products catalog, cart state, dynamic rendering, and WhatsApp Checkout

// Import Vercel Analytics
import { inject } from '@vercel/analytics';

// Configuration
const WHATSAPP_NUMBER = "573224559027"; // Client's WhatsApp number (+57 3224559027)
let catalogProducts = [];
let cart = JSON.parse(localStorage.getItem('sentirsebien_cart')) || [];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Vercel Web Analytics
  inject();
  
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

// State for Cart Drawer (items or checkout form)
window.cartViewState = "items";

// Back to Cart Items view
window.backToCartItems = () => {
  window.cartViewState = "items";
  
  // Restore Header Title and Back Button
  const header = document.querySelector('.cart-header');
  if (header) {
    header.innerHTML = `
      <h2>Mi Carrito</h2>
      <div class="cart-close-btn" id="cart-close" onclick="document.getElementById('cart-overlay').classList.remove('open'); document.body.style.overflow = 'auto';">&times;</div>
    `;
  }
  
  // Re-render items
  renderCartItems();
  
  // Update footer button
  const checkoutBtn = document.getElementById('checkout-whatsapp-btn');
  if (checkoutBtn) {
    checkoutBtn.innerHTML = `<i class="fab fa-whatsapp" style="margin-right: 0.5rem; font-size: 1.2rem;"></i> Finalizar Pedido por WhatsApp`;
  }
};

// WhatsApp Checkout / Form toggle
window.checkoutWhatsApp = () => {
  if (cart.length === 0) return;

  if (window.cartViewState === "items") {
    // Transition to checkout form
    window.cartViewState = "checkout";
    
    // Modify Header to show Back Button
    const header = document.querySelector('.cart-header');
    if (header) {
      header.innerHTML = `
        <div class="cart-back-btn" onclick="window.backToCartItems()"><i class="fas fa-arrow-left"></i></div>
        <h2>Datos de Envío</h2>
        <div class="cart-close-btn" id="cart-close" onclick="document.getElementById('cart-overlay').classList.remove('open'); document.body.style.overflow = 'auto';">&times;</div>
      `;
    }
    
    // Render Checkout Form inside items container
    const container = document.getElementById('cart-items-container');
    if (container) {
      container.innerHTML = `
        <div class="checkout-form">
          <div class="form-group">
            <label for="checkout-name">Nombre Completo *</label>
            <input type="text" id="checkout-name" placeholder="Ej: Juan Pérez" class="form-control" required />
          </div>
          
          <div class="form-group">
            <label for="checkout-phone">Número de Contacto (Colombia) *</label>
            <input type="tel" id="checkout-phone" placeholder="Ej: 3224559027" class="form-control" required />
            <span class="form-error" id="phone-error">Debe ser un número celular válido de 10 dígitos que empiece con 3.</span>
          </div>
          
          <div class="form-group">
            <label for="checkout-payment">Método de Pago *</label>
            <select id="checkout-payment" class="form-control">
              <option value="Nequi">Nequi</option>
              <option value="Daviplata (Llave)">Daviplata (Llave)</option>
              <option value="Transferencia Bancaria (Bancolombia)">Transferencia Bancaria (Bancolombia)</option>
              <option value="Pago contra entrega en efectivo">Pago contra entrega en efectivo</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="checkout-address">Dirección de Entrega</label>
            <input type="text" id="checkout-address" placeholder="Ej: Calle 100 # 15-22, Apto 301 (Opcional)" class="form-control" />
          </div>

          <div class="form-group">
            <button type="button" id="map-toggle-btn" class="btn btn-outline btn-block" style="margin-top: 0.5rem;" onclick="window.toggleCheckoutMap()">
              <i class="fas fa-map-marker-alt"></i> Señalar ubicación en mapa (Bogotá)
            </button>
            <div id="checkout-map" style="display: none; height: 220px; margin-top: 1rem; border-radius: 8px; border: 1px solid var(--border-color); z-index: 1;"></div>
            <input type="hidden" id="checkout-latlong" />
          </div>
        </div>
      `;
    }
    
    // Change Footer Button Text
    const checkoutBtn = document.getElementById('checkout-whatsapp-btn');
    if (checkoutBtn) {
      checkoutBtn.innerHTML = `<i class="fab fa-whatsapp" style="margin-right: 0.5rem; font-size: 1.2rem;"></i> Confirmar y Enviar Pedido`;
    }
  } else {
    // Perform validation and send message
    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');
    const paymentSelect = document.getElementById('checkout-payment');
    const addressInput = document.getElementById('checkout-address');
    const latlongInput = document.getElementById('checkout-latlong');
    const phoneError = document.getElementById('phone-error');
    
    if (!nameInput || !phoneInput || !paymentSelect) return;
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const payment = paymentSelect.value;
    const address = addressInput ? addressInput.value.trim() : '';
    const latlong = latlongInput ? latlongInput.value : '';
    
    // Colombian Mobile validation: starts with 3, total 10 digits
    const phoneRegex = /^3\d{9}$/;
    
    if (!name) {
      alert("Por favor ingresa tu nombre completo.");
      nameInput.focus();
      return;
    }
    
    if (!phoneRegex.test(phone)) {
      if (phoneError) phoneError.style.display = 'block';
      phoneInput.focus();
      return;
    } else {
      if (phoneError) phoneError.style.display = 'none';
    }
    
    // Build WhatsApp message
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
    message += `📍 *DATOS DEL CLIENTE:*\n`;
    message += `• *Nombre:* ${name}\n`;
    message += `• *Teléfono:* ${phone}\n`;
    message += `• *Método de Pago:* ${payment}\n`;
    
    if (address) {
      message += `• *Dirección:* ${address}\n`;
    }
    
    if (latlong) {
      message += `• *Ubicación del Mapa:* https://www.google.com/maps?q=${latlong}\n`;
    }
    
    message += `\n📌 _Por favor, confírmenme el despacho de mi pedido._`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
    
    // Clear cart upon redirection
    cart = [];
    saveCart();
    updateCartBadge();
    window.backToCartItems();
    
    // Close Drawer
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartOverlay) cartOverlay.classList.remove('open');
    document.body.style.overflow = 'auto';
    
    window.open(whatsappUrl, '_blank');
  }
};

// Map script dynamic loader
function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve();
      return;
    }
    
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Leaflet'));
    document.head.appendChild(script);
  });
}

let leafletMap = null;
let leafletMarker = null;

window.toggleCheckoutMap = async () => {
  const mapContainer = document.getElementById('checkout-map');
  const toggleBtn = document.getElementById('map-toggle-btn');
  if (!mapContainer) return;

  if (mapContainer.style.display === 'none') {
    mapContainer.style.display = 'block';
    if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Ocultar mapa';
    
    try {
      await loadLeaflet();
      initLeafletMap();
    } catch (err) {
      console.error(err);
      alert('No se pudo cargar el mapa de OpenStreetMap. Por favor escribe tu dirección manualmente.');
    }
  } else {
    mapContainer.style.display = 'none';
    if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Señalar ubicación en mapa (Bogotá)';
  }
};

function initLeafletMap() {
  if (leafletMap) {
    // If already initialized, invalidate size so it fits inside the drawer div properly
    setTimeout(() => {
      leafletMap.invalidateSize();
    }, 100);
    return;
  }

  // Centered in Bogotá
  const bogotaCenter = [4.65, -74.09];
  leafletMap = L.map('checkout-map').setView(bogotaCenter, 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(leafletMap);

  // Click map handler
  leafletMap.on('click', (e) => {
    const { lat, lng } = e.latlng;
    setMapMarker(lat, lng);
  });
}

function setMapMarker(lat, lng) {
  if (leafletMarker) {
    leafletMarker.setLatLng([lat, lng]);
  } else {
    leafletMarker = L.marker([lat, lng], { draggable: true }).addTo(leafletMap);
    leafletMarker.on('dragend', (e) => {
      const position = leafletMarker.getLatLng();
      updateAddressInput(position.lat, position.lng);
    });
  }
  updateAddressInput(lat, lng);
}

function updateAddressInput(lat, lng) {
  const latlongInput = document.getElementById('checkout-latlong');
  const addressInput = document.getElementById('checkout-address');
  
  if (latlongInput) latlongInput.value = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  
  if (addressInput) {
    addressInput.value = `Ubicación en Bogotá (Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)})`;
  }
}

// Carousel controller
let carouselIndex = 0;
function initCarousel() {
  const track = document.getElementById('featured-products-grid');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!track || !prevBtn || !nextBtn) return;

  const getSlideWidth = () => {
    const firstSlide = track.querySelector('.product-card');
    if (!firstSlide) return 300;
    return firstSlide.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0);
  };

  const updateCarousel = () => {
    const slideWidth = getSlideWidth();
    const slidesVisible = Math.floor(track.parentElement.getBoundingClientRect().width / slideWidth);
    const maxIndex = Math.max(0, track.children.length - slidesVisible);
    
    if (carouselIndex < 0) carouselIndex = 0;
    if (carouselIndex > maxIndex) carouselIndex = maxIndex;

    track.style.transform = `translateX(-${carouselIndex * slideWidth}px)`;
    
    prevBtn.disabled = carouselIndex === 0;
    nextBtn.disabled = carouselIndex >= maxIndex;
  };

  prevBtn.addEventListener('click', () => {
    carouselIndex = Math.max(0, carouselIndex - 1);
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    carouselIndex++;
    updateCarousel();
  });

  // Handle Resize
  window.addEventListener('resize', updateCarousel);
  
  // Delayed initial update to ensure DOM clientWidth is rendered
  setTimeout(updateCarousel, 300);
}

// Render Home Page Featured Products (all catalog products for carousel)
function renderFeaturedProducts() {
  const container = document.getElementById('featured-products-grid');
  if (!container || catalogProducts.length === 0) return;

  let html = '';
  catalogProducts.forEach(product => {
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
  initCarousel();
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

  // Inject schema for SEO
  injectProductSchema(product);

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
  
  // Remove schema
  const schema = document.getElementById('product-jsonld-schema');
  if (schema) schema.remove();
  
  activeProduct = null;
};

window.addActiveProductToCart = () => {
  if (!activeProduct) return;
  addToCart(activeProduct, activePresentationIndex, 1);
  window.closeProductModal();
};

// SEO helper: Dynamically inject product structured data
function injectProductSchema(product) {
  const existingSchema = document.getElementById('product-jsonld-schema');
  if (existingSchema) {
    existingSchema.remove();
  }
  
  const defaultPresentation = product.presentaciones[0];
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.nombre,
    "image": `${window.location.origin}/imagenes/${product.imagen_referencia}`,
    "description": product.descripcion,
    "brand": {
      "@type": "Brand",
      "name": product.categoria.includes("GMN") ? "GMN" : "SentirseBien"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "COP",
      "price": defaultPresentation.precio,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "url": window.location.href
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'product-jsonld-schema';
  script.innerHTML = JSON.stringify(schema);
  document.head.appendChild(script);
}
