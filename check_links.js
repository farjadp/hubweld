const fs = require('fs');
const path = require('path');

const BUILD_ROUTES = [
  '/',
  '/_not-found',
  '/about',
  '/about/product',
  '/about/team',
  '/admin',
  '/admin/blog',
  '/admin/blog/categories',
  '/admin/blog/posts/[id]/edit',
  '/admin/blog/posts/new',
  '/admin/blog/tags',
  '/admin/jobs',
  '/admin/orders',
  '/admin/products',
  '/admin/suppliers',
  '/admin/users',
  '/blog',
  '/blog/[slug]',
  '/cart',
  '/checkout',
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/supplier',
  '/dashboard/supplier/orders',
  '/dashboard/supplier/orders/[id]',
  '/dashboard/supplier/products',
  '/dashboard/supplier/products/[id]/edit',
  '/dashboard/supplier/products/new',
  '/directory',
  '/jobs',
  '/jobs/[id]',
  '/jobs/new',
  '/login',
  '/orders',
  '/orders/[id]',
  '/register',
  '/shop',
  '/shop/c/[slug]',
  '/shop/p/[slug]',
  '/solutions/brokers',
  '/solutions/distributors',
  '/solutions/integrators',
  '/welders/[id]',
];

function getRegexForRoute(route) {
  let regexStr = route.replace(/\[\w+\]/g, '[^/]+');
  return new RegExp('^' + regexStr + '$');
}

function checkHref(href) {
  // Remove query params and hash
  let cleanHref = href.split('?')[0].split('#')[0];
  if (cleanHref === '') return true; // anchor only
  if (cleanHref.startsWith('http')) return true; // external link
  if (cleanHref.startsWith('mailto')) return true;

  for (const route of BUILD_ROUTES) {
    if (getRegexForRoute(route).test(cleanHref)) {
      return true;
    }
  }
  return false;
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

const brokenLinks = [];
const hrefRegex = /href=(["'])(.*?)\1|href=\{`([^`]+)`\}/g;

walkDir('./src', (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    let href = match[2] || match[3];
    // Handle template strings loosely
    let testHref = href.replace(/\$\{[^}]+\}/g, 'test-id');
    if (!checkHref(testHref)) {
      brokenLinks.push({ file: filePath, href: href, testHref: testHref });
    }
  }
});

console.log(JSON.stringify(brokenLinks, null, 2));
