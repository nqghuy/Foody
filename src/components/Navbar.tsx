import React from 'react';
import { Bookmark, PenLine, UtensilsCrossed } from 'lucide-react';

interface NavbarProps {
  bookmarkCount: number;
  onOpenBookmarks: () => void;
  onOpenWriteReview: () => void;
  onSelectCategoryNav?: (cat: string) => void;
  activeTab: 'catalog' | 'map';
  onSelectTab: (tab: 'catalog' | 'map') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  bookmarkCount,
  onOpenBookmarks,
  onOpenWriteReview,
  onSelectCategoryNav,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-stone-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark in display face) */}
        <button
          onClick={() => onSelectTab('catalog')}
          className="group flex items-center gap-2.5 text-stone-900 whitespace-nowrap shrink-0 text-left cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-[#9A3412] text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm">
            Vị
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-[#9A3412] transition-colors leading-none">
              Hà Nội Vị Ký
            </span>
            <span className="text-[11px] uppercase tracking-widest text-stone-500 font-sans mt-0.5">
              Tạp Chí & Cẩm Nang Ẩm Thực
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => {
              onSelectTab('catalog');
              onSelectCategoryNav?.('Tất cả món');
            }}
            className={`transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'catalog'
                ? 'text-stone-900 font-semibold underline decoration-[#9A3412] underline-offset-8'
                : 'hover:text-stone-900'
            }`}
          >
            Khám phá quán
          </button>

          {/* Dedicated Map Tab */}
          <button
            onClick={() => onSelectTab('map')}
            className={`transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'map'
                ? 'text-[#9A3412] font-semibold underline decoration-[#9A3412] underline-offset-8'
                : 'hover:text-stone-900'
            }`}
          >
            <span>Bản đồ ẩm thực</span>
            <span className="text-[10px] bg-[#9A3412]/10 text-[#9A3412] px-1.5 py-0.2 rounded font-bold uppercase">
              Bản đồ
            </span>
          </button>

          <button
            onClick={() => {
              onSelectTab('catalog');
              onSelectCategoryNav?.('Phở gia truyền');
            }}
            className="hover:text-stone-900 hover:underline decoration-[#9A3412] underline-offset-8 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            Phở gia truyền
          </button>
          <button
            onClick={() => {
              onSelectTab('catalog');
              onSelectCategoryNav?.('Cà phê & Trà');
            }}
            className="hover:text-stone-900 hover:underline decoration-[#9A3412] underline-offset-8 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            Cà phê phố cổ
          </button>
          <button
            onClick={() => {
              onSelectTab('catalog');
              onSelectCategoryNav?.('Chả cá & Đặc sản');
            }}
            className="hover:text-stone-900 hover:underline decoration-[#9A3412] underline-offset-8 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            Đặc sản Hà Thành
          </button>
        </nav>

        {/* Zone 3: Primary Action Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenBookmarks}
            className="relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100/80 hover:bg-stone-200/80 border border-stone-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            aria-label="Xem danh sách quán đã lưu"
          >
            <Bookmark className="w-4 h-4 text-[#9A3412]" />
            <span className="hidden sm:inline">Quán đã lưu</span>
            {bookmarkCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-[#9A3412] text-white text-[10px] font-bold rounded-full">
                {bookmarkCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenWriteReview}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#9A3412] hover:bg-[#78280E] rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Viết Review</span>
          </button>
        </div>
      </div>
    </header>
  );
};
