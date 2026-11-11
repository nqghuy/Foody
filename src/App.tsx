import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FilterBar } from './components/FilterBar';
import { RestaurantCard } from './components/RestaurantCard';
import { RestaurantModal } from './components/RestaurantModal';
import { WriteReviewModal } from './components/WriteReviewModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { Toast, ToastMessage } from './components/Toast';
import { FoodMap } from './components/FoodMap';
import { INITIAL_RESTAURANTS, INITIAL_REVIEWS } from './data/hanoiRestaurants';
import { Restaurant, Review, Category, District, PriceLevel } from './types/foody';
import { UtensilsCrossed, Compass, Heart, Search, Sparkles, Map, LayoutGrid } from 'lucide-react';

const CATEGORY_LIST: Category[] = [
  'Tất cả món',
  'Phở gia truyền',
  'Bún chả & Nem',
  'Cà phê & Trà',
  'Chả cá & Đặc sản',
  'Bánh cuốn & Bánh mì',
  'Bún đậu mắm tôm',
  'Bún riêu & Miến ngan',
  'Chè & Tráng miệng',
];

const LOCAL_STORAGE_REVIEWS_KEY = 'hanoi_viki_reviews_v1';
const LOCAL_STORAGE_BOOKMARKS_KEY = 'hanoi_viki_bookmarks_v1';

