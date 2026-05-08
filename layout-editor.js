/**
 * NA Artistry - Advanced Freeform Layout Engine v2
 * A premium, unrestricted visual editing system.
 */

(async function() {
    // 1. Advanced Dependency Loader
    async function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    if (localStorage.getItem('na_admin_logged_in') !== 'true') return;

    try {
        await loadScript('media-config.js');
        await loadScript('https://cdn.tailwindcss.com');
        if (!window.React) {
            await loadScript('https://unpkg.com/react@18/umd/react.production.min.js');
            await loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js');
        }
        if (!window.Moveable) {
            await loadScript('https://unpkg.com/moveable@0.53.0/dist/moveable.min.js');
        }
        if (!window.framerMotion) {
            await loadScript('https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js');
        }
        await loadScript('https://unpkg.com/lucide@latest');
        
        console.log("NA Advanced Editor: Dependencies loaded.");
    } catch (e) {
        console.error("NA Advanced Editor: Dependency failure.", e);
        return;
    }

    const { useState, useEffect, useRef, useMemo } = window.React;
    const motion = window.Motion || { div: 'div' }; // Fallback if motion fails

    // 2. Main Editor Component
    function AdvancedLayoutEditor() {
        const [isAdmin, setIsAdmin] = useState(localStorage.getItem('na_admin_logged_in') === 'true');
        const [editMode, setEditMode] = useState(false);
        const [selectedKey, setSelectedKey] = useState(null);
        const [breakpoint, setBreakpoint] = useState('desktop');
        const [overrides, setOverrides] = useState(JSON.parse(localStorage.getItem('na_layout_overrides')) || {});
        
        const moveableRef = useRef(null);
        const [targetEl, setTargetEl] = useState(null);

        // Sync overrides to localStorage and engine
        useEffect(() => {
            localStorage.setItem('na_layout_overrides', JSON.stringify(overrides));
            if (window.refreshLayout) window.refreshLayout(overrides);
        }, [overrides]);

        // Breakpoint listener
        useEffect(() => {
            const handleResize = () => {
                const w = window.innerWidth;
                if (w <= 768) setBreakpoint('mobile');
                else if (w <= 1200) setBreakpoint('tablet');
                else setBreakpoint('desktop');
            };
            window.addEventListener('resize', handleResize);
            handleResize();
            return () => window.removeEventListener('resize', handleResize);
        }, []);

        // Moveable instantiation
        useEffect(() => {
            if (!editMode || !selectedKey) {
                if (moveableRef.current) moveableRef.current.destroy();
                setTargetEl(null);
                return;
            }

            const target = document.querySelector(`[data-layout="${selectedKey}"]`);
            if (!target) return;
            setTargetEl(target);

            const moveable = new window.Moveable(document.body, {
                target: target,
                draggable: true,
                resizable: true,
                scalable: true,
                rotatable: true,
                snappable: true,
                snapThreshold: 5,
                elementGuidelines: Array.from(document.querySelectorAll('[data-layout]')),
                snapElement: true,
                snapVertical: true,
                snapHorizontal: true,
                renderDirections: ["nw", "n", "ne", "w", "e", "sw", "s", "se"],
            });

            moveable.on("drag", ({ target, transform }) => {
                target.style.transform = transform;
                updateOverride(selectedKey, { transform });
            }).on("resize", ({ target, width, height, drag }) => {
                target.style.width = `${width}px`;
                target.style.height = `${height}px`;
                target.style.transform = drag.transform;
                updateOverride(selectedKey, { width: `${width}px`, height: `${height}px`, transform: drag.transform });
            }).on("rotate", ({ target, transform }) => {
                target.style.transform = transform;
                updateOverride(selectedKey, { transform });
            }).on("scale", ({ target, transform }) => {
                target.style.transform = transform;
                updateOverride(selectedKey, { transform });
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

        // Global click listener to select elements
        useEffect(() => {
            const handleClick = (e) => {
                if (!editMode) return;
                const layoutEl = e.target.closest('[data-layout]');
                if (layoutEl) {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedKey(layoutEl.getAttribute('data-layout'));
                } else if (!e.target.closest('.na-editor-ui')) {
                    setSelectedKey(null);
                }
            };
            document.addEventListener('click', handleClick, true);
            return () => document.removeEventListener('click', handleClick, true);
        }, [editMode]);

        if (!isAdmin) return null;

        // UI Components
        const PropertySection = ({ title, children }) => (
            <div className="mb-6">
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-3 font-bold">{title}</h4>
                <div className="space-y-3">{children}</div>
            </div>
        );

        const InputField = ({ label, value, onChange, type = "text", unit = "" }) => (
            <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-gray-400 font-medium">{label}</span>
                <div className="relative flex items-center">
                    <input 
                        type={type} 
                        value={value || ''} 
                        onChange={(e) => onChange(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-[11px] w-20 focus:outline-none focus:border-white/30 transition-all text-right pr-6"
                    />
                    <span className="absolute right-2 text-[9px] text-gray-600">{unit}</span>
                </div>
            </div>
        );

        const SliderField = ({ label, value, min, max, onChange, unit = "" }) => (
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-400">{label}</span>
                    <span className="text-[10px] text-white font-mono">{value || 0}{unit}</span>
                </div>
                <input 
                    type="range" min={min} max={max} step="0.1"
                    value={parseFloat(value) || 0} 
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                />
            </div>
        );

        return (
            <div className="na-editor-ui fixed inset-0 pointer-events-none z-[999999] font-sans">
                {/* Top Bar */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/80 backdrop-blur-2xl border border-white/10 p-1.5 rounded-full shadow-2xl pointer-events-auto">
                    <div className="flex items-center gap-1 px-2 border-r border-white/10 mr-1">
                        <div className={`w-2 h-2 rounded-full ${editMode ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-green-500'} animate-pulse`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-1">Live</span>
                    </div>
                    
                    <button 
                        onClick={() => { setEditMode(!editMode); if (editMode) setSelectedKey(null); }}
                        className={`px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${editMode ? 'bg-red-500 text-white' : 'bg-white text-black hover:scale-105'}`}
                    >
                        {editMode ? 'Exit Designer' : 'Enter Designer'}
                    </button>

                    <div className="flex gap-1">
                        {['desktop', 'tablet', 'mobile'].map(bp => (
                            <button 
                                key={bp}
                                onClick={() => setBreakpoint(bp)}
                                className={`p-2 rounded-full transition-all flex items-center justify-center ${breakpoint === bp ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                                title={bp}
                            >
                                <span className="text-[10px] uppercase font-bold">{bp[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Panel (Inspector) */}
                {editMode && selectedKey && (
                    <div className="absolute top-24 right-8 w-72 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 pointer-events-auto shadow-2xl text-white overflow-y-auto max-h-[80vh]">
                        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                            <div>
                                <h3 className="text-[13px] font-bold text-white mb-1">Properties</h3>
                                <p className="text-[9px] text-gray-500 font-mono uppercase truncate w-40">{selectedKey}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    const newO = { ...overrides };
                                    delete newO[selectedKey][breakpoint];
                                    setOverrides(newO);
                                }}
                                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                title="Reset Component"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            </button>
                        </div>

                        <PropertySection title="Layout">
                            <InputField label="Width" value={currentStyles.width} onChange={v => updateOverride(selectedKey, { width: v.includes('px') || v.includes('%') ? v : v + 'px' })} />
                            <InputField label="Height" value={currentStyles.height} onChange={v => updateOverride(selectedKey, { height: v.includes('px') || v.includes('%') ? v : v + 'px' })} />
                            <InputField label="Z-Index" value={currentStyles.zIndex} type="number" onChange={v => updateOverride(selectedKey, { zIndex: v })} />
                        </PropertySection>

                        <PropertySection title="Appearance">
                            <SliderField label="Opacity" value={currentStyles.opacity || 1} min="0" max="1" onChange={v => updateOverride(selectedKey, { opacity: v })} />
                            <SliderField label="Rounding" value={parseInt(currentStyles.borderRadius) || 0} min="0" max="100" unit="px" onChange={v => updateOverride(selectedKey, { borderRadius: v + 'px' })} />
                            <InputField label="Blend" value={currentStyles.mixBlendMode} onChange={v => updateOverride(selectedKey, { mixBlendMode: v })} />
                        </PropertySection>

                        <PropertySection title="Image Visuals">
                            {(targetEl?.tagName === 'IMG' || targetEl?.hasAttribute('data-edit')) && (
                                <button 
                                    onClick={() => {
                                        const key = targetEl.getAttribute('data-edit') || `Custom_${selectedKey}`;
                                        window.triggerImageUpload(key, (url) => {
                                            // Handle case where it might not have data-edit originally
                                            if (!targetEl.hasAttribute('data-edit')) {
                                                targetEl.setAttribute('data-edit', key);
                                            }
                                        });
                                    }}
                                    className="w-full mb-4 py-2 bg-white text-black rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                    Replace Media
                                </button>
                            )}
                            <div className="flex flex-col gap-2">
                                <span className="text-[11px] text-gray-400">Object Fit</span>
                                <div className="grid grid-cols-3 gap-1">
                                    {['cover', 'contain', 'fill'].map(v => (
                                        <button 
                                            key={v}
                                            onClick={() => updateOverride(selectedKey, { objectFit: v })}
                                            className={`py-1 rounded text-[9px] uppercase font-bold border ${currentStyles.objectFit === v ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <InputField label="Focal Point" value={currentStyles.objectPosition} onChange={v => updateOverride(selectedKey, { objectPosition: v })} />
                        </PropertySection>

                        <PropertySection title="Effects">
                            <InputField label="Filter" value={currentStyles.filter} onChange={v => updateOverride(selectedKey, { filter: v })} />
                        </PropertySection>

                        <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">NA Studio v2.0</span>
                            <button 
                                onClick={() => { localStorage.removeItem('na_admin_logged_in'); location.reload(); }}
                                className="text-[9px] text-red-500/50 hover:text-red-500 uppercase font-bold tracking-widest transition-colors"
                            >
                                Disconnect
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Canvas Ruler Helpers (Visual only) */}
                {editMode && (
                    <div className="absolute inset-0 pointer-events-none opacity-20 border border-white/5 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-px bg-white/20" style={{ top: '50%' }} />
                        <div className="absolute top-0 left-0 h-full w-px bg-white/20" style={{ left: '50%' }} />
                    </div>
                )}
            </div>
        );
    }

    // 3. App Mounting
    const rootId = 'na-advanced-editor-root';
    let rootContainer = document.getElementById(rootId);
    if (!rootContainer) {
        rootContainer = document.createElement('div');
        rootContainer.id = rootId;
        document.body.appendChild(rootContainer);
    }
    const root = window.ReactDOM.createRoot(rootContainer);
    root.render(window.React.createElement(AdvancedLayoutEditor));
    console.log("NA Advanced Editor: Initialized.");

})();
