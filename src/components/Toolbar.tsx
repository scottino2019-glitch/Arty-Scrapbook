import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Type, Image as ImageIcon, Smile, Sticker, Palette, Plus, ChevronLeft, ChevronRight, Layers, Layout } from 'lucide-react';
import { FONTS, BACKGROUNDS, STICKERS, COLORS } from '../constants';
import * as LucideIcons from 'lucide-react';

interface ToolbarProps {
  onAddText: (font: string, color: string, type: string) => void;
  onAddPhoto: (url: string) => void;
  onAddSticker: (name: string) => void;
  onAddEmoji: (emoji: string) => void;
  onBackgroundChange: (url: string) => void;
  onApplyLayout: (type: 'grid' | 'scatter') => void;
  onApplyFilter: (filter: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  onAddText, onAddPhoto, onAddSticker, onAddEmoji, 
  onBackgroundChange, onApplyLayout, onApplyFilter
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'media' | 'stickers' | 'background' | 'layout' | null>(null);
  const [selectedFont, setSelectedFont] = useState(FONTS[0].value);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedPaper, setSelectedPaper] = useState<'plain' | 'torn' | 'sticky' | 'lined' | 'envelope'>('plain');
  const [imageUrl, setImageUrl] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onBackgroundChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'text':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase text-stone-400 mb-3 block tracking-widest">Stile Carta</label>
              <div className="grid grid-cols-2 gap-2">
                {['plain', 'torn', 'sticky', 'lined', 'envelope'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedPaper(type as any)}
                    className={`px-2 py-2 text-[10px] font-sans font-bold border rounded uppercase tracking-tighter transition-all 
                      ${selectedPaper === type ? 'bg-black text-white border-black shadow-lg translate-y-[-1px]' : 'bg-white border-stone-200 hover:border-black/30'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-stone-400 mb-3 block tracking-widest">Tipografia</label>
              <div className="grid grid-cols-1 gap-2">
                {FONTS.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => setSelectedFont(font.value)}
                    className={`px-3 py-3 text-sm border rounded text-left transition-all truncate
                      ${selectedFont === font.value ? 'bg-black text-white border-black' : 'bg-white border-stone-200 hover:border-black/30'}`}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => onAddText(selectedFont, selectedColor, selectedPaper)}
              className="w-full bg-stone-900 h-14 text-white rounded-lg font-sans text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
            >
              <Plus size={16} /> Aggiungi Nota
            </button>
          </div>
        );
      case 'media':
        return (
          <div className="space-y-6">
             <div>
               <label className="text-[10px] font-bold uppercase text-stone-400 block mb-3 tracking-widest">Le Tue Foto</label>
               <input 
                 type="file" 
                 accept="image/*"
                 id="photo-upload"
                 className="hidden"
                 onChange={handlePhotoUpload}
               />
               <label 
                 htmlFor="photo-upload"
                 className="w-full h-32 border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center gap-2 text-stone-400 hover:bg-stone-50 hover:border-stone-400 transition-all cursor-pointer group"
               >
                 <ImageIcon size={32} className="group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Carica dal Dispositivo</span>
               </label>
             </div>
             <div>
               <label className="text-[10px] font-bold uppercase text-stone-400 block mb-3 tracking-widest">Link Esterno</label>
               <input 
                 type="text" 
                 placeholder="Incolla URL..." 
                 className="w-full p-4 bg-stone-50 border border-black/5 rounded-lg text-xs font-sans focus:border-black/20 outline-none shadow-inner"
                 value={imageUrl}
                 onChange={(e) => setImageUrl(e.target.value)}
               />
             </div>
             <button
              onClick={() => { if (imageUrl) { onAddPhoto(imageUrl); setImageUrl(''); } }}
              className="w-full bg-stone-900 h-14 text-white rounded-lg font-sans text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
            >
              Inserisci tramite URL
            </button>
          </div>
        );
      case 'stickers':
        return (
          <div className="space-y-6">
             <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {STICKERS.map(s => {
                  const Icon = (LucideIcons as any)[s] || LucideIcons.HelpCircle;
                  return (
                    <button 
                      key={s} 
                      onClick={() => onAddSticker(s)}
                      className="aspect-square flex items-center justify-center bg-white border border-black/5 rounded hover:border-black/30 hover:shadow-md transition-all text-stone-700"
                    >
                      <Icon size={20} />
                    </button>
                  );
                })}
                {['✨', '🌸', '☕️', '📷', '📓', '🌿', '🍂', '🦋', '🌙', '☀️', '📌', '📎'].map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => onAddEmoji(emoji)}
                    className="aspect-square text-lg flex items-center justify-center bg-white border border-black/5 rounded hover:border-black/30 hover:shadow-md transition-all"
                  >
                    {emoji}
                  </button>
                ))}
             </div>
          </div>
        );
      case 'layout':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase text-stone-400 block mb-3 tracking-widest">Layout Automatici</label>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => onApplyLayout('grid')}
                  className="w-full p-4 bg-white border border-stone-200 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-black transition-all flex items-center justify-center gap-2 group"
                >
                  <LucideIcons.LayoutGrid size={14} className="group-hover:text-blue-500" />
                  Griglia Ordinata
                </button>
                <button 
                  onClick={() => onApplyLayout('scatter')}
                  className="w-full p-4 bg-white border border-stone-200 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-black transition-all flex items-center justify-center gap-2 group"
                >
                  <LucideIcons.Sparkles size={14} className="group-hover:text-amber-500" />
                  Disordine Artistico
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-stone-400 block mb-3 tracking-widest">Filtri Fotografici</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Naturale', val: 'none' },
                  { name: 'Vintage', val: 'grayscale(20%) sepia(30%) contrast(90%)' },
                  { name: 'B&W', val: 'grayscale(100%) contrast(110%)' },
                  { name: 'Caldo', val: 'sepia(40%) saturate(150%) brightness(110%)' },
                  { name: 'Freddo', val: 'hue-rotate(180deg) saturate(80%)' },
                  { name: 'Sbiadito', val: 'opacity(80%) contrast(80%)' }
                ].map(filter => (
                  <button 
                    key={filter.name}
                    onClick={() => onApplyFilter(filter.val)}
                    className="p-3 bg-stone-50 border border-stone-200 rounded text-[9px] font-bold uppercase hover:bg-stone-100 transition-colors"
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'background':
        return (
          <div className="space-y-6">
             <div>
               <input 
                 type="file" 
                 accept="image/*"
                 id="bg-upload"
                 className="hidden"
                 onChange={handleBackgroundUpload}
               />
               <label 
                 htmlFor="bg-upload"
                 className="w-full p-4 border-2 border-stone-900 bg-stone-900 text-white rounded-lg flex items-center justify-center gap-3 hover:bg-black transition-all cursor-pointer shadow-xl mb-6"
               >
                 <Palette size={20} />
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Carica Sfondo Personale</span>
               </label>
             </div>
             <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <label className="text-[10px] font-bold uppercase text-stone-400 block tracking-widest">Sfondi Artistici</label>
                {BACKGROUNDS.map(bg => (
                  <button 
                    key={bg.id} 
                    onClick={() => onBackgroundChange(bg.url)}
                    className="group relative h-24 rounded overflow-hidden border-2 border-transparent hover:border-black transition-all shadow-sm"
                  >
                    <img src={bg.url} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                      <span className="text-[9px] text-white font-sans font-bold uppercase tracking-widest">{bg.name}</span>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'text', icon: Type, label: 'Note' },
    { id: 'media', icon: ImageIcon, label: 'Foto' },
    { id: 'stickers', icon: Sticker, label: 'Decal' },
    { id: 'layout', icon: Layout, label: 'Layout' },
    { id: 'background', icon: Palette, label: 'Temi' },
  ] as const;

  return (
    <>
      {/* Sidebar Toolstrip */}
      <aside className="w-20 bg-ui-bg border-r border-black/10 flex flex-col items-center py-10 gap-12 z-[100] relative">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(activeTab === item.id ? null : item.id)}
            className={`group cursor-pointer flex flex-col items-center gap-2 transition-all duration-500
              ${activeTab === item.id ? 'scale-110' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300
              ${activeTab === item.id ? 'bg-black text-white border-black shadow-lg' : 'bg-gray-100 border-black/5'}`}>
              <item.icon size={18} strokeWidth={2.5} />
            </div>
            <span className="text-[9px] uppercase font-sans font-black tracking-widest leading-none translate-y-1">
              {item.label}
            </span>
          </button>
        ))}
      </aside>

      {/* Slide-out Tool Content */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 80, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed top-16 bottom-10 w-72 bg-ui-bg/95 backdrop-blur-xl border-r border-black/10 z-[80] shadow-[30px_0_60px_rgba(0,0,0,0.1)] p-8 overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-serif italic font-bold text-lg text-black/80">
                {navItems.find(i => i.id === activeTab)?.label}
              </h3>
              <button 
                onClick={() => setActiveTab(null)} 
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors group"
              >
                <Plus size={18} className="rotate-45 text-black/30 group-hover:text-black" />
              </button>
            </div>
            {renderTabContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

};
