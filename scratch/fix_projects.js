const fs = require('fs');

const filePath = 'g:/In/NA ARTISTRY/WEB/projects.html';
let content = fs.readFileSync(filePath, 'utf-8');

const projects = [
    { title: 'Minimal Identity System', cat: 'Branding', category: 'graphic-design', desc: 'A bold and structured logo inspired by the core elements of golf. Featuring a central ball and crossed clubs within a shield form, the design represents precision, strength, and tradition. Built with clean geometry and strong typography, the logo ensures clarity, versatility, and a consistent presence across all brand touchpoints.', ph: 'ph-1', gallery: ['Branding-01.jpg', 'Branding-02.jpg', 'Branding-03.jpg', 'Branding-04.jpg'] },
    { title: 'Book Cover Design', cat: 'Editorial', category: 'editorial', desc: 'A striking book cover designed with clarity and elegance. Clean typographic hierarchy, compelling imagery, and a cohesive layout system that turns content into a visually engaging narrative.', ph: 'ph-2' },
    { title: 'Product Visualisation', cat: '3D Visual', category: '3d-visual', desc: 'Photorealistic 3D renders of consumer products before manufacturing. Each angle carefully lit and composed to showcase form, material, and detail at the highest fidelity.', ph: 'ph-3' },
    { title: 'Corporate Brand Guidelines', cat: 'Branding', category: 'graphic-design', desc: 'A modular brand guideline document covering logo usage, typography, iconography, photography direction, and digital application rules — ensuring consistency across every touchpoint.', ph: 'ph-4' },
    { title: 'Campaign Series', cat: 'Poster Design', category: 'graphic-design', desc: 'A series of five interconnected campaign posters designed for maximum visual impact. Bold compositions with restrained colour palettes create a unified yet dynamic system.', ph: 'ph-5' },
    { title: 'Magazine Layout System', cat: 'Editorial', category: 'editorial', desc: 'A flexible editorial grid system designed for a quarterly lifestyle magazine. Modular templates allow for creative variation while maintaining brand consistency across every issue.', ph: 'ph-6' },
    { title: 'Concept Rendering Suite', cat: '3D Visual', category: '3d-visual', desc: 'A collection of concept renders exploring material studies, lighting techniques, and spatial compositions — pushing the boundary between digital art and commercial visualization.', ph: 'ph-1' },
    { title: 'Visual Identity Refresh', cat: 'Branding', category: 'graphic-design', desc: 'A thoughtful evolution of an established brand — modernising the visual language while preserving brand equity. Updated logo, extended colour system, and refreshed collateral.', ph: 'ph-3' },
    { title: 'Architectural Walkthrough', cat: '3D Visual', category: '3d-visual', desc: 'An immersive 3D walkthrough of a residential development project. Realistic lighting, materials, and landscaping bring the space to life before construction begins.', ph: 'ph-5' },
    { title: 'Maternity Campaign 2026', cat: 'Graphic Design', category: 'graphic-design', desc: '<p style="font-size: 1.1em; color: #fff; margin-top: -0.5rem; margin-bottom: 1.5rem;">for KPJ Penang Specialist Hospital</p><p>A cohesive healthcare campaign designed to promote maternity packages through a clear and emotionally engaging visual system. The project focuses on building trust, clarity, and premium perception within a medical context.</p><p>The campaign consists of three key visuals representing different service tiers:</p><ul><li>Normal Delivery</li><li>Elective Caesarean</li><li>Emergency Caesarean</li></ul><p>Each visual maintains a consistent layout structure while using distinct color accents to differentiate the package types.</p><p><strong>Design Direction:</strong></p><ul><li>Clean and modern healthcare aesthetic</li><li>Soft, warm, and emotional tone</li><li>Strong typography hierarchy for pricing and information clarity</li><li>Consistent grid system across all visuals</li><li>Balanced composition between image and information</li></ul>', ph: 'ph-2', gallery: ['MATERNITY1.jpg', 'MATERNITY2.jpg', 'MATERNITY3.jpg'] }
];

// Update Nav
content = content.replace(
    '<a href="index.html" class="nav-logo">NA Artistry</a>\n    <a href="index.html" class="nav-back">← Back to Home</a>',
    '<a href="index.html" class="nav-logo" data-edit="PortfolioNav_Logo">NA Artistry</a>\n    <a href="index.html" class="nav-back" data-edit="PortfolioNav_Back">← Back to Home</a>'
);

// Update Header
content = content.replace(
    '<h1>Selected Projects</h1>\n    <p>A curated collection of our work across graphic design, editorial, and 3D visualization.</p>',
    '<h1 data-edit="PortfolioHeader_Title">Selected Projects</h1>\n    <p data-edit="PortfolioHeader_Desc">A curated collection of our work across graphic design, editorial, and 3D visualization.</p>'
);

