(function() {
    // 1. Initialize Schema & Content
    let cmsContent = JSON.parse(localStorage.getItem('na_cms_content')) || {};
    let cmsSchema = JSON.parse(localStorage.getItem('na_cms_schema')) || {};
    let schemaUpdated = false;

    // 2. Scan DOM and apply content
    function initCMS() {
        const editableElements = document.querySelectorAll('[data-edit]');
        editableElements.forEach(el => {
            const key = el.getAttribute('data-edit');
            
            // Register in schema if not exists
            if (!cmsSchema[key]) {
                // Determine section from key (e.g. "Hero_Title" -> "Hero")
                let section = 'General';
                if (key.includes('_')) {
                    section = key.split('_')[0];
                }
                
                cmsSchema[key] = {
                    default: el.innerHTML.trim(),
                    section: section
                };
                schemaUpdated = true;
            }

            // Apply content if exists in overrides
            if (cmsContent[key] !== undefined && cmsContent[key] !== null && cmsContent[key] !== '') {
                el.innerHTML = cmsContent[key];
            }
        });

        if (schemaUpdated) {
            localStorage.setItem('na_cms_schema', JSON.stringify(cmsSchema));
        }
    }

    // Run on DOMContentLoaded or immediately if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCMS);
    } else {
        initCMS();
    }

    // Listen for storage events (e.g. when Admin saves changes in another tab)
    window.addEventListener('storage', (e) => {
        if (e.key === 'na_cms_content') {
            cmsContent = JSON.parse(e.newValue) || {};
            initCMS(); // Re-apply changes
        }
    });

    // 3. Inline Editing Mode
    if (localStorage.getItem('na_admin_logged_in') === 'true') {
        document.addEventListener('DOMContentLoaded', () => {
            // Inject styles
            const style = document.createElement('style');
            style.textContent = `
                .cms-edit-mode [data-edit] {
                    outline: 2px dashed #f39c12 !important;
                    outline-offset: 4px;
                    cursor: pointer !important;
                    position: relative;
                    transition: outline-color 0.2s, background 0.2s;
                }
                .cms-edit-mode [data-edit]:hover {
                    outline-color: #e74c3c !important;
                    background: rgba(231, 76, 60, 0.1) !important;
                }
                .cms-toggle-btn {
                    position: fixed;
                    bottom: 2rem;
                    left: 2rem;
                    background: #f39c12;
                    color: #fff;
                    padding: 0.8rem 1.5rem;
                    border-radius: 30px;
                    font-family: sans-serif;
                    font-size: 0.85rem;
                    font-weight: bold;
                    cursor: pointer;
                    z-index: 999999;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    border: none;
                    transition: background 0.2s;
                }
                .cms-toggle-btn.active {
                    background: #e74c3c;
                }
                .cms-toggle-btn:hover {
                    opacity: 0.9;
                }
            `;
            document.head.appendChild(style);

            // Inject toggle button
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'cms-toggle-btn';
            toggleBtn.innerText = 'Enable CMS Edit';
            
            let editModeActive = false;
            toggleBtn.addEventListener('click', () => {
                editModeActive = !editModeActive;
                if (editModeActive) {
                    document.body.classList.add('cms-edit-mode');
                    toggleBtn.classList.add('active');
                    toggleBtn.innerText = 'Disable CMS Edit';
                } else {
                    document.body.classList.remove('cms-edit-mode');
                    toggleBtn.classList.remove('active');
                    toggleBtn.innerText = 'Enable CMS Edit';
                }
            });
            document.body.appendChild(toggleBtn);

            // Handle clicking elements
            document.addEventListener('click', (e) => {
                if (!editModeActive) return;
                const target = e.target.closest('[data-edit]');
                if (target) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const key = target.getAttribute('data-edit');
                    const currentVal = cmsContent[key] !== undefined && cmsContent[key] !== '' ? cmsContent[key] : (cmsSchema[key] ? cmsSchema[key].default : '');
                    
                    const newVal = window.prompt(`Edit content for [${key}]:\n(HTML is supported)`, currentVal);
                    if (newVal !== null) {
                        cmsContent[key] = newVal;
                        localStorage.setItem('na_cms_content', JSON.stringify(cmsContent));
                        target.innerHTML = newVal;
                    }
                }
            }, true); // use capture to intercept clicks on links
        });
    }
})();
