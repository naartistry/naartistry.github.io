(function() {
    // 1. Initialize Schema & Content
    const publishedContent = window.NA_PUBLISHED_CONTENT || {};
    const localContent = JSON.parse(localStorage.getItem('na_cms_content')) || {};
    
    // Merge: Local storage (drafts) takes precedence for the admin
    let cmsContent = { ...publishedContent, ...localContent };
    
    let cmsSchema = JSON.parse(localStorage.getItem('na_cms_schema')) || {};

    let schemaUpdated = false;

    // 2. Scan DOM and apply content
    function initCMS() {
        const editableElements = document.querySelectorAll('[data-edit]');
        editableElements.forEach(el => {
            const key = el.getAttribute('data-edit');
            
            // Register in schema if not exists
            if (!cmsSchema[key]) {
                let section = 'General';
                if (key.includes('_')) section = key.split('_')[0];
                
                let defaultVal = el.innerHTML.trim();
                let type = 'text';

                if (el.tagName === 'IMG') {
                    defaultVal = el.getAttribute('src');
                    type = 'image';
                } else if (el.getAttribute('data-cms-type') === 'image' || el.style.backgroundImage) {
                    const bgMatch = el.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
                    defaultVal = bgMatch ? bgMatch[1] : '';
                    type = 'image';
                }
                
                cmsSchema[key] = {
                    default: defaultVal,
                    section: section,
                    type: type
                };
                schemaUpdated = true;
            }

            // Apply content if exists in overrides
            if (cmsContent[key] !== undefined && cmsContent[key] !== null && cmsContent[key] !== '') {
                let val = cmsContent[key];
                
                // Optimize Cloudinary URLs
                if (val.includes('cloudinary.com') && !val.includes('f_auto')) {
                    val = val.replace('/upload/', '/upload/f_auto,q_auto/');
                }

                if (el.tagName === 'IMG') {
                    el.setAttribute('src', val);
                    el.setAttribute('loading', 'lazy');
                } else if (el.getAttribute('data-cms-type') === 'image' || cmsSchema[key].type === 'image') {
                    el.style.backgroundImage = `url('${val}')`;
                } else {
                    el.innerHTML = val;
                }
            }
        });

        if (schemaUpdated) {
            localStorage.setItem('na_cms_schema', JSON.stringify(cmsSchema));
        }
    }

    // 2.5 Media Upload Helper (Cloudinary)
    async function loadCloudinary() {
        if (window.cloudinary) return window.cloudinary;
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://upload-widget.cloudinary.com/global/all.js';
            script.onload = () => resolve(window.cloudinary);
            document.head.appendChild(script);
        });
    }

    window.triggerImageUpload = async function(key, callback) {
        const cloudinary = await loadCloudinary();
        const config = window.NA_MEDIA_CONFIG || { cloudinary: { cloudName: 'demo', uploadPreset: 'ml_default' } };
        
        const myWidget = cloudinary.createUploadWidget({
            cloudName: config.cloudinary.cloudName,
            uploadPreset: config.cloudinary.uploadPreset,
            sources: ['local', 'url', 'camera', 'google_drive', 'dropbox'],
            multiple: false,
            cropping: true,
            showAdvancedOptions: true,
            styles: {
                palette: {
                    window: "#000000",
                    windowBorder: "#222222",
                    tabIcon: "#FFFFFF",
                    menuIcons: "#888888",
                    textDark: "#000000",
                    textLight: "#FFFFFF",
                    link: "#FFFFFF",
                    action: "#FFFFFF",
                    inactiveTabIcon: "#444444",
                    error: "#F44235",
                    inProgress: "#FFFFFF",
                    complete: "#20B832",
                    sourceBg: "#111111"
                }
            }
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                const url = result.info.secure_url;
                cmsContent[key] = url;
                localStorage.setItem('na_cms_content', JSON.stringify(cmsContent));
                
                // Update DOM elements matching the key
                document.querySelectorAll(`[data-edit="${key}"]`).forEach(el => {
                    if (el.tagName === 'IMG') el.setAttribute('src', url);
                    else el.innerHTML = url; // Fallback
                });

                if (callback) callback(url);
                console.log('NA Media: Upload successful ->', url);
            }
        });
        myWidget.open();
    };

    // Run on DOMContentLoaded or immediately if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCMS);
    } else {
        initCMS();
    }

    // Listen for storage events
    window.addEventListener('storage', (e) => {
        if (e.key === 'na_cms_content') {
            cmsContent = JSON.parse(e.newValue) || {};
            initCMS();
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
                    
                    if (target.tagName === 'IMG' || target.getAttribute('data-cms-type') === 'image') {
                        window.triggerImageUpload(key);
                    } else {
                        const currentVal = cmsContent[key] !== undefined && cmsContent[key] !== '' ? cmsContent[key] : (cmsSchema[key] ? cmsSchema[key].default : '');
                        const newVal = window.prompt(`Edit content for [${key}]:\n(HTML is supported)`, currentVal);
                        if (newVal !== null) {
                            cmsContent[key] = newVal;
                            localStorage.setItem('na_cms_content', JSON.stringify(cmsContent));
                            target.innerHTML = newVal;
                        }
                    }
                }
            }, true);
        });
    }
})();
