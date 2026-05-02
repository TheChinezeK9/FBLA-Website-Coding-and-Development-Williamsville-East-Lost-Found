import React from 'react';
import { Heart, X } from 'lucide-react';
import { WishlistItem } from '../../types';

interface ProfileWishlistProps {
  wishlist: WishlistItem[];
  onRemoveWish: (wishId: string) => void;
  onOpenWish: (wish: WishlistItem) => void;
}

export const ProfileWishlist: React.FC<ProfileWishlistProps> = ({
  wishlist,
  onRemoveWish,
  onOpenWish
}) => {
  return (
    <div className="bg-white dark:bg-[#2b2b2b] rounded-[32px] shadow-xl border border-slate-100 dark:border-[#4b5563] overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-[#4b5563] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 flex items-center justify-center">
            <Heart size={20} />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Wishlist</h2>
        </div>
      </div>
      <div className="p-6 space-y-3 max-h-[520px] overflow-y-auto">
        {wishlist.length > 0 ? (
          wishlist.map(wish => (
            <div
              key={wish.id}
              className="relative p-4 pr-28 min-h-[104px] bg-slate-50 dark:bg-[#1f1f1f] rounded-2xl border border-slate-100 dark:border-[#4b5563]"
            >
              <button
                type="button"
                onClick={() => onRemoveWish(wish.id)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
              >
                <X size={14} />
              </button>
              <div className="pr-2">
                <p className="text-sm font-bold text-slate-800 dark:text-white">{wish.text}</p>
                <p className="text-[10px] text-slate-400 dark:text-white font-bold uppercase tracking-widest">
                  {wish.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenWish(wish)}
                className="absolute bottom-3 right-3 text-xs font-bold text-[#142e53] dark:text-white hover:opacity-80"
              >
                Check for item -&gt;
              </button>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-slate-400 dark:text-white font-medium">Your list is empty.</p>
          </div>
        )}
      </div>
    </div>
  );
};