export default function App() {
  // 1. Data State & Persistence
  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...parsed, ...INITIAL_REVIEWS.filter((initRev) => !parsed.some((p: Review) => p.id === initRev.id))];
      }
    } catch (e) {
      console.error('Error loading reviews from localStorage', e);
    }
    return INITIAL_REVIEWS;
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_BOOKMARKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading bookmarks from localStorage', e);
    }
    return ['pho-thin-lo-duc', 'cafe-giang-yen-the']; // Default favorites
  });

  // 2. Filter & Search State
  const [activeTab, setActiveTab] = useState<'catalog' | 'map'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Tất cả món');
  const [selectedDistrict, setSelectedDistrict] = useState<District>('Tất cả quận');
  const [selectedPriceLevel, setSelectedPriceLevel] = useState<PriceLevel | 'all'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating');
  const [hoveredRestaurantId, setHoveredRestaurantId] = useState<string | null>(null);

  // 3. UI Modal State
  const [selectedRestaurantForModal, setSelectedRestaurantForModal] = useState<Restaurant | null>(null);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [targetRestaurantForReview, setTargetRestaurantForReview] = useState<Restaurant | null>(null);
  const [isBookmarksDrawerOpen, setIsBookmarksDrawerOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync Bookmarks to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_BOOKMARKS_KEY, JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.error('Error saving bookmarks', e);
    }
  }, [bookmarkedIds]);

  // Sync User Reviews to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.error('Error saving reviews', e);
    }
  }, [reviews]);

  // Filter & Search Logic
  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = r.name.toLowerCase().includes(q);
          const matchTagline = r.tagline.toLowerCase().includes(q);
          const matchAddress = r.address.toLowerCase().includes(q);
          const matchCategory = r.category.toLowerCase().includes(q);
          const matchDishes = r.signatureDishes.some((d) => d.toLowerCase().includes(q));
          const matchMenu = r.menu.some((m) => m.name.toLowerCase().includes(q));
          if (!matchName && !matchTagline && !matchAddress && !matchCategory && !matchDishes && !matchMenu) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'Tất cả món' && r.category !== selectedCategory) {
          return false;
        }

        // District filter
        if (selectedDistrict !== 'Tất cả quận' && r.district !== selectedDistrict) {
          return false;
        }

        // Price Level filter
        if (selectedPriceLevel !== 'all' && r.priceLevel !== selectedPriceLevel) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.ratingOverall - a.ratingOverall;
        if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'vi');
        return 0;
      });
  }, [restaurants, searchQuery, selectedCategory, selectedDistrict, selectedPriceLevel, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'Tất cả món' ||
    selectedDistrict !== 'Tất cả quận' ||
    selectedPriceLevel !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Tất cả món');
    setSelectedDistrict('Tất cả quận');
    setSelectedPriceLevel('all');
    setSortBy('rating');
  };

  // Toggle Bookmark Handler
  const handleToggleBookmark = (restaurantId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isBookmarked = bookmarkedIds.includes(restaurantId);
    const target = restaurants.find((r) => r.id === restaurantId);

    if (isBookmarked) {
      setBookmarkedIds((prev) => prev.filter((id) => id !== restaurantId));
      setToast({
        id: Date.now().toString(),
        type: 'info',
        message: `Đã bỏ lưu ${target?.name || 'quán'}`,
      });
    } else {
      setBookmarkedIds((prev) => [...prev, restaurantId]);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: `Đã thêm ${target?.name || 'quán'} vào cẩm nang yêu thích`,
      });
    }
  };

  // Open Write Review Modal for specific restaurant or general
  const handleOpenWriteReview = (restaurant?: Restaurant) => {
    setTargetRestaurantForReview(restaurant || null);
    setIsWriteReviewOpen(true);
  };

  // Submit Review Handler
  const handleAddReview = (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
    };

    // Update reviews list
    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);

    // Recalculate restaurant score
    setRestaurants((prevList) =>
      prevList.map((rest) => {
        if (rest.id === reviewData.restaurantId) {
          const restReviews = updatedReviews.filter((r) => r.restaurantId === rest.id);
          const totalRating = restReviews.reduce((sum, r) => sum + r.rating, 0);
          const newAvgRating = parseFloat((totalRating / restReviews.length).toFixed(1));

          // Also update criteria
          const avgFlavor = parseFloat((restReviews.reduce((sum, r) => sum + r.ratingsBreakdown.flavor, 0) / restReviews.length).toFixed(1));
          const avgPrice = parseFloat((restReviews.reduce((sum, r) => sum + r.ratingsBreakdown.price, 0) / restReviews.length).toFixed(1));
          const avgSpace = parseFloat((restReviews.reduce((sum, r) => sum + r.ratingsBreakdown.space, 0) / restReviews.length).toFixed(1));
          const avgService = parseFloat((restReviews.reduce((sum, r) => sum + r.ratingsBreakdown.service, 0) / restReviews.length).toFixed(1));

          const updatedRest: Restaurant = {
            ...rest,
            ratingOverall: newAvgRating,
            reviewCount: restReviews.length,
            ratingsBreakdown: {
              flavor: avgFlavor,
              price: avgPrice,
              space: avgSpace,
              service: avgService,
            },
          };

          // If currently viewing modal, update active modal object
          if (selectedRestaurantForModal?.id === rest.id) {
            setSelectedRestaurantForModal(updatedRest);
          }

          return updatedRest;
        }
        return rest;
      })
    );

    setIsWriteReviewOpen(false);
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: 'Đăng bài review thành công! Cảm ơn cảm nhận quý báu của bạn.',
    });
  };

  // Helpful Vote Handler
  const handleHelpfulVote = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return { ...r, helpfulCount: r.helpfulCount + 1 };
        }
        return r;
      })
    );
    setToast({
      id: Date.now().toString(),
      type: 'info',
      message: 'Cảm ơn bạn đã ghi nhận bài viết hữu ích!',
    });
  };

  // Bookmarked restaurant objects
  const bookmarkedRestaurants = useMemo(() => {
    return restaurants.filter((r) => bookmarkedIds.includes(r.id));
  }, [restaurants, bookmarkedIds]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-900 font-sans flex flex-col selection:bg-[#9A3412]/20 selection:text-[#9A3412]">
      {/* 1. Global Navigation Bar */}
      <Navbar
        bookmarkCount={bookmarkedIds.length}
        onOpenBookmarks={() => setIsBookmarksDrawerOpen(true)}
        onOpenWriteReview={() => handleOpenWriteReview()}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSelectCategoryNav={(cat) => {
          setActiveTab('catalog');
          setSelectedCategory(cat as Category);
          const el = document.getElementById('browse-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {activeTab === 'catalog' ? (
        /* ==================== TAB 1: GIAO DIỆN CŨ (ORIGINAL CATALOG VIEW) ==================== */
        <>
          {/* 2. Hero Editorial Section with Integrated Search */}
          <HeroSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
            totalRestaurants={restaurants.length}
          />

          {/* 3. Filter Controls & Segmented Tabs */}
          <div id="browse-section">
            <FilterBar
              categories={CATEGORY_LIST}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedPriceLevel={selectedPriceLevel}
              onSelectPriceLevel={setSelectedPriceLevel}
              sortBy={sortBy}
              onSelectSortBy={setSortBy}
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
              resultCount={filteredRestaurants.length}
              onOpenMapTab={() => setActiveTab('map')}
            />
          </div>

          {/* 4. Main Restaurant Grid Content (Giao diện nguyên bản 3 cột) */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
            {/* Curatorial Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-stone-200">
              <div>
                <div className="text-xs uppercase tracking-widest text-[#9A3412] font-semibold">
                  Hanoi Gastronomic Catalog
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-0.5">
                  {selectedCategory === 'Tất cả món' ? 'Tất Cả Địa Chỉ Ẩm Thực' : selectedCategory}
                  {selectedDistrict !== 'Tất cả quận' && ` tại ${selectedDistrict}`}
                </h2>
              </div>
              <div className="text-xs text-stone-500 font-sans">
                Được cập nhật thường xuyên bởi cộng đồng sành ăn Hà Nội
              </div>
            </div>

            {/* Empty State */}
            {filteredRestaurants.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-300 p-8">
                <Search className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-stone-800 mb-1">
                  Không tìm thấy quán ăn phù hợp
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5 leading-relaxed">
                  Hãy thử tìm kiếm với từ khóa khác, hoặc xóa bớt tiêu chí lọc về quận và mức giá.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-[#9A3412] text-white rounded-lg text-xs font-semibold hover:bg-[#78280E] transition-colors cursor-pointer"
                >
                  Xem lại tất cả quán
                </button>
              </div>
            ) : (
              /* Original 3-Column Responsive Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isBookmarked={bookmarkedIds.includes(restaurant.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onSelect={(rest) => setSelectedRestaurantForModal(rest)}
                  />
                ))}
              </div>
            )}

            {/* Curatorial Feature Banner */}
            <div className="mt-16 p-8 rounded-2xl bg-stone-900 text-stone-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-amber-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tiêu Chuẩn Đánh Giá Hà Nội Vị Ký</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Bạn biết một góc quán ngon chuẩn vị chưa có trong cẩm nang?
                </h3>
                <p className="text-xs text-stone-300 font-sans leading-relaxed">
                  Mỗi quán ăn tại Hà Nội là một câu chuyện di sản về hương vị và tấm lòng của người đứng bếp.
                  Đóng góp bài review của bạn để cùng cộng đồng xây dựng cẩm nang ẩm thực chân thật nhất.
                </p>
              </div>
              <button
                onClick={() => handleOpenWriteReview()}
                className="px-5 py-3 bg-[#9A3412] hover:bg-[#B93815] text-white rounded-xl text-xs font-bold transition-all shadow-md whitespace-nowrap cursor-pointer shrink-0"
              >
                Đóng Góp Review Ngay
              </button>
            </div>
          </main>
        </>
      ) : (
        /* ==================== TAB 2: TAB BẢN ĐỒ ẨM THỰC RIÊNG BIỆT (DEDICATED MAP TAB) ==================== */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-5">
          {/* Map Tab Header */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="text-xs font-semibold text-[#9A3412] hover:underline cursor-pointer"
                >
                  ← Quay lại danh sách quán
                </button>
                <span className="text-stone-300">|</span>
                <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
                  Bản Đồ Phố Ẩm Thực Hà Nội
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                Tọa Độ Quán Ngon & Trích Đoạn Review
              </h2>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                Di chuột vào bất kỳ quán nào trên bản đồ hoặc danh sách bên cạnh để xem ngay điểm số và review chân thật từ thực khách.
              </p>
            </div>

            {/* Quick District Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['Tất cả quận', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Ba Đình', 'Tây Hồ'].map((dist) => (
                <button
                  key={dist}
                  onClick={() => setSelectedDistrict(dist as District)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedDistrict === dist
                      ? 'bg-[#1C1917] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Map Layout (Split with side list) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left side: Scrollable mini list (4 columns) */}
            <div className="lg:col-span-4 space-y-3 max-h-[650px] overflow-y-auto pr-1">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>{filteredRestaurants.length} địa chỉ chuẩn vị</span>
                <span className="text-[11px] text-[#9A3412]">Di chuột để xem review</span>
              </div>
              {filteredRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  onClick={() => setSelectedRestaurantForModal(restaurant)}
                  onMouseEnter={() => setHoveredRestaurantId(restaurant.id)}
                  onMouseLeave={() => setHoveredRestaurantId(null)}
                  className={`bg-white p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                    hoveredRestaurantId === restaurant.id
                      ? 'border-[#9A3412] ring-2 ring-[#9A3412]/20 shadow-md bg-stone-50/50'
                      : 'border-stone-200 hover:border-stone-300 shadow-2xs'
                  }`}
                >
                  <img
                    src={restaurant.coverImage}
                    alt={restaurant.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#9A3412] truncate">
                        {restaurant.category}
                      </span>
                      <span className="text-xs font-bold text-stone-900 tabular-nums">
                        ★ {restaurant.ratingOverall.toFixed(1)}
                      </span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-stone-900 truncate mt-0.5">
                      {restaurant.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 truncate mt-0.5">
                      {restaurant.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right side: Large Interactive Map (8 columns) */}
            <div className="lg:col-span-8 sticky top-22">
              <FoodMap
                restaurants={filteredRestaurants}
                reviews={reviews}
                hoveredRestaurantId={hoveredRestaurantId}
                onHoverRestaurant={setHoveredRestaurantId}
                onSelectRestaurant={(rest) => setSelectedRestaurantForModal(rest)}
                selectedDistrict={selectedDistrict}
              />
            </div>
          </div>
        </main>
      )}

      {/* 5. Minimalist Editorial Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-12 px-4 sm:px-6 lg:px-8 text-stone-600">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#9A3412] text-white flex items-center justify-center font-serif text-sm font-bold">
                Vị
              </div>
              <span className="font-serif text-lg font-bold text-stone-900">
                Hà Nội Vị Ký
              </span>
            </div>
            <p className="text-xs text-stone-500 max-w-md leading-relaxed font-sans">
              Nền tảng cẩm nang và review ẩm thực Hà Nội theo phong cách tạp chí biên tập trang nhã.
              Tôn vinh tinh hoa vị giác Tràng An, kết nối thực khách và những góc quán truyền đời.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 text-xs">
            <div className="font-bold uppercase tracking-wider text-stone-900">
              Khu Vực Tiêu Điểm
            </div>
            <ul className="space-y-1.5 text-stone-500">
              <li>
                <button onClick={() => setSelectedDistrict('Hoàn Kiếm')} className="hover:text-[#9A3412] cursor-pointer">
                  Ẩm thực Phố Cổ Hoàn Kiếm
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedDistrict('Hai Bà Trưng')} className="hover:text-[#9A3412] cursor-pointer">
                  Món ngon Hai Bà Trưng
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedDistrict('Tây Hồ')} className="hover:text-[#9A3412] cursor-pointer">
                  Quán view đẹp Hồ Tây
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedDistrict('Ba Đình')} className="hover:text-[#9A3412] cursor-pointer">
                  Cà phê & đặc sản Ba Đình
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-2 text-xs">
            <div className="font-bold uppercase tracking-wider text-stone-900">
              Món Ăn Nổi Tiếng
            </div>
            <ul className="space-y-1.5 text-stone-500">
              <li>
                <button onClick={() => setSelectedCategory('Phở gia truyền')} className="hover:text-[#9A3412] cursor-pointer">
                  Phở bò tái lăn & Phở trong
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedCategory('Bún chả & Nem')} className="hover:text-[#9A3412] cursor-pointer">
                  Bún chả nướng than hoa
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedCategory('Cà phê & Trà')} className="hover:text-[#9A3412] cursor-pointer">
                  Cà phê trứng & Cà phê rang mộc
                </button>
              </li>
              <li>
                <button onClick={() => setSelectedCategory('Chả cá & Đặc sản')} className="hover:text-[#9A3412] cursor-pointer">
                  Chả cá Lã Vọng di sản
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400 font-sans">
          <span>© 2026 Hà Nội Vị Ký · Tạp Chí Ẩm Thực Thủ Đô. Mọi quyền được bảo lưu.</span>
          <div className="flex items-center gap-4">
            <span>Tiêu chí 4 điểm: Hương vị · Giá cả · Không gian · Phục vụ</span>
          </div>
        </div>
      </footer>

      {/* 6. Detailed Restaurant Modal */}
      {selectedRestaurantForModal && (
        <RestaurantModal
          restaurant={selectedRestaurantForModal}
          reviews={reviews.filter((r) => r.restaurantId === selectedRestaurantForModal.id)}
          isBookmarked={bookmarkedIds.includes(selectedRestaurantForModal.id)}
          onToggleBookmark={(id) => handleToggleBookmark(id)}
          onClose={() => setSelectedRestaurantForModal(null)}
          onOpenWriteReview={(rest) => handleOpenWriteReview(rest)}
          onHelpfulVote={handleHelpfulVote}
        />
      )}

      {/* 7. Write Review Modal */}
      {isWriteReviewOpen && (
        <WriteReviewModal
          restaurants={restaurants}
          preselectedRestaurant={targetRestaurantForReview}
          onClose={() => setIsWriteReviewOpen(false)}
          onSubmitReview={handleAddReview}
        />
      )}

      {/* 8. Saved Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksDrawerOpen}
        onClose={() => setIsBookmarksDrawerOpen(false)}
        bookmarkedRestaurants={bookmarkedRestaurants}
        onRemoveBookmark={(id) => handleToggleBookmark(id)}
        onSelectRestaurant={(rest) => setSelectedRestaurantForModal(rest)}
      />

      {/* 9. Floating Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
