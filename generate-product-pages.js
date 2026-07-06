const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://sentirsebien.co';
const CATALOG_PATH = path.join(__dirname, 'public', 'Catalogo.json');
const OUTPUT_DIR = path.join(__dirname, 'public', 'p');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read catalog and strip UTF-8 BOM if present
let catalogRaw = fs.readFileSync(CATALOG_PATH, 'utf-8');
if (catalogRaw.charCodeAt(0) === 0xFEFF) {
  catalogRaw = catalogRaw.slice(1);
}
const catalog = JSON.parse(catalogRaw);

catalog.forEach(product => {
  const imageUrl = `${BASE_URL}/imagenes/${encodeURIComponent(product.imagen_referencia)}`;
  const productUrl = `${BASE_URL}/p/${product.id}.html`;
  const redirectUrl = `../tienda.html#${product.id}`;
  
  const html = `<!DOCTYPE html>
<html lang="es-CO">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO & Open Graph for WhatsApp, Facebook, etc. -->
  <title>${product.nombre} | SentirseBien Colombia</title>
  <meta name="description" content="${product.descripcion}">
  
  <meta property="og:type" content="product">
  <meta property="og:url" content="${productUrl}">
  <meta property="og:title" content="${product.nombre} | SentirseBien">
  <meta property="og:description" content="${product.descripcion}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:secure_url" content="${imageUrl}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="600">
  <meta property="og:image:height" content="600">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${product.nombre} | SentirseBien">
  <meta name="twitter:description" content="${product.descripcion}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <!-- JS Redirect to Tienda Modal -->
  <script>
    window.location.href = "${redirectUrl}";
  </script>
</head>
<body>
  <div style="font-family: sans-serif; text-align: center; padding: 3rem; color: #103F29;">
    <h2>Redirigiendo a SentirseBien...</h2>
    <p>Si no eres redirigido automáticamente, <a href="${redirectUrl}" style="color: #CA6843; font-weight: bold;">haz clic aquí para ver el producto</a>.</p>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, `${product.id}.html`), html, 'utf-8');
});

console.log(`Generated ${catalog.length} static product redirect pages in public/p/`);
