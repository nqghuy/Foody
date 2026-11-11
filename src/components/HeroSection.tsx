import React from 'react';
import { Search, MapPin, Sparkles } from 'lucide-react';
import { District } from '../types/foody';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDistrict: District;
  onSelectDistrict: (district: District) => void;
  totalRestaurants: number;
}

const DISTRICT_LIST: District[] = [
  'Tất cả quận',
  'Hoàn Kiếm',
  'Hai Bà Trưng',
  'Ba Đình',
  'Tây Hồ',
  'Đống Đa',
  'Cầu Giấy',
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedDistrict,
  onSelectDistrict,
  totalRestaurants,
}) => {
  return (
    <section className="relative pt-10 pb-8 px-4 sm:px-6 lg:px-8 border-b border-stone-200 bg-[#FBF9F5]">
      <div className="max-w-4xl mx-auto text-center">
        {/* Curatorial Header Stamp */}
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 font-sans mb-3">
          <span>Hà Nội Gastronomy Chronicle</span>
          <span aria-hidden="true">·</span>
          <span>Tuyển Tập 2026</span>
          <span aria-hidden="true">·</span>
          <span>{totalRestaurants} Địa Chỉ Chuẩn Vị</span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-stone-900 leading-[1.15] mb-4 text-balance">
          Hương Vị Tràng An Qua Từng Đánh Giá
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-600 font-sans leading-relaxed mb-8">
          Khám phá những góc quán gia truyền trăm năm, những quán bún ngan cháy tỏi nức tiếng
          và tách cà phê trứng nồng ấm giữa lòng phố cổ Hà Nội.
        </p>

        {/* Integrated Search Box */}
        <div className="relative max-w-2xl mx-auto mb-6">
          <div className="relative flex items-center bg-white rounded-xl border border-stone-300 shadow-sm hover:border-stone-400 focus-within:border-[#9A3412] focus-within:ring-2 focus-within:ring-[#9A3412]/15 transition-all">
            <div className="pl-4 text-stone-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm theo tên quán ăn, món ăn (Phở, Bún chả, Cà phê...) hoặc con phố..."
              className="w-full py-3.5 pl-3 pr-10 text-sm text-stone-900 placeholder:text-stone-400 bg-transparent border-0 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="pr-4 text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* District Quick Jumps (Interactive Filter Buttons) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="text-stone-400 mr-1 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5" /> Khu vực:
          </span>
          {DISTRICT_LIST.map((dist) => {
            const isActive = selectedDistrict === dist;
            return (
              <button
                key={dist}
                onClick={() => onSelectDistrict(dist)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                {dist}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
