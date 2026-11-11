import React, { useState } from 'react';
import { Bookmark, Star, MapPin, Clock, Utensils, Heart } from 'lucide-react';
import { Restaurant } from '../types/foody';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isBookmarked: boolean;
  onToggleBookmark: (restaurantId: string, e: React.MouseEvent) => void;
  onSelect: (restaurant: Restaurant) => void;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  isBookmarked,
  onToggleBookmark,
  onSelect,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <article
      onClick={() => onSelect(restaurant)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group bg-white rounded-xl border overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col ${
        isHovered
          ? 'border-[#9A3412] ring-2 ring-[#9A3412]/20 shadow-md -translate-y-0.5'
          : 'border-stone-200/90'
      }`}
    >
      {/* Lead Imagery Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
        {!imageError ? (
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-4 text-center">
            <Utensils className="w-8 h-8 mb-1.5 opacity-60" />
            <span className="font-serif text-sm font-semibold text-stone-600">{restaurant.name}</span>
          </div>
        )}

        {/* Measured Scrim for Overlay Accents */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges: Heritage / Michelin */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {restaurant.isMichelinSelected && (
            <span className="bg-red-800/95 text-white text-[11px] font-semibold px-2 py-0.5 rounded tracking-wide shadow-xs">
              Michelin Guide
            </span>
          )}
          {restaurant.isLegacyHeritage && (
            <span className="bg-stone-900/90 text-stone-100 text-[11px] font-medium px-2 py-0.5 rounded tracking-wide shadow-xs">
              Quán Cổ Truyền
            </span>
          )}
        </div>

        {/* Bookmark Action Button */}
        <button
          onClick={(e) => onToggleBookmark(restaurant.id, e)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isBookmarked
              ? 'bg-[#9A3412] text-white shadow-sm'
              : 'bg-white/85 text-stone-700 hover:bg-white hover:text-[#9A3412]'
          }`}
          title={isBookmarked ? 'Bỏ lưu quán' : 'Lưu quán này'}
          aria-label={isBookmarked ? 'Bỏ lưu quán' : 'Lưu quán này'}
        >
          <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Image Score & Category */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 font-bold bg-black/45 backdrop-blur-xs px-2 py-0.5 rounded">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="tabular-nums font-sans">{restaurant.ratingOverall.toFixed(1)}</span>
            <span className="text-white/70 font-normal">/ 10</span>
          </div>
          <span className="text-white/90 text-[11px] drop-shadow-xs font-medium">
            {restaurant.reviewCount} đánh giá
          </span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Discipline: Clean unboxed text with typographic separators */}
          <div className="flex items-center gap-2 text-xs text-stone-500 font-sans mb-1.5">
            <span className="font-medium text-[#9A3412]">{restaurant.category}</span>
            <span aria-hidden="true">·</span>
            <span>{restaurant.district}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-medium text-stone-700">{restaurant.priceRange}</span>
          </div>

          {/* Restaurant Title */}
          <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 group-hover:text-[#9A3412] transition-colors leading-snug mb-1.5">
            {restaurant.name}
          </h2>

          {/* Tagline / Curatorial description */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
            {restaurant.tagline}
          </p>
        </div>

        {/* Signature Dishes & Address */}
        <div className="pt-3 border-t border-stone-100 mt-2 space-y-1.5 text-xs text-stone-500 font-sans">
          <div className="flex items-start gap-1.5">
            <span className="text-stone-400 shrink-0 font-medium">Đặc trưng:</span>
            <span className="text-stone-700 font-medium truncate">
              {restaurant.signatureDishes.join(' · ')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-stone-500 truncate">
            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
