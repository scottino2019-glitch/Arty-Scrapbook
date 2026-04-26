import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Save, BookOpen } from 'lucide-react';
import { ScrapbookPage, ScrapbookElement } from './types';
import { DraggableElement } from './components/DraggableElement';
import { Toolbar } from './components/Toolbar';
import { BACKGROUNDS } from './constants';

const STORAGE_KEY = 'scrapbook_diary_v3';

const INITIAL_PAGES: ScrapbookPage[] = [
  {
    id: '1',
    background: BACKGROUNDS[0].url,
    elements: [
      {
        id: 'initial-note',
        type: 'text',
        content: 'Doppio-tocco per scrivere i tuoi pensieri...',
        x: 100,
        y: 200,
        rotation: -3,
        scale: 1,
        zIndex: 1,
        style: { fontFamily: "'Caveat', cursive", fontSize: 24, paperType: 'sticky' }
      }
    ]
  }
];

export default function App() {
  const [pages, setPages] = useState<ScrapbookPage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return INITIAL_PAGES;
  });
  
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isEditingTextId, setIsEditingTextId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const constraintsRef = useRef(null);
  
  const currentPage = pages[currentPageIndex];

  const exportAsImage = async () => {
    // Target the entire page container, not just the elements container
    const pageElement = document.querySelector('.scrapbook-page-container');
    if (!pageElement) return;
    
    // Deselect before capturing
    setSelectedElementId(null);
    
    // Wait for UI to update
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(pageElement as HTMLElement, {
          useCORS: true,
          backgroundColor: '#faf9f6', 
          scale: 2,
          logging: false,
          onclone: (clonedDoc) => {
            // DEEP CLEANING: Remove modern colors that crash html2canvas parser
            const styleTags = clonedDoc.getElementsByTagName('style');
            for (let i = 0; i < styleTags.length; i++) {
              let css = styleTags[i].innerHTML;
              // Replace all oklch/oklab/light-dark everywhere in CSS
              css = css.replace(/(oklch|oklab|light-dark)\([^)]+\)/g, 'rgba(0,0,0,0.1)');
              styleTags[i].innerHTML = css;
            }

            // Remove all standard links that might contain external CSS with oklch
            const links = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
            links.forEach(link => link.remove());

            // Sanitize inline styles on all elements
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const styleAttr = htmlEl.getAttribute('style') || '';
              if (styleAttr.includes('oklch') || styleAttr.includes('oklab') || styleAttr.includes('light-dark')) {
                htmlEl.setAttribute('style', styleAttr.replace(/(oklch|oklab|light-dark)\([^)]+\)/g, 'rgba(0,0,0,0)'));
              }
              
              // Force override Tailwind V4 problematic vars and shadows
              htmlEl.style.setProperty('--tw-ring-color', 'transparent', 'important');
              htmlEl.style.setProperty('--tw-ring-offset-color', 'transparent', 'important');
              htmlEl.style.setProperty('--tw-shadow', 'none', 'important');
              htmlEl.style.setProperty('--tw-shadow-colored', 'none', 'important');
              htmlEl.style.setProperty('--tw-outline-color', 'transparent', 'important');
            });

            // Inject basic functional styles to ensure layout is preserved after link removal
            const baseStyle = clonedDoc.createElement('style');
            baseStyle.innerHTML = `
              .scrapbook-page-container { background-color: #faf9f6 !important; position: relative !important; }
              .scrapbook-element { position: absolute !important; }
              img { max-width: 100% !important; height: auto !important; }
              * { box-sizing: border-box !important; }
            `;
            clonedDoc.head.appendChild(baseStyle);
          }
        });
        
        const link = document.createElement('a');
        link.download = `diario-scraps-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      } catch (err) {
        console.error('Export failed:', err);
        alert('Il caricamento dell\'immagine è fallito. Riprova tra un istante.');
      }
    }, 300);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  }, [pages]);

  const addPage = () => {
    const newPage: ScrapbookPage = {
      id: Math.random().toString(36).substr(2, 9),
      background: BACKGROUNDS[0].url,
      elements: []
    };
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
  };

  const addElement = (type: ScrapbookElement['type'], content: string, style?: any) => {
    // Better positioning: place in the center of the viewport visible area
    const baseX = 400;
    const baseY = 250;
    
    // Find highest current Z
    const maxZ = currentPage.elements.length > 0 
      ? Math.max(...currentPage.elements.map(e => e.zIndex)) 
      : 0;

    const newElement: ScrapbookElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      x: baseX + (Math.random() * 100 - 50),
      y: baseY + (Math.random() * 100 - 50),
      rotation: Math.random() * 10 - 5,
      scale: 1,
      zIndex: maxZ + 1,
      style
    };

    const newPages = [...pages];
    newPages[currentPageIndex].elements.push(newElement);
    setPages(newPages);
    setSelectedElementId(newElement.id);
  };
  const bringToFront = (id: string) => {
    setPages(prev => {
      const newPages = [...prev];
      const page = { ...newPages[currentPageIndex] };
      // Find current max Z in the page
      const currentMaxZ = page.elements.reduce((max, e) => Math.max(max, e.zIndex || 0), 0);
      const elements = page.elements.map(el => {
        if (el.id === id) {
          return { ...el, zIndex: currentMaxZ + 1 };
        }
        return el;
      });
      page.elements = elements;
      newPages[currentPageIndex] = page;
      return newPages;
    });
  };

  const sendToBack = (id: string) => {
    setPages(prev => {
      const newPages = [...prev];
      const page = { ...newPages[currentPageIndex] };
      // Find current min Z (starting from 1)
      const currentMinZ = page.elements.reduce((min, e) => Math.min(min, e.zIndex || 1), 1);
      const elements = page.elements.map(el => {
        if (el.id === id) {
          return { ...el, zIndex: Math.max(1, currentMinZ - 1) };
        }
        return el;
      });
      page.elements = elements;
      newPages[currentPageIndex] = page;
      return newPages;
    });
  };

  const updateElement = (id: string, updates: Partial<ScrapbookElement>) => {
    setPages(prev => {
      const newPages = [...prev];
      const page = { ...newPages[currentPageIndex] };
      const elements = [...page.elements];
      const index = elements.findIndex(e => e.id === id);
      if (index === -1) return prev;
      
      elements[index] = { ...elements[index], ...updates };
      page.elements = elements;
      newPages[currentPageIndex] = page;
      return newPages;
    });
  };

  const deleteElement = (id: string) => {
    setPages(prev => {
      const newPages = [...prev];
      const page = { ...newPages[currentPageIndex] };
      page.elements = page.elements.filter(e => e.id !== id);
      newPages[currentPageIndex] = page;
      return newPages;
    });
    setSelectedElementId(null);
  };

  const handleBackgroundChange = (url: string) => {
    const newPages = [...pages];
    newPages[currentPageIndex].background = url;
    setPages(newPages);
  };

  const applyLayout = (type: 'grid' | 'scatter') => {
    setPages(prev => {
      const newPages = [...prev];
      const page = { ...newPages[currentPageIndex] };
      
      if (type === 'grid') {
        const cols = 4;
        const spacingX = 200;
        const spacingY = 220;
        page.elements = page.elements.map((el, i) => ({
          ...el,
          x: 100 + (i % cols) * spacingX,
          y: 80 + Math.floor(i / cols) * spacingY,
          rotation: 0,
          scale: 0.8,
          zIndex: (i + 1) * 10
        }));
      } else {
        page.elements = page.elements.map((el, i) => ({
          ...el,
          x: 80 + Math.random() * 600,
          y: 80 + Math.random() * 400,
          rotation: Math.random() * 30 - 15,
          scale: 0.6 + Math.random() * 0.8,
          zIndex: (i + 1) * 10
        }));
      }
      
      newPages[currentPageIndex] = page;
      return newPages;
    });
  };

  const applyFilter = (filter: string) => {
    if (!selectedElementId) return;
    updateElement(selectedElementId, { filter });
  };

  const resetProject = () => {
    if (window.confirm('🚨 RESET TOTALE: Sei sicuro di voler cancellare TUTTO il diario?')) {
      setPages(INITIAL_PAGES);
      setCurrentPageIndex(0);
      setSelectedElementId(null);
    }
  };

  const clearCurrentPage = () => {
    if (window.confirm('🧹 CLEAR PAGE: Rimuovere tutti gli elementi da questa pagina?')) {
      const newPages = [...pages];
      newPages[currentPageIndex].elements = [];
      setPages(newPages);
      setSelectedElementId(null);
    }
  };

  const handleStartEdit = (element: ScrapbookElement) => {
    if (element.type === 'text' || element.type === 'bubble') {
      setIsEditingTextId(element.id);
      setEditValue(element.content);
    }
  };

  const handleSaveEdit = () => {
    if (isEditingTextId) {
      updateElement(isEditingTextId, { content: editValue });
      setIsEditingTextId(null);
    }
  };

  return (
    <div className="relative w-full h-screen bg-brand-bg flex flex-col font-serif overflow-hidden select-none">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }} />

      {/* Top Header */}
      <header className="h-16 bg-ui-bg border-b border-black/10 flex items-center justify-between px-8 z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse shadow-sm"></div>
          <h1 className="text-xl font-bold tracking-tight italic font-serif">Arty Scrapbook Pro</h1>
          <span className="text-xs text-black/40 font-sans ml-4 uppercase tracking-widest hidden md:inline shrink-0">Journal: {new Date().toLocaleDateString('it-IT')}</span>
        </div>
        <div className="flex items-center gap-6 font-sans text-[10px] uppercase tracking-widest font-bold">
          <button 
            onClick={() => applyLayout('grid')}
            className="hover:text-amber-600 transition-colors hidden sm:block font-bold"
          >
            Griglia
          </button>
          <button 
            onClick={() => applyLayout('scatter')}
            className="hover:text-amber-600 transition-colors hidden sm:block font-bold"
          >
            Disordine
          </button>
          <div className="w-[1px] h-4 bg-black/10 hidden sm:block" />
          <button 
            onClick={clearCurrentPage}
            className="hover:text-red-500 transition-colors hidden sm:block font-bold"
            title="Pulisci Pagina Corrente"
          >
            Pulisci
          </button>
          <button 
            onClick={resetProject}
            className="hover:text-red-600 transition-colors hidden sm:block font-bold text-black/30"
            title="Reset Totale"
          >
            Reset
          </button>
          <div className="w-[1px] h-4 bg-black/10 hidden sm:block" />
          <button 
            onClick={exportAsImage}
            className="hover:text-amber-600 transition-colors hidden sm:block p-2"
            title="Salva come Immagine"
          >
            Esporta IMG
          </button>
          <button className="px-6 py-2 bg-stone-900 text-white rounded-full hover:bg-black transition-all shadow-md active:scale-95 leading-none">
            Salva
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tools via Toolbar component */}
        <Toolbar 
          onBackgroundChange={handleBackgroundChange}
          onAddText={(font, color, type) => addElement('text', 'Scrivi un pensiero...', { fontFamily: font, color, fontSize: 24, paperType: type })}
          onAddBubble={(font, color, type) => addElement('bubble', 'Dì qualcosa...', { fontFamily: font, color, fontSize: 18, bubbleType: type })}
          onAddPhoto={(url) => addElement('photo', url)}
          onAddSticker={(name) => addElement('sticker', name)}
          onAddEmoji={(emoji) => addElement('emoji', emoji)}
          onApplyLayout={applyLayout}
          onApplyFilter={applyFilter}
        />

        {/* Main Workspace Canvas */}
        <main 
          className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-auto custom-scrollbar"
          onClick={() => setSelectedElementId(null)}
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-4 border-dashed border-black rounded-full" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage.id}
              initial={{ opacity: 0, scale: 0.98, rotateY: 5 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 1.02, rotateY: -5 }}
              transition={{ type: 'spring', damping: 20, stiffness: 60 }}
              className="scrapbook-page-container relative w-full max-w-[1200px] h-[90%] min-h-[600px] bg-canvas-bg shadow-[0_60px_120px_rgba(0,0,0,0.25)] rounded-sm border-[20px] border-white ring-1 ring-black/5 shrink-0"
            >
              {/* Page Spine Gutter Shadow */}
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/15 to-transparent pointer-events-none z-10" />

              {/* Background Layer */}
              <div className="absolute inset-0 pointer-events-none">
                <img 
                  src={currentPage.background} 
                  className="w-full h-full object-cover transition-opacity duration-1000" 
                  alt="page background"
                  referrerPolicy="no-referrer"
                />
                {/* Paper texture overlay to make it look like real paper */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-30 mix-blend-multiply" />
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]" />
              </div>

              {/* Content Elements Layer */}
              <div className="relative w-full h-full" ref={constraintsRef}>
                 {currentPage.elements.map((element) => (
                   <DraggableElement
                     key={element.id}
                     element={element}
                     constraintsRef={constraintsRef}
                     isSelected={selectedElementId === element.id}
                     onSelect={() => {
                        setSelectedElementId(element.id);
                        bringToFront(element.id); // Auto bring to front on select
                     }}
                     onDoubleClick={() => handleStartEdit(element)}
                     onChange={updateElement}
                     onDelete={deleteElement}
                     onBringToFront={bringToFront}
                     onSendToBack={sendToBack}
                   />
                 ))}
              </div>

              {/* Page Detail Overlay */}
              <div className="absolute bottom-6 right-8 text-black/40 font-serif italic text-sm tracking-widest pointer-events-none">
                Vol. I — Pag. {currentPageIndex + 1}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Right Nav (Page Selector) */}
        <aside className="hidden lg:flex w-56 bg-ui-bg border-l border-black/10 p-6 flex-col gap-6 overflow-y-auto z-40 shrink-0 custom-scrollbar">
           <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-black/30">Indice Pagine</span>
           <div className="flex flex-col gap-4">
              {pages.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => setCurrentPageIndex(idx)}
                  className={`relative aspect-[3/4] rounded border-2 overflow-hidden transition-all duration-300 transform shrink-0
                    ${currentPageIndex === idx ? 'border-black ring-4 ring-black/5 scale-105 shadow-xl' : 'border-black/10 hover:border-black/30 grayscale-[50%]'}`}
                >
                  <img src={p.background} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/5" />
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {idx + 1}
                  </div>
                </button>
              ))}
              <button 
                onClick={addPage}
                className="aspect-[3/4] border-2 border-dashed border-black/10 rounded-lg flex items-center justify-center text-black/20 hover:text-black/60 hover:bg-black/5 transition-all shrink-0"
              >
                <Plus size={24} />
              </button>
           </div>
        </aside>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-10 bg-white border-t border-black/10 flex items-center justify-between px-8 z-50 shrink-0">
        <div className="text-[9px] uppercase font-sans font-bold tracking-[0.2em] flex gap-8 items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <span>CLOUD SYNC: ATTIVO</span>
          </div>
          <span className="opacity-40">ZOOM: 100%</span>
        </div>
        <div className="text-[9px] font-sans font-medium text-black/30 italic">
          Ultima modifica: {new Date().toLocaleTimeString()}
        </div>
      </footer>

      {/* Text Editor Dialog */}
      <AnimatePresence>
        {isEditingTextId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-canvas-bg w-full max-w-md rounded-lg p-10 shadow-2xl border-stone-200 border"
            >
               <h4 className="text-black/40 text-[10px] font-sans font-bold uppercase mb-6 tracking-[0.2em]">Redazione Nota</h4>
               <textarea 
                 autoFocus
                 className="w-full h-48 p-6 bg-[#fafafa] border border-black/5 rounded shadow-inner text-xl font-hand focus:ring-0 outline-none resize-none"
                 value={editValue}
                 onChange={(e) => setEditValue(e.target.value)}
               />
               <div className="flex gap-4 mt-8">
                 <button 
                   onClick={() => setIsEditingTextId(null)}
                   className="flex-1 py-4 font-sans text-[10px] font-bold uppercase tracking-widest text-black/50 hover:text-black transition-colors"
                 >
                   Annulla
                 </button>
                 <button 
                   onClick={handleSaveEdit}
                   className="flex-1 py-4 bg-black text-white rounded font-sans text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-lg shadow-black/10"
                 >
                   Conferma
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
