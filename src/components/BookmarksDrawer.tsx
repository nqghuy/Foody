import React from 'react';
import { X, Bookmark, Trash2, ArrowRight, Star, MapPin } from 'lucide-react';
import { Restaurant } from '../types/foody';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedRestaurants: Restaurant[];
  onRemoveBookmark: (restaurantId: string) => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarkedRestaurants,
  onRemoveBookmark,
  onSelectRestaurant,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fade-in">
      <div
        className="w-full max-w-md bg-[#FBF9F5] h-full shadow-2xl border-l border-stone-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#9A3412]/10 text-[#9A3412] flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Quán Ăn Đã Lưu
              </h2>
              <span className="text-xs text-stone-500">
                {bookmarkedRestaurants.length} địa chỉ trong danh bạ của bạn
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Bookmarked Restaurants */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookmarkedRestaurants.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
              <Bookmark className="w-12 h-12 mb-3 stroke-1 text-stone-300" />
              <h3 className="font-serif text-base font-semibold text-stone-700 mb-1">
                Chưa có quán ăn nào được lưu
              </h3>
              <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                Khi lướt tìm quán ngon, hãy bấm vào biểu tượng trái tim để lưu lại vào cẩm nang cá nhân của bạn.
              </p>
            </div>
          ) : (
            bookmarkedRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs hover:shadow-xs transition-all flex gap-3 group"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => {
                    onSelectRestaurant(restaurant);
                    onClose();
                  }}
                  className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 shrink-0 cursor-pointer"
                >
                  <img
                    src={restaurant.coverImage}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-semibold text-[#9A3412] uppercase tracking-wide truncate">
                        {restaurant.category}
                      </span>
                      <button
                        onClick={() => onRemoveBookmark(restaurant.id)}
                        className="text-stone-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                        title="Bỏ lưu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4
                      onClick={() => {
                        onSelectRestaurant(restaurant);
                        onClose();
                      }}
                      className="font-serif text-sm font-bold text-stone-900 group-hover:text-[#9A3412] truncate cursor-pointer"
                    >
                      {restaurant.name}
                    </h4>

                    <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{restaurant.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-1 font-bold text-stone-800">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="tabular-nums">{restaurant.ratingOverall.toFixed(1)}</span>
                      <span className="text-[10px] text-stone-400 font-normal">({restaurant.reviewCount})</span>
                    </div>

                    <button
                      onClick={() => {
                        onSelectRestaurant(restaurant);
                        onClose();
                      }}
                      className="text-[11px] font-semibold text-[#9A3412] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Chi tiết</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {bookmarkedRestaurants.length > 0 && (
          <div className="p-4 bg-white border-t border-stone-200 text-center">
            <span className="text-xs text-stone-500 font-sans">
              Được tự động lưu trữ trên trình duyệt của bạn
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
