import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const blogPosts = [
  {
    slug: "packers-movers-delhi-cost-guide",
    title: "Packers and Movers Cost in Delhi 2026",
    subtitle: "Complete Price Guide",
    category: "Moving Guide",
    gradient: ["#0075cc", "#00b4ff"]
  },
  {
    slug: "corporate-relocation-guide-delhi-ncr",
    title: "Corporate Relocation Guide Delhi NCR 2026",
    subtitle: "Office Shifting Checklist & Timeline",
    category: "Corporate Relocation",
    gradient: ["#0f1f3d", "#1a3260"]
  },
  {
    slug: "international-relocation-india-complete-guide",
    title: "International Relocation from India",
    subtitle: "Customs, Costs and Process Guide 2026",
    category: "International Moving",
    gradient: ["#5b21b6", "#1d4ed8"]
  },
  {
    slug: "packers-movers-delhi-to-bangalore",
    title: "Packers & Movers Delhi to Bangalore",
    subtitle: "Charges, Transit Time and What to Expect",
    category: "City Routes",
    gradient: ["#0f766e", "#0d9488"]
  },
  {
    slug: "checklist-before-shifting-house-india",
    title: "House Shifting Checklist India 2026",
    subtitle: "50 Things to Do Before Moving",
    category: "Moving Guide",
    gradient: ["#0369a1", "#0284c7"]
  },
  {
    slug: "packers-movers-gurgaon-guide",
    title: "Packers and Movers in Gurgaon 2026",
    subtitle: "Cost, Tips and How to Choose",
    category: "City Guide",
    gradient: ["#4338ca", "#4f46e5"]
  },
  {
    slug: "office-relocation-checklist-india",
    title: "Office Relocation Checklist India 2026",
    subtitle: "8-Week Corporate Moving Plan",
    category: "Corporate Relocation",
    gradient: ["#1e293b", "#334155"]
  },
  {
    slug: "nri-return-india-relocation-guide",
    title: "NRI Return to India Relocation Guide 2026",
    subtitle: "Customs, Shipping and Settling In",
    category: "International Moving",
    gradient: ["#6d28d9", "#7c3aed"]
  },
  {
    slug: "car-transport-delhi-india-guide",
    title: "Car Transport in Delhi 2026",
    subtitle: "How It Works, Cost and Safety Tips",
    category: "Vehicle Transport",
    gradient: ["#be123c", "#e11d48"]
  },
  {
    slug: "packers-movers-noida-guide",
    title: "Packers and Movers in Noida 2026",
    subtitle: "Charges, Coverage and Tips",
    category: "City Guide",
    gradient: ["#0f766e", "#14b8a6"]
  }
];

function wrapText(text, maxChars = 28) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).length > maxChars) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += ' ' + word;
    }
  }
  if (currentLine) {
    lines.push(currentLine.trim());
  }
  return lines;
}

async function generateImage(post) {
  const width = 1200;
  const height = 628;

  const escapeXml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const titleLines = wrapText(post.title, 26).map(escapeXml);
  const subtitleLines = wrapText(post.subtitle, 42).map(escapeXml);
  const escapedCategory = escapeXml(post.category);

  // SVG representation for the graphic card
  let titleYStart = 260 - (titleLines.length - 1) * 35;
  let titleSvg = titleLines.map((line, idx) => {
    return `<text x="100" y="${titleYStart + idx * 70}" fill="#ffffff" font-family="'Inter', 'Outfit', 'Segoe UI', sans-serif" font-weight="800" font-size="56" letter-spacing="-1">${line}</text>`;
  }).join('\n');

  let subtitleYStart = titleYStart + titleLines.length * 70 + 20;
  let subtitleSvg = subtitleLines.map((line, idx) => {
    return `<text x="100" y="${subtitleYStart + idx * 40}" fill="rgba(255, 255, 255, 0.8)" font-family="'Inter', 'DM Sans', 'Segoe UI', sans-serif" font-weight="400" font-size="28">${line}</text>`;
  }).join('\n');

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${post.gradient[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${post.gradient[1]};stop-opacity:1" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1"/>
        </pattern>
        <linearGradient id="badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(255,255,255,0.25);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgba(255,255,255,0.05);stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#grad)" />
      
      <!-- Overlay grid mesh -->
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      <!-- Decorative geometric curves -->
      <circle cx="1100" cy="100" r="300" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="20" />
      <circle cx="1100" cy="100" r="450" fill="none" stroke="rgba(255, 255, 255, 0.02)" stroke-width="40" />
      <path d="M-100,600 C300,500 500,700 1300,500" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="6" />

      <!-- Branding Header (Composited dynamically via sharp) -->

      <!-- Category Badge -->
      <g transform="translate(100, 140)">
        <rect x="0" y="0" width="220" height="32" rx="16" fill="url(#badge-grad)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
        <circle cx="18" cy="16" r="5" fill="#ffffff" />
        <text x="35" y="21" fill="#ffffff" font-family="'Inter', 'Segoe UI', sans-serif" font-weight="700" font-size="11" letter-spacing="1.5" text-transform="uppercase">${escapedCategory}</text>
      </g>

      <!-- Titles -->
      ${titleSvg}
      ${subtitleSvg}

      <!-- Footer Branding -->
      <rect x="0" y="568" width="1200" height="60" fill="rgba(0, 0, 0, 0.15)" />
      <text x="100" y="603" fill="rgba(255, 255, 255, 0.7)" font-family="'Inter', 'Segoe UI', sans-serif" font-weight="500" font-size="14" letter-spacing="0.5">Website: www.panyaglobal.in</text>
      <text x="1100" y="603" text-anchor="end" fill="rgba(255, 255, 255, 0.7)" font-family="'Inter', 'Segoe UI', sans-serif" font-weight="500" font-size="14" letter-spacing="0.5">Call: +91-11-41556447</text>
    </svg>
  `;

  const outputDir = path.resolve('public/blog-images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${post.slug}-featured.webp`);
  
  const logoPath = path.resolve('src/assets/logo-white.webp');
  const logoBuffer = await sharp(logoPath)
    .resize({ height: 48 })
    .toBuffer();

  await sharp(Buffer.from(svg))
    .composite([
      {
        input: logoBuffer,
        top: 70,
        left: 100,
      }
    ])
    .webp({ quality: 90 })
    .toFile(outputPath);
  
  console.log(`Generated: ${outputPath}`);
}

async function main() {
  console.log('Generating featured images for blog posts...');
  for (const post of blogPosts) {
    try {
      await generateImage(post);
    } catch (err) {
      console.error(`Error generating image for ${post.slug}:`, err);
    }
  }
  console.log('Finished generating images.');
}

main();
