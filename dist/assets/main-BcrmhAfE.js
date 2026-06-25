(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))t(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&t(s)}).observe(document,{childList:!0,subtree:!0});function c(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function t(a){if(a.ep)return;a.ep=!0;const n=c(a);fetch(a.href,n)}})();const C="573000000000";let p=[],r=JSON.parse(localStorage.getItem("sentirsebien_cart"))||[];document.addEventListener("DOMContentLoaded",()=>{B(),P()});function B(){const e=document.getElementById("menu-toggle"),o=document.getElementById("nav-menu");e&&o&&e.addEventListener("click",()=>{o.classList.toggle("open"),e.innerHTML=o.classList.contains("open")?'<i class="fas fa-times"></i>':'<i class="fas fa-bars"></i>'});const c=document.getElementById("cart-btn"),t=document.getElementById("cart-overlay"),a=document.getElementById("cart-close");c&&t&&c.addEventListener("click",n=>{n.preventDefault(),t.classList.add("open"),document.body.style.overflow="hidden"}),t&&(a&&a.addEventListener("click",()=>{t.classList.remove("open"),document.body.style.overflow="auto"}),t.addEventListener("click",n=>{n.target===t&&(t.classList.remove("remove"),t.classList.remove("open"),document.body.style.overflow="auto")})),y(),h()}async function P(){try{const e=await fetch("/Catalogo.json");if(!e.ok)throw new Error("No se pudo cargar el catálogo de productos");p=await e.json();const o=document.getElementById("featured-products-grid")!==null,c=document.getElementById("shop-products-grid")!==null;o&&S(),c&&(T(),$())}catch(e){console.error("Error fetching catalog:",e)}}function d(e){return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",minimumFractionDigits:0}).format(e)}function y(){const e=r.reduce((c,t)=>c+t.quantity,0);document.querySelectorAll(".cart-count-badge").forEach(c=>{c.textContent=e,c.style.display=e>0?"flex":"none"})}function h(){const e=document.getElementById("cart-items-container"),o=document.getElementById("cart-subtotal-val"),c=document.getElementById("checkout-whatsapp-btn");if(!e)return;if(r.length===0){e.innerHTML=`
      <div class="cart-empty-message">
        <i class="fas fa-shopping-basket"></i>
        <p>Tu carrito está vacío</p>
        <a href="tienda.html" class="btn btn-outline" style="margin-top: 1.5rem;">Ir a la tienda</a>
      </div>
    `,o&&(o.textContent=d(0)),c&&c.setAttribute("disabled","true");return}c&&c.removeAttribute("disabled");let t="",a=0;r.forEach((n,s)=>{const i=n.price*n.quantity;a+=i;const u=n.image?`assets/productos/${n.image}`:"https://placehold.co/100x100?text=SentirseBien";t+=`
      <div class="cart-item" data-index="${s}">
        <div class="cart-item-image">
          <img src="${u}" alt="${n.name}" onerror="this.src='https://placehold.co/100x100?text=SentirseBien'">
        </div>
        <div class="cart-item-details">
          <h4>${n.name}</h4>
          <p class="cart-item-presentation">${n.presentationType} - ${n.size}</p>
          <div class="cart-item-qty">
            <span class="qty-btn dec" onclick="changeCartQty(${s}, -1)">-</span>
            <span class="qty-val">${n.quantity}</span>
            <span class="qty-btn inc" onclick="changeCartQty(${s}, 1)">+</span>
          </div>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-price">${d(i)}</span>
          <i class="fas fa-trash-alt cart-item-remove" onclick="removeCartItem(${s})"></i>
        </div>
      </div>
    `}),e.innerHTML=t,o&&(o.textContent=d(a))}window.changeCartQty=(e,o)=>{r[e].quantity+=o,r[e].quantity<=0&&r.splice(e,1),w(),y(),h()};window.removeCartItem=e=>{r.splice(e,1),w(),y(),h()};function w(){localStorage.setItem("sentirsebien_cart",JSON.stringify(r))}function x(e,o,c=1){const t=e.presentaciones[o],a=t.peso||t.volumen||t.cantidad||"Estándar",n=`${e.id}-${t.tipo}-${a}`,s=r.findIndex(u=>u.cartItemId===n);s>-1?r[s].quantity+=c:r.push({cartItemId:n,id:e.id,name:e.nombre,price:t.precio,presentationType:t.tipo+(t.variedad?` (${t.variedad})`:""),size:a,image:e.imagen_referencia,quantity:c}),w(),y(),h();const i=document.getElementById("cart-overlay");i&&(i.classList.add("open"),document.body.style.overflow="hidden")}window.checkoutWhatsApp=()=>{if(r.length===0)return;let e=`¡Hola SentirseBien! 🌟 Me gustaría realizar un pedido desde el sitio web:

`;e+=`🛒 *RESUMEN DEL PEDIDO:*
`;let o=0;r.forEach(a=>{const n=a.price*a.quantity;o+=n,e+=`• *${a.name}*
  _${a.presentationType} [${a.size}]_ 
  ${a.quantity} x ${d(a.price)} = *${d(n)}*

`}),e+=`━━━━━━━━━━━━━━━━━━
`,e+=`💰 *TOTAL A PAGAR: ${d(o)} COP*

`,e+=`📍 *DATOS PARA LA ENTREGA Y PAGO:*
`,e+=`• Nombre Completo:
`,e+=`• Ciudad / Departamento:
`,e+=`• Dirección de Envío:
`,e+=`• Teléfono de Contacto:

`,e+="📌 _Por favor, confírmenme el costo del envío y los métodos de pago disponibles (Transferencia Bancaria, Nequi, Daviplata o Contraentrega)._";const c=encodeURIComponent(e),t=`https://wa.me/${C}?text=${c}`;window.open(t,"_blank")};function S(){const e=document.getElementById("featured-products-grid");if(!e||p.length===0)return;const o=["colageno-marino-natural","aceite-coco-organico","plata-coloidal-solucion","bebida-refdex"],c=p.filter(n=>o.includes(n.id)),t=c.length>0?c:p.slice(0,4);let a="";t.forEach(n=>{const s=n.presentaciones[0],i=s.precio,u=s.peso||s.volumen||s.cantidad||"",v=n.imagen_referencia?`assets/productos/${n.imagen_referencia}`:"https://placehold.co/300x300?text=SentirseBien";a+=`
      <div class="product-card">
        <span class="badge product-badge">${n.categoria}</span>
        <div class="product-card-image-wrapper">
          <img src="${v}" alt="${n.nombre}" class="product-card-image" onerror="this.src='https://placehold.co/300x300?text=SentirseBien'">
        </div>
        <div class="product-card-content">
          <span class="product-card-category">${n.categoria}</span>
          <h3 class="product-card-title">${n.nombre}</h3>
          <p class="product-card-benefits">${n.beneficios.length>0?n.beneficios[0]:n.descripcion}</p>
          
          <div class="product-card-footer">
            <div class="product-price-presentation">
              <span class="product-price">${d(i)}</span>
              <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">${s.tipo} ${u}</span>
            </div>
            <button onclick="window.quickViewProduct('${n.id}')" class="btn btn-outline btn-block">Ver Detalles</button>
          </div>
        </div>
      </div>
    `}),e.innerHTML=a}let m="all",g="";function T(){const e=document.querySelectorAll(".filter-btn"),o=document.getElementById("shop-search");e.forEach(c=>{c.addEventListener("click",()=>{e.forEach(t=>t.classList.remove("active")),c.classList.add("active"),m=c.getAttribute("data-category"),$()})}),o&&o.addEventListener("input",c=>{g=c.target.value.toLowerCase().trim(),$()})}function $(){const e=document.getElementById("shop-products-grid");if(!e||p.length===0)return;let o=p;if(m!=="all"&&(o=o.filter(t=>t.categoria.toLowerCase().includes(m.toLowerCase())||m==="pulverizados"&&t.categoria.includes("Pulverizados")||m==="aceites"&&t.categoria.includes("Aceites")||m==="homeopaticos"&&t.categoria.includes("Homeopáticos")||m==="jarabes"&&t.categoria.includes("Jarabes")||m==="alimentacion"&&t.categoria.includes("Alimentación"))),g&&(o=o.filter(t=>t.nombre.toLowerCase().includes(g)||t.descripcion.toLowerCase().includes(g)||t.categoria.toLowerCase().includes(g))),o.length===0){e.innerHTML=`
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i class="fas fa-search-minus" style="font-size: 3rem; margin-bottom: 1.5rem; display: block; color: var(--border-color);"></i>
        <h3>No encontramos productos que coincidan con tu búsqueda</h3>
        <p style="margin-top: 0.5rem;">Intenta con otros términos o cambia la categoría.</p>
      </div>
    `;return}let c="";o.forEach(t=>{const a=t.presentaciones[0],n=a.precio,s=a.peso||a.volumen||a.cantidad||"",i=t.imagen_referencia?`assets/productos/${t.imagen_referencia}`:"https://placehold.co/300x300?text=SentirseBien";c+=`
      <div class="product-card">
        <div class="product-card-image-wrapper">
          <img src="${i}" alt="${t.nombre}" class="product-card-image" onerror="this.src='https://placehold.co/300x300?text=SentirseBien'">
        </div>
        <div class="product-card-content">
          <span class="product-card-category">${t.categoria}</span>
          <h3 class="product-card-title">${t.nombre}</h3>
          <p class="product-card-benefits">${t.beneficios.length>0?t.beneficios[0]:t.descripcion}</p>
          
          <div class="product-card-footer">
            <div class="product-price-presentation">
              <span class="product-price">${d(n)}</span>
              <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-muted);">${a.tipo} ${s}</span>
            </div>
            <button onclick="window.quickViewProduct('${t.id}')" class="btn btn-outline btn-block">Ver Detalles</button>
          </div>
        </div>
      </div>
    `}),e.innerHTML=c}let f=null,E=0;window.quickViewProduct=e=>{const o=p.find(l=>l.id===e);if(!o)return;f=o,E=0;const c=document.getElementById("product-modal-overlay");if(!c)return;const t=document.getElementById("modal-product-img"),a=document.getElementById("modal-product-category"),n=document.getElementById("modal-product-title"),s=document.getElementById("modal-product-desc"),i=document.getElementById("modal-product-benefits-list"),u=document.getElementById("modal-presentation-options"),v=document.getElementById("modal-product-price");if(t){const l=o.imagen_referencia?`assets/productos/${o.imagen_referencia}`:"https://placehold.co/300x300?text=SentirseBien";t.src=l,t.alt=o.nombre,t.onerror=function(){this.src="https://placehold.co/300x300?text=SentirseBien"}}a&&(a.textContent=o.categoria),n&&(n.textContent=o.nombre),s&&(s.textContent=o.descripcion),i&&(o.beneficios.length>0?(i.parentElement.style.display="block",i.innerHTML=o.beneficios.map(l=>`
        <li><i class="fas fa-check-circle"></i><span>${l}</span></li>
      `).join("")):i.parentElement.style.display="none"),u&&(u.innerHTML=o.presentaciones.map((l,b)=>{const I=l.peso||l.volumen||l.cantidad||"",L=l.variedad?` - ${l.variedad}`:"";return`
        <button class="presentation-option ${b===0?"active":""}" 
                data-index="${b}" 
                onclick="window.selectModalPresentation(${b})">
          ${l.tipo} ${I}${L}
        </button>
      `}).join("")),v&&(v.textContent=d(o.presentaciones[0].precio)),c.classList.add("open"),document.body.style.overflow="hidden"};window.selectModalPresentation=e=>{E=e,document.querySelectorAll(".presentation-option").forEach((t,a)=>{a===e?t.classList.add("active"):t.classList.remove("active")});const c=document.getElementById("modal-product-price");c&&f&&(c.textContent=d(f.presentaciones[e].precio))};window.closeProductModal=()=>{const e=document.getElementById("product-modal-overlay");e&&(e.classList.remove("open"),document.body.style.overflow="auto"),f=null};window.addActiveProductToCart=()=>{f&&(x(f,E,1),window.closeProductModal())};
