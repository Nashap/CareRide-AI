const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  // Backgrounds
  { regex: /\bbg-white\b/g, replace: 'bg-cr-card' },
  { regex: /\bbg-slate-50\b/g, replace: 'bg-cr-bg' },
  { regex: /\bbg-gray-50\b/g, replace: 'bg-cr-bg' },
  { regex: /\bbg-cyan-50\b/g, replace: 'bg-cr-bg' },
  { regex: /\bbg-slate-100\b/g, replace: 'bg-cr-surface' },
  { regex: /\bbg-gray-100\b/g, replace: 'bg-cr-surface' },
  { regex: /\bbg-slate-900\b/g, replace: 'bg-cr-primary' },

  // Primary Colors (Teal/Green)
  { regex: /\bbg-teal-600\b/g, replace: 'bg-cr-primary' },
  { regex: /\bbg-teal-500\b/g, replace: 'bg-cr-primary' },
  { regex: /\bbg-teal-700\b/g, replace: 'bg-cr-primary-hover' },
  { regex: /\bhover:bg-teal-700\b/g, replace: 'hover:bg-cr-primary-hover' },
  { regex: /\bhover:bg-teal-600\b/g, replace: 'hover:bg-cr-primary-hover' },
  { regex: /\btext-teal-600\b/g, replace: 'text-cr-primary' },
  { regex: /\btext-teal-700\b/g, replace: 'text-cr-primary' },
  { regex: /\bhover:text-teal-600\b/g, replace: 'hover:text-cr-primary' },
  { regex: /\bhover:text-teal-700\b/g, replace: 'hover:text-cr-primary' },
  { regex: /\bbg-teal-50\b/g, replace: 'bg-cr-sage/20' },
  { regex: /\bbg-teal-100\b/g, replace: 'bg-cr-sage/40' },
  { regex: /\btext-teal-800\b/g, replace: 'text-cr-primary' },
  { regex: /\border-teal-600\b/g, replace: 'border-cr-primary' },
  { regex: /\bhover:border-teal-600\b/g, replace: 'hover:border-cr-primary' },
  { regex: /\bring-teal-500\b/g, replace: 'ring-cr-primary' },

  // Text Colors
  { regex: /\btext-slate-900\b/g, replace: 'text-cr-text-primary' },
  { regex: /\btext-gray-900\b/g, replace: 'text-cr-text-primary' },
  { regex: /\btext-slate-800\b/g, replace: 'text-cr-text-primary' },
  { regex: /\btext-gray-800\b/g, replace: 'text-cr-text-primary' },
  { regex: /\btext-slate-700\b/g, replace: 'text-cr-text-muted' },
  { regex: /\btext-gray-700\b/g, replace: 'text-cr-text-muted' },
  { regex: /\btext-slate-600\b/g, replace: 'text-cr-text-muted' },
  { regex: /\btext-gray-600\b/g, replace: 'text-cr-text-muted' },
  { regex: /\btext-slate-500\b/g, replace: 'text-cr-text-muted' },
  { regex: /\btext-gray-500\b/g, replace: 'text-cr-text-muted' },

  // Borders
  { regex: /\bborder-slate-200\b/g, replace: 'border-cr-border' },
  { regex: /\bborder-gray-200\b/g, replace: 'border-cr-border' },
  { regex: /\bborder-slate-100\b/g, replace: 'border-cr-border' },
  { regex: /\bborder-gray-100\b/g, replace: 'border-cr-border' },
  { regex: /\bborder-slate-300\b/g, replace: 'border-cr-border' },
  { regex: /\bborder-gray-300\b/g, replace: 'border-cr-border' },
  { regex: /\bdivide-slate-200\b/g, replace: 'divide-cr-border' },
  { regex: /\bdivide-gray-200\b/g, replace: 'divide-cr-border' },

  // Layout Width Adjustments
  // Make max-w-7xl into full width per instructions: "Make every section use the full browser width (100%)."
  { regex: /\bmax-w-7xl\b/g, replace: 'w-full max-w-full' },
  { regex: /\bmax-w-6xl\b/g, replace: 'w-full max-w-full' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      // Skip Navbar and ThemeContext as we already did them manually
      if (fullPath.includes('Navbar.jsx') || fullPath.includes('ThemeContext.jsx')) {
          continue;
      }

      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      replacements.forEach(({ regex, replace }) => {
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log("Done.");
