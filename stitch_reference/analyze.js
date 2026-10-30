const fs = require('fs');
const files = [
  'home_dashboard.html',
  'step1_product.html',
  'step2_paper.html',
  'step3_layout.html',
  'step4_summary.html',
  'quotations_list.html',
  'quotation_details.html',
  'settings.html'
];

for (const f of files) {
  const content = fs.readFileSync('stitch_reference/' + f, 'utf8');
  console.log('=== ' + f + ' ===');
  const titleMatch = content.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) console.log('Title:', titleMatch[1].trim());

  // Check headers / h1 / h2 / h3
  const h1 = (content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || []).map(s => s.replace(/<[^>]+>/g, '').trim());
  const h2 = (content.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || []).map(s => s.replace(/<[^>]+>/g, '').trim());
  console.log('H1:', h1);
  console.log('H2:', h2.slice(0, 5));

  // Icons used
  const icons = Array.from(content.matchAll(/class=["'][^"']*material-symbols[^"']*["'][^>]*>([^<]+)<\//g)).map(m => m[1].trim());
  console.log('Icons:', [...new Set(icons)].join(', '));
}

