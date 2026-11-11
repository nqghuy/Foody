import React from 'react';
import { SlidersHorizontal, ArrowUpDown, RotateCcw, Map, LayoutGrid } from 'lucide-react';
import { Category, District, PriceLevel } from '../types/foody';

interface FilterBarProps {
  categories: Category[];
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
  selectedPriceLevel: PriceLevel | 'all';
  onSelectPriceLevel: (level: PriceLevel | 'all') => void;
  sortBy: 'rating' | 'reviews' | 'name';
  onSelectSortBy: (sort: 'rating' | 'reviews' | 'name') => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  resultCount: number;
  onOpenMapTab?: () => void;
}

const PRICE_OPTIONS: { level: PriceLevel | 'all'; label: string; desc: string }[] = [
  { level: 'all', label: 'Tất cả giá', desc: 'Mọi khoảng giá' },
  { level: '$', label: '$', desc: '< 50k (Bình dân)' },
  { level: '$$', label: '$$', desc: '50k - 150k (Phổ biến)' },
  { level: '$$$', label: '$$$', desc: '150k - 300k (Cao cấp)' },
  { level: '$$$$', label: '$$$$', desc: '> 300k (Sang trọng)' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedPriceLevel,
  onSelectPriceLevel,
  sortBy,
  onSelectSortBy,
  hasActiveFilters,
  onResetFilters,
  resultCount,
  onOpenMapTab,
}) => {
  return (
    <div className="bg-[#FBF9F5] border-b border-stone-200 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3.5">
        {/* Row 1: Category Filter Tabs (As original) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#9A3412] text-white shadow-xs font-semibold'
                    : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Row 2: Secondary Controls (Price, Sort, Reset, Counter) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          {/* Price Selector */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-stone-200">
            <span className="text-stone-400 px-2 font-medium">Mức giá:</span>
            {PRICE_OPTIONS.map((opt) => {
              const isSelected = selectedPriceLevel === opt.level;
              return (
                <button
                  key={opt.level}
                  onClick={() => onSelectPriceLevel(opt.level)}
                  title={opt.desc}
                  className={`px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Right side: Sorting & Results */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-500 font-medium">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => onSelectSortBy(e.target.value as any)}
                className="bg-transparent text-stone-900 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="rating">Điểm đánh giá cao nhất</option>
                <option value="reviews">Nhiều đánh giá nhất</option>
                <option value="name">Tên quán (A - Z)</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            )}

            {onOpenMapTab && (
              <button
                onClick={onOpenMapTab}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-[#9A3412]/10 hover:text-[#9A3412] text-stone-700 font-semibold rounded-lg border border-stone-200 transition-colors cursor-pointer"
                title="Mở tab Bản đồ ẩm thực"
              >
                <Map className="w-3.5 h-3.5 text-[#9A3412]" />
                <span>Bản đồ</span>
              </button>
            )}

            <div className="text-stone-500 font-medium whitespace-nowrap">
              Tìm thấy <strong className="text-stone-900 font-bold">{resultCount}</strong> quán
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
