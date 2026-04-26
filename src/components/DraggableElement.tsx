import React from 'react';
import { motion, useMotionValue } from 'motion/react';
import { ScrapbookElement } from '../types';
import { Trash2, RotateCw, Maximize2, Layers, MoveDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface Props {
  element: ScrapbookElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (id: string, updates: Partial<ScrapbookElement>) => void;
  onDelete: (id: string) => void;
  onDoubleClick?: () => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  constraintsRef: React.RefObject<any>;
}

export const DraggableElement: React.FC<Props> = ({ 
  element, isSelected, onSelect, onChange, onDelete, onDoubleClick,
  onBringToFront, onSendToBack, constraintsRef
}) => {
  const rotation = useMotionValue(element.rotation);
  const scale = useMotionValue(element.scale);

  const handleRotate = (val: number) => {
    onChange(element.id, { rotation: val });
  };

  const handleScale = (val: number) => {
    onChange(element.id, { scale: val });
  };

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            className={`p-4 shadow-xl relative min-w-[150px] max-w-[300px] transition-all duration-300
              ${element.style?.paperType === 'torn' ? 'bg-amber-50 [clip-path:polygon(5%_0%,_100%_0%,_95%_100%,_0%_100%)]' : ''}
              ${element.style?.paperType === 'sticky' ? 'bg-yellow-200 border-t-4 border-yellow-400 rotate-1 shadow-md' : ''}
              ${element.style?.paperType === 'lined' ? 'bg-white border-l-8 border-red-200 shadow-lg' : ''}
              ${element.style?.paperType === 'envelope' ? 'bg-white border-2 border-stone-300 rounded-lg shadow-inner' : ''}
              ${!element.style?.paperType || element.style?.paperType === 'plain' ? 'bg-white shadow-2xl rounded-sm' : ''}
            `}
            style={{
              fontFamily: element.style?.fontFamily,
              fontSize: element.style?.fontSize,
              color: element.style?.color,
              backgroundColor: element.style?.backgroundColor || (element.style?.paperType === 'sticky' ? '#fef08a' : '#ffffff'),
              filter: element.filter
            }}
          >
            {element.style?.paperType === 'lined' && (
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(transparent 95%, #e5e7eb 95%)', backgroundSize: '100% 1.5rem' }} />
            )}
            <p className="whitespace-pre-wrap relative z-10 break-words">{element.content}</p>
          </div>
        );
      case 'photo':
        return (
          <div className="p-2 bg-white shadow-2xl rounded-sm border-b-[20px] border-white relative group" style={{ filter: element.filter }}>
             {/* Washi Tape Effect */}
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-amber-200/40 backdrop-blur-[1px] rotate-2 -z-10 shadow-sm border border-amber-300/30" />
             <div className="absolute -bottom-2 -right-4 w-12 h-6 bg-blue-200/30 backdrop-blur-[1px] -rotate-12 z-10 shadow-sm border border-blue-300/20" />
             <img 
               src={element.content} 
               alt="Scrapbook piece" 
               className="max-w-[200px] h-auto rounded-sm block"
               referrerPolicy="no-referrer"
               onError={(e) => {
                 const target = e.target as HTMLImageElement;
                 target.src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=200&auto=format&fit=crop';
                 target.onerror = null; 
               }}
             />
          </div>
        );
      case 'sticker':
        const Icon = (LucideIcons as any)[element.content] || LucideIcons.HelpCircle;
        const stickerColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F06292', '#AED581'];
        const stickerColor = element.style?.color || stickerColors[Math.abs(element.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % stickerColors.length];
        return (
          <div className="p-2 drop-shadow-lg" style={{ filter: element.filter }}>
             <Icon size={64} style={{ color: stickerColor, fill: `${stickerColor}33` }} />
          </div>
        );
      case 'bubble':
        const bubbleType = element.style?.bubbleType || 'speech';
        const bubbleBg = element.style?.backgroundColor || '#ffffff';
        const bubbleColor = element.style?.color || '#000000';
        
        return (
          <div 
            className="relative flex items-center justify-center p-8 min-w-[120px] min-h-[100px]"
            style={{ 
              fontFamily: element.style?.fontFamily,
              fontSize: element.style?.fontSize,
              color: bubbleColor,
              filter: element.filter
            }}
          >
            <svg 
              className="absolute inset-0 w-full h-full -z-10 drop-shadow-lg" 
              viewBox="0 0 200 200" 
              preserveAspectRatio="none"
              fill={bubbleBg}
              stroke={bubbleColor}
              strokeWidth="2"
            >
              {bubbleType === 'speech' && (
                <path d="M10,10 L190,10 L190,150 L120,150 L100,190 L80,150 L10,150 Z" />
              )}
              {bubbleType === 'thought' && (
                <g>
                  <path d="M100,20 C140,20 180,40 180,80 C180,120 140,140 100,140 C80,140 60,135 40,125 C20,115 10,95 20,70 C30,45 60,20 100,20 Z" />
                  <circle cx="50" cy="165" r="8" />
                  <circle cx="35" cy="185" r="5" />
                </g>
              )}
              {bubbleType === 'burst' && (
                <path d="M10,100 L40,60 L20,20 L70,40 L100,10 L130,40 L180,20 L160,60 L190,100 L160,140 L180,180 L130,160 L100,190 L70,160 L20,180 L40,140 Z" />
              )}
              {bubbleType === 'cloud' && (
                <path d="M50,150 C20,150 0,130 0,100 C0,70 20,50 50,50 C50,20 80,0 120,0 C160,0 190,25 200,60 C220,60 240,80 240,110 C240,140 220,160 190,160 L50,160 Z" transform="scale(0.8) translate(10, 20)" />
              )}
            </svg>
            <p className="relative z-10 text-center whitespace-pre-wrap break-words max-w-[150px]">{element.content}</p>
          </div>
        );
      case 'emoji':
        return (
          <div className="text-6xl drop-shadow-md select-none p-2" style={{ filter: element.filter }}>
            <span className="block">{element.content}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      drag
      dragElastic={0}
      dragMomentum={false}
      onDragStart={onSelect}
      onDragEnd={(_e, info) => {
        // Correct position calculation based on delta to avoid sticking
        onChange(element.id, { 
          x: element.x + info.offset.x, 
          y: element.y + info.offset.y 
        });
      }}
      whileDrag={{ scale: element.scale * 1.05, zIndex: 9999 }}
      animate={{ 
        x: element.x, 
        y: element.y, 
        zIndex: element.zIndex || 0
      }}
      transition={{ 
        type: 'spring', 
        damping: 35, 
        stiffness: 500,
        zIndex: { duration: 0 }
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick?.();
      }}
      className={`absolute cursor-move touch-none scrapbook-element group select-none`}
      style={{ left: 0, top: 0 }}
    >
      <div 
        className={isSelected ? 'ring-2 ring-blue-500 ring-offset-4 rounded-lg' : ''}
        style={{ 
          transform: `scale(${element.scale})rotate(${element.rotation}deg)`,
          transformOrigin: 'center center'
        }}
      >
        {renderContent()}
      </div>

      {/* Control Panel Interface */}
      {isSelected && (
        <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-stone-200 w-[240px] z-[1001] flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-stone-400">
              <span>Dimensione</span>
              <span>{Math.round(element.scale * 100)}%</span>
            </div>
            <input 
              type="range" min="0.2" max="3" step="0.1" 
              value={element.scale} 
              onChange={(e) => handleScale(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-stone-900"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-stone-400">
              <span>Rotazione</span>
              <span>{Math.round(element.rotation)}°</span>
            </div>
            <input 
              type="range" min="-180" max="180" step="1" 
              value={element.rotation} 
              onChange={(e) => handleRotate(parseInt(e.target.value))}
              className="w-full h-1.5 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-stone-900"
            />
          </div>

          <div className="flex gap-1 pt-2 border-t border-stone-100">
            <button 
              onClick={(e) => { e.stopPropagation(); onBringToFront(element.id); }} 
              className="flex-1 p-2 bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors flex flex-col items-center gap-1"
            >
              <Layers size={14} />
              <span className="text-[7px] font-bold uppercase">Sopra</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onSendToBack(element.id); }} 
              className="flex-1 p-2 bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors flex flex-col items-center gap-1"
            >
              <MoveDown size={14} />
              <span className="text-[7px] font-bold uppercase">Sotto</span>
            </button>
            <button 
              onClick={() => onDelete(element.id)} 
              className="flex-1 p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-colors flex flex-col items-center gap-1"
            >
              <Trash2 size={14} />
              <span className="text-[7px] font-bold uppercase">Elimina</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