// Update Filters
content = content.replace(
    '<button class="filter-btn active" data-filter="all">All</button>',
    '<button class="filter-btn active" data-filter="all" data-edit="PortfolioFilter_All">All</button>'
).replace(
    '<button class="filter-btn" data-filter="graphic-design">Graphic Design</button>',
    '<button class="filter-btn" data-filter="graphic-design" data-edit="PortfolioFilter_Graphic">Graphic Design</button>'
).replace(
    '<button class="filter-btn" data-filter="editorial">Editorial &amp; Publication</button>',
    '<button class="filter-btn" data-filter="editorial" data-edit="PortfolioFilter_Editorial">Editorial &amp; Publication</button>'
).replace(
    '<button class="filter-btn" data-filter="3d-visual">3D Visual Design</button>',
    '<button class="filter-btn" data-filter="3d-visual" data-edit="PortfolioFilter_3D">3D Visual Design</button>'
);

// Update Footer
content = content.replace(
    '<p class="footer-copy">© 2025 NA Artistry. All rights reserved.</p>',
    '<p class="footer-copy" data-edit="PortfolioFooter_Copyright">© 2025 NA Artistry. All rights reserved.</p>'
);

// Replace Javascript array usage in HTML
projects.forEach((p, i) => {
    let regex = new RegExp(`<div class="project-card" data-category="[^"]*" data-index="${i}">[\\s\\S]*?<div class="card-arrow">↗</div>\\s*</div>`);
    let match = content.match(regex);
    if (match) {
        let cardHtml = match[0];
        
        cardHtml = cardHtml.replace(/<p class="card-cat">.*?<\/p>/, `<p class="card-cat" data-edit="PortfolioProject_${i}_Cat">${p.cat}</p>`);
        cardHtml = cardHtml.replace(/<p class="card-title">.*?<\/p>/, `<p class="card-title" data-edit="PortfolioProject_${i}_Title">${p.title}</p>`);
        cardHtml = cardHtml.replace(/<p class="card-cta">.*?<\/p>/, `<p class="card-cta" data-edit="PortfolioProject_${i}_CTA">View Project →</p>`);
        
        let galleryStr = p.gallery ? p.gallery.join(",") : "";
        let hiddenData = `\n      <div class="card-desc" style="display:none;" data-edit="PortfolioProject_${i}_Desc">${p.desc}</div>`;
        hiddenData += `\n      <div class="card-gallery" style="display:none;" data-gallery="${galleryStr}"></div>`;
        hiddenData += `\n      <div class="card-ph" style="display:none;" data-ph="${p.ph}"></div>\n    </div>`;
        
        cardHtml = cardHtml.replace('\n    </div>', hiddenData);
        content = content.replace(match[0], cardHtml);
    }
});

// Remove const projects = [...]
content = content.replace(/const projects\s*=\s*\[[\s\S]*?\];/, '// projects data is now encoded in DOM');

// Update click listener
const oldClickListener = `    cards.forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index);
        const p = projects[idx];
        document.getElementById('modalCat').textContent = p.cat;
        document.getElementById('modalTitle').textContent = p.title;
        document.getElementById('modalDesc').innerHTML = p.desc;
        // Clone the SVG or image from card into modal hero
        const heroEl = document.getElementById('modalHero');
        heroEl.className = 'modal-hero ' + p.ph;`;

const newClickListener = `    cards.forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.querySelector('.card-cat').textContent;
        const title = card.querySelector('.card-title').textContent;
        const desc = card.querySelector('.card-desc').innerHTML;
        const ph = card.querySelector('.card-ph').dataset.ph;
        const galleryRaw = card.querySelector('.card-gallery').dataset.gallery;
        const galleryArr = galleryRaw ? galleryRaw.split(',') : [];

        document.getElementById('modalCat').textContent = cat;
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalDesc').innerHTML = desc;
        
        // Clone the SVG or image from card into modal hero
        const heroEl = document.getElementById('modalHero');
        heroEl.className = 'modal-hero ' + ph;`;

content = content.replace(oldClickListener, newClickListener);

// Update gallery setup
const oldGallerySetup = `        if (p.gallery && p.gallery.length > 0) {
          gallery.style.gridTemplateColumns = p.gallery.length === 3 ? 'repeat(3, 1fr)' : '1fr 1fr';
          p.gallery.forEach((src, i) => {
            const item = document.createElement('div');
            item.className = 'modal-gallery-item';
            const gImg = document.createElement('img');
            gImg.src = src;
            gImg.alt = p.title + ' gallery ' + (i + 1);
            item.appendChild(gImg);
            gallery.appendChild(item);
          });`;

const newGallerySetup = `        if (galleryArr.length > 0) {
          gallery.style.gridTemplateColumns = galleryArr.length === 3 ? 'repeat(3, 1fr)' : '1fr 1fr';
          galleryArr.forEach((src, i) => {
            const item = document.createElement('div');
            item.className = 'modal-gallery-item';
            const gImg = document.createElement('img');
            gImg.src = src;
            gImg.alt = title + ' gallery ' + (i + 1);
            item.appendChild(gImg);
            gallery.appendChild(item);
          });`;

content = content.replace(oldGallerySetup, newGallerySetup);

// Inject cms.js
if (!content.includes('<script src="cms.js"></script>')) {
    content = content.replace('</body>', '<script src="cms.js"></script>\n</body>');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Done");
