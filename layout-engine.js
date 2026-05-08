(function() {
    const STORAGE_KEY = 'na_layout_overrides';
    const publishedOverrides = window.NA_PUBLISHED_LAYOUT || {};
    const localOverrides = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    
    // Merge: Local overrides (drafts) take precedence
    let overrides = { ...publishedOverrides, ...localOverrides };


    /**
     * Applies the stored layout overrides by injecting a dynamic <style> tag.
     * Uses media queries for Desktop, Tablet, and Mobile support.
     */
    function applyLayout() {
        const styleId = 'na-layout-styles';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }

        let css = '';
        const breakpoints = {
            desktop: '@media (min-width: 1201px)',
            tablet: '@media (max-width: 1200px) and (min-width: 769px)',
            mobile: '@media (max-width: 768px)'
        };

        // Global base for layout elements
        css += `[data-layout] { transition: width 0.3s ease, height 0.3s ease, transform 0.3s ease, border-radius 0.3s ease, opacity 0.3s ease; }\n`;

        for (const [key, config] of Object.entries(overrides)) {
            for (const [bp, styles] of Object.entries(config)) {
                if (!breakpoints[bp]) continue;
                
                css += `${breakpoints[bp]} {\n  [data-layout="${key}"] {\n`;
                for (const [prop, val] of Object.entries(styles)) {
                    if (val === undefined || val === null || val === '') continue;
                    
                    // Convert camelCase to kebab-case
                    const kebabProp = prop.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
                    
                    // Focal point mapping
                    const finalProp = kebabProp === 'focal-point' ? 'object-position' : kebabProp;
                    
                    css += `    ${finalProp}: ${val} !important;\n`;
                }
                css += `  }\n}\n`;
            }
        }
        styleEl.innerHTML = css;
    }

    // Expose refresh function to be called by the editor when changes occur
    window.refreshLayout = function(newOverrides) {
        if (newOverrides) {
            overrides = newOverrides;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
        }
        applyLayout();
    };

    // Initial application
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyLayout);
    } else {
        applyLayout();
    }
})();
