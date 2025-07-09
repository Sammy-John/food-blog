const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

const publicDir = path.join(__dirname, 'public');
const viewsDir = path.join(__dirname, 'views');
const docsDir = path.join(__dirname, 'docs');
const repoBase = 'food-blog'; // Your GitHub Pages repo name

// 🧹 Clean and recreate /docs
fse.removeSync(docsDir);
fs.mkdirSync(docsDir);

// 📁 Copy everything from /public to /docs
fse.copySync(publicDir, docsDir);
console.log('✔ Copied public/ to docs/');

// 📝 Copy and patch index.html
const indexInputPath = path.join(viewsDir, 'index.html');
const indexOutputPath = path.join(docsDir, 'index.html');
let html = fs.readFileSync(indexInputPath, 'utf-8');

// Fix href/src: remove leading slashes
html = html.replace(/(href|src)=["']\/(.*?)["']/g, '$1="$2"');
fs.writeFileSync(indexOutputPath, html);
console.log('✔ Patched index.html paths and copied to docs/');

// 🔧 Patch all .js files in docs/scripts
const scriptsDir = path.join(docsDir, 'scripts');
if (fs.existsSync(scriptsDir)) {
  const jsFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));

  jsFiles.forEach(filename => {
    const filePath = path.join(scriptsDir, filename);
    let js = fs.readFileSync(filePath, 'utf-8');

    // Patch asset paths and dynamic background-image URLs
    js = js
      .replace(/(['"`])\/(data|images|styles|scripts|logo\.png)/g, '$1$2')                    // Remove leading slashes
      .replace(/url\((["']?)\/images\//g, 'url($1images/')                                    // url("/images/")
      .replace(/url\((["']?)images\//g, `url($1/${repoBase}/images/`)                         // url("images/...") → absolute GitHub path
      .replace(/\.style\.setProperty\(['"`]--bg-img['"`],\s*.*?\);?/g, '');                   // Remove --bg-img usage

    fs.writeFileSync(filePath, js);
    console.log(`✔ Patched ${filename}`);
  });
}

// 📦 Patch meals.json image paths
const mealsPath = path.join(docsDir, 'data', 'meals.json');
if (fs.existsSync(mealsPath)) {
  let meals = JSON.parse(fs.readFileSync(mealsPath, 'utf-8'));

  meals.forEach(entry => {
    if (entry.image && entry.image.startsWith('/')) {
      entry.image = entry.image.replace(/^\//, '');
    }
  });

  fs.writeFileSync(mealsPath, JSON.stringify(meals, null, 2));
  console.log('✔ Patched image paths in data/meals.json');
}

// 🎨 Patch background-image paths in all .css files
const stylesDir = path.join(docsDir, 'styles');
if (fs.existsSync(stylesDir)) {
  const cssFiles = fs.readdirSync(stylesDir).filter(f => f.endsWith('.css'));

  cssFiles.forEach(filename => {
    const filePath = path.join(stylesDir, filename);
    let css = fs.readFileSync(filePath, 'utf-8');

    // Patch url('/images/...') and url('images/...') → url('/food-blog/images/...')
    css = css
      .replace(/url\(["']?\/(images\/[^"')]+)["']?\)/g, `url("/${repoBase}/$1")`)
      .replace(/url\(["']?(images\/[^"')]+)["']?\)/g, `url("/${repoBase}/$1")`);

    fs.writeFileSync(filePath, css);
    console.log(`✔ Patched ${filename}`);
  });
}

console.log('\n✅ Build complete: docs/ is ready for GitHub Pages');
