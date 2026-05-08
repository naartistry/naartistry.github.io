/**
 * NA Artistry Visual Layout Editor
 * A premium, real-time visual manipulation system for image containers.
 */

(async function() {
    // 1. Dependency Loader
    async function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                console.log(`Loaded: ${src}`);
                resolve();
            };
            script.onerror = (e) => {
                console.error(`Failed to load: ${src}`, e);
                reject(e);
            };
            document.head.appendChild(script);
        });
    }

    try {
        if (!window.React) {
            await loadScript('https://unpkg.com/react@18/umd/react.production.min.js');
            await loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js');
        }
        if (!window.Moveable) {
            await loadScript('https://unpkg.com/moveable@0.54.0/dist/moveable.min.js');
        }
        await loadScript('https://cdn.tailwindcss.com');
        
        console.log("NA Layout Editor: Dependencies verified.");
    } catch (e) {
        console.error("NA Layout Editor: Failed to load dependencies.", e);
        return;
    }

    const { useState, useEffect, useRef, useMemo } = window.React;

    // 2. Editor Component
    function LayoutEditorApp() {
        const [isAdmin, setIsAdmin] = useState(localStorage.getItem('na_admin_logged_in') === 'true');
        const [editMode, setEditMode] = useState(false);
        const [selectedKey, setSelectedKey] = useState(null);
        const [breakpoint, setBreakpoint] = useState('desktop');
        const [overrides, setOverrides] = useState(JSON.parse(localStorage.getItem('na_layout_overrides')) || {});
        
        const moveableRef = useRef(null);
        const targetRef = useRef(null);

        useEffect(() => {
            const checkAdmin = () => setIsAdmin(localStorage.getItem('na_admin_logged_in') === 'true');
            window.addEventListener('storage', checkAdmin);
            const interval = setInterval(checkAdmin, 2000);
            return () => { window.removeEventListener('storage', checkAdmin); clearInterval(interval); };
        }, []);

        useEffect(() => {
            localStorage.setItem('na_layout_overrides', JSON.stringify(overrides));
            if (window.refreshLayout) window.refreshLayout(overrides);
        }, [overrides]);

        useEffect(() => {
            if (!editMode || !selectedKey) {
                if (moveableRef.current) moveableRef.current.destroy();
                return;
            }
            const target = document.querySelector(`[data-layout="${selectedKey}"]`);
            if (!target) return;
            const moveable = new window.Moveable(document.body, {
                target: target,
                draggable: true, resizable: true, rotatable: true,
                snappable: true, snapThreshold: 5,
                elementGuidelines: Array.from(document.querySelectorAll('[data-layout]')),
                snapElement: true, snapVertical: true, snapHorizontal: true,
            });
            moveable.on("drag", ({ target, transform }) => {
                target.style.transform = transform;
                updateOverride(selectedKey, { transform });
            }).on("resize", ({ target, width, height, drag }) => {
                target.style.width = `${width}px`; target.style.height = `${height}px`;
                target.style.transform = drag.transform;
                updateOverride(selectedKey, { width: `${width}px`, height: `${height}px`, transform: drag.transform });
            });
            moveableRef.current = moveable;
            return () => moveable.destroy();
        }, [editMode, selectedKey, breakpoint]);

        const updateOverride = (key, styles) => {
            setOverrides(prev => {
                const newO = { ...prev };
                if (!newO[key]) newO[key] = { desktop: {}, tablet: {}, mobile: {} };
                newO[key][breakpoint] = { ...newO[key][breakpoint], ...styles };
                return newO;
            });
        };

        const currentStyles = useMemo(() => (overrides[selectedKey] && overrides[selectedKey][breakpoint]) || {}, [overrides, selectedKey, breakpoint]);

        useEffect(() => {
            const handleClick = (e) => {
                if (!editMode) return;
                const layoutEl = e.target.closest('[data-layout]');
                if (layoutEl) { e.preventDefault(); e.stopPropagation(); setSelectedKey(layoutEl.getAttribute('data-layout')); }
                else if (!e.target.closest('.na-editor-ui')) setSelectedKey(null);
            };
            document.addEventListener('click', handleClick, true);
            return () => document.removeEventListener('click', handleClick, true);
        }, [editMode]);

        if (!isAdmin) return null;

        return window.React.createElement('div', { className: 'na-editor-ui fixed inset-0 pointer-events-none z-[999999]' },
            window.React.createElement('div', { className: 'absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl pointer-events-auto' },
                window.React.createElement('button', {
                    onClick: () => { setEditMode(!editMode); if (editMode) setSelectedKey(null); },
                    className: `px-6 py-2 rounded-xl font-medium text-sm uppercase transition-all ${editMode ? 'bg-red-500 text-white' : 'bg-white text-black'}`
                }, editMode ? 'Exit Layout' : 'Enter Layout Edit'),
                editMode && window.React.createElement('div', { className: 'flex gap-2 border-l border-white/10 pl-4' },
                    ['desktop', 'tablet', 'mobile'].map(bp => window.React.createElement('button', { key: bp, onClick: () => setBreakpoint(bp), className: `p-2 rounded-lg ${breakpoint === bp ? 'bg-white/20' : 'text-gray-500'}` }, bp[0].toUpperCase()))
                )
            ),
            editMode && selectedKey && window.React.createElement('div', { className: 'absolute top-24 right-8 w-64 bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl pointer-events-auto text-white' },
                window.React.createElement('p', { className: 'text-xs uppercase text-gray-500 mb-4' }, `Editing: ${selectedKey}`),
                window.React.createElement('div', { className: 'space-y-4' },
                    window.React.createElement('select', { 
                        value: currentStyles.objectFit || 'cover', 
                        onChange: (e) => updateOverride(selectedKey, { objectFit: e.target.value }),
                        className: 'w-full bg-white/10 p-2 rounded' 
                    }, ['cover', 'contain', 'fill'].map(v => window.React.createElement('option', { key: v, value: v }, v))),
                    window.React.createElement('input', { 
                        type: 'range', min: 0, max: 50, 
                        value: parseInt(currentStyles.borderRadius) || 0, 
                        onChange: (e) => updateOverride(selectedKey, { borderRadius: `${e.target.value}px` }),
                        className: 'w-full' 
                    })
                )
            )
        );
    }

    // 3. Mount the app
    const rootContainer = document.createElement('div');
    rootContainer.id = 'na-layout-editor-root';
    document.body.appendChild(rootContainer);
    const root = window.ReactDOM.createRoot(rootContainer);
    root.render(window.React.createElement(LayoutEditorApp));
    console.log("NA Layout Editor: Rendered.");

})();
