const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

const publicDir = path.join(__dirname, 'public');
const viewsDir = path.join(__dirname, 'views');
const docsDir = path.join(__dirname, 'docs');

// Clean or create /docs
fse.removeSync(docsDir);
fse.mkdirSync(docsDir);

// 1. Copy public content (images, styles, scripts, logo.png)
fse.copySync(publicDir, docsDir);
console.log('✔ Copied public folder to docs/');

// 2. Copy and patch index.html
const inputHtmlPath = path.join(viewsDir, 'index.html');
const outputHtmlPath = path.join(docsDir, 'index.html');

let html = fs.readFileSync(inputHtmlPath, 'utf-8');

// Patch paths: remove leading slashes (e.g. /styles/base.css → styles/base.css)
html = html.replace(/(href|src)="\/(.*?)"/g, '$1="$2"');

fs.writeFileSync(outputHtmlPath, html);
console.log('✔ Patched and copied index.html to docs/');

console.log('✅ GitHub Pages build complete: open docs/index.html or push to GitHub');
