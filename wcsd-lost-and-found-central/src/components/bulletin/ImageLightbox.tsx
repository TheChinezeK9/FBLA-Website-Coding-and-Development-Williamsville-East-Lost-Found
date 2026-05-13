import React from 'react';
import { Minus, Plus, X } from 'lucide-react';

interface ImageLightboxProps {
  image: { src: string; alt: string };
  zoom: number;
  onZoomChange: (update: (zoom: number) => number) => void;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ image, zoom, onZoomChange, onClose }) => (
  <div
    className="fixed inset-0 z-[130] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full h-full flex flex-col items-center justify-center"
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onZoomChange((z) => Math.max(0.5, z - 0.25))}
          className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
        >
          <Minus size={18} />
        </button>
        <button
          type="button"
          onClick={() => onZoomChange((z) => Math.min(4, z + 0.25))}
          className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
        >
          <Plus size={18} />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
        >
          <X size={20} />
        </button>
      </div>

      <div className="absolute top-4 left-4 z-10 text-white/80 text-sm font-bold">
        Zoom: {Math.round(zoom * 100)}%
      </div>

      <div className="w-full h-full overflow-auto flex items-center justify-center">
        <img
          src={image.src}
          alt={image.alt}
          onClick={(e) => e.stopPropagation()}
          className="rounded-lg shadow-2xl"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            maxWidth: zoom <= 1 ? '90vw' : 'none',
            maxHeight: zoom <= 1 ? '85vh' : 'none'
          }}
        />
      </div>
    </div>
  </div>
);
