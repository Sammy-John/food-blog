const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

const publicDir = path.join(__dirname, 'public');
const viewsDir = path.join(__dirname, 'views');
const docsDir = path.join(__dirname, 'docs');

// Clean /docs
fse.removeSync(docsDir);
fs.mkdirSync(docsDir);

// Copy entire public directory into docs
fse.copySync(publicDir, docsDir);
console.log('✔ Copied public/ to docs/');

// Copy and patch index.html from views → docs
const indexInputPath = path.join(viewsDir, 'index.html');
const indexOutputPath = path.join(docsDir, 'index.html');
let html = fs.readFileSync(indexInputPath, 'utf-8');

// Fix leading slashes in HTML (e.g., /styles → styles)
html = html.replace(/(href|src)=["']\/(.*?)["']/g, '$1="$2"');
fs.writeFileSync(indexOutputPath, html);
console.log('✔ Patched index.html paths and copied to docs/');

// Patch all .js files in docs/scripts
const scriptsDir = path.join(docsDir, 'scripts');
if (fs.existsSync(scriptsDir)) {
  const jsFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));

  jsFiles.forEach(filename => {
    const filePath = path.join(scriptsDir, filename);
    let js = fs.readFileSync(filePath, 'utf-8');

    // Replace "/data/xyz" → "data/xyz" etc.
    js = js.replace(/(['"`])\/(data|images|styles|scripts|logo\.png)/g, '$1$2');

    fs.writeFileSync(filePath, js);
    console.log(`✔ Patched ${filename}`);
  });
}

console.log('\n✅ Build complete: docs/ is ready for GitHub Pages');

// Patch image paths in meals.json (if using absolute /images/... paths)
const mealsPath = path.join(docsDir, 'data', 'meals.json');

if (fs.existsSync(mealsPath)) {
  let meals = JSON.parse(fs.readFileSync(mealsPath, 'utf-8'));

  meals.forEach(entry => {
    if (entry.image && entry.image.startsWith('/')) {
      entry.image = entry.image.replace(/^\//, ''); // Remove leading slash
    }
  });

  fs.writeFileSync(mealsPath, JSON.stringify(meals, null, 2));
  console.log('✔ Patched image paths in data/meals.json');
}

// Patch all .css files in docs/styles
const stylesDir = path.join(docsDir, 'styles');
if (fs.existsSync(stylesDir)) {
  const cssFiles = fs.readdirSync(stylesDir).filter(f => f.endsWith('.css'));

  cssFiles.forEach(filename => {
    const filePath = path.join(stylesDir, filename);
    let css = fs.readFileSync(filePath, 'utf-8');

    // Replace url("/images/...") → url("images/...")
    css = css.replace(/url\(["']?\/(images\/[^"')]+)["']?\)/g, 'url("images/$1")');

    fs.writeFileSync(filePath, css);
    console.log(`✔ Patched ${filename}`);
  });
}
