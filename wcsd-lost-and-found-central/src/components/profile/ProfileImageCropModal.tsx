import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ProfileImageCropModalProps {
  image: string;
  cropZoom: number;
  cropOffsetX: number;
  cropOffsetY: number;
  onCropZoomChange: (value: number) => void;
  onCropOffsetXChange: (value: number) => void;
  onCropOffsetYChange: (value: number) => void;
  onCancel: () => void;
  onSave: (croppedImage: string) => void;
}

const createCroppedProfileImage = async (src: string, zoom: number, offsetX: number, offsetY: number) => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  const size = 320;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create image cropper.');

  const baseScale = Math.max(size / image.width, size / image.height);
  const scale = baseScale * zoom;
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const maxOffsetX = Math.max(0, (drawWidth - size) / 2);
  const maxOffsetY = Math.max(0, (drawHeight - size) / 2);
  const drawX = (size - drawWidth) / 2 - (offsetX / 100) * maxOffsetX;
  const drawY = (size - drawHeight) / 2 - (offsetY / 100) * maxOffsetY;

  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  return canvas.toDataURL('image/jpeg', 0.92);
};

export const ProfileImageCropModal: React.FC<ProfileImageCropModalProps> = ({
  image,
  cropZoom,
  cropOffsetX,
  cropOffsetY,
  onCropZoomChange,
  onCropOffsetXChange,
  onCropOffsetYChange,
  onCancel,
  onSave
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    setIsSaving(true);
    try {
      const cropped = await createCroppedProfileImage(image, cropZoom, cropOffsetX, cropOffsetY);
      onSave(cropped);
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#2b2b2b] rounded-[32px] border border-slate-200 dark:border-[#4b5563] shadow-2xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Crop Profile Picture</h2>
            <p className="text-sm text-slate-500 dark:text-white mt-1">Adjust the framing before saving your profile photo.</p>
          </div>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="grid md:grid-cols-[320px_1fr] gap-8 items-start">
          <div className="mx-auto order-2 md:order-1">
            <div className="w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#f3df9b] shadow-xl bg-slate-100 dark:bg-[#1f1f1f]">
              <img
                src={image}
                alt="Profile crop preview"
                className="w-full h-full object-cover"
                style={{ transform: `scale(${cropZoom}) translate(${cropOffsetX}%, ${cropOffsetY}%)`, transformOrigin: 'center' }}
              />
            </div>
          </div>

          <div className="space-y-5 order-1 md:order-2">
            <label className="block">
              <span className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Zoom</span>
              <input type="range" min="0.6" max="2.6" step="0.05" value={cropZoom} onChange={e => onCropZoomChange(Number(e.target.value))} className="w-full accent-[#f3df9b] transition hover:brightness-105" />
            </label>
            <label className="block">
              <span className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Move Left / Right</span>
              <input type="range" min="-100" max="100" step="1" value={cropOffsetX} onChange={e => onCropOffsetXChange(Number(e.target.value))} className="w-full accent-[#f3df9b] transition hover:brightness-105" />
            </label>
            <label className="block">
              <span className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Move Up / Down</span>
              <input type="range" min="-100" max="100" step="1" value={cropOffsetY} onChange={e => onCropOffsetYChange(Number(e.target.value))} className="w-full accent-[#f3df9b] transition hover:brightness-105" />
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="button" onClick={onCancel} className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-[#1f1f1f] text-slate-700 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-[#333333] transition-colors">
                Cancel
              </button>
              <button type="button" onClick={save} disabled={isSaving} className="px-5 py-3 rounded-xl bg-[#f3df9b] text-black font-bold hover:bg-[#f6e9b8] disabled:opacity-50 transition-colors">
                {isSaving ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
