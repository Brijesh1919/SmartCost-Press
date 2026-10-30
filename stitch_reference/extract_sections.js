const fs = require('fs');

function extractDetails(filename) {
  const content = fs.readFileSync('stitch_reference/' + filename, 'utf8');
  console.log('====================================');
  console.log('FILE:', filename);
  
  // Extract main content between header and nav
  const mainMatch = content.match(/<main[\s\S]*?<\/main>/i);
  if (!mainMatch) {
    console.log('No <main> tag found');
    return;
  }
  const main = mainMatch[0];
  
  // Extract all section headers or card headers
  const sections = Array.from(main.matchAll(/<(?:h1|h2|h3|h4|div|span)[^>]*class=["'][^"']*(?:title|headline|font-bold|font-semibold)[^"']*["'][^>]*>([\s\S]*?)<\/(?:h1|h2|h3|h4|div|span)>/gi))
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(t => t.length > 2 && t.length < 80);
  
  console.log('Key text/headings:', [...new Set(sections)].slice(0, 15));

  // Extract all inputs, selects, buttons
  const buttons = Array.from(main.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi))
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(t => t.length > 0 && t.length < 50);
  console.log('Buttons:', [...new Set(buttons)]);

  const inputs = Array.from(main.matchAll(/<input[^>]*name=["']([^"']+)["']/gi)).map(m => m[1]);
  const selects = Array.from(main.matchAll(/<select[^>]*name=["']([^"']+)["']/gi)).map(m => m[1]);
  console.log('Input names:', [...new Set(inputs)]);
  console.log('Select names:', [...new Set(selects)]);
}

[
  'home_dashboard.html',
  'step1_product.html',
  'step2_paper.html',
  'step3_layout.html',
  'step4_summary.html',
  'quotations_list.html',
  'quotation_details.html',
  'settings.html'
].forEach(extractDetails);

