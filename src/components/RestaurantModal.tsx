import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  Phone,
  Bookmark,
  Heart,
  Share2,
  Copy,
  Check,
  ThumbsUp,
  Camera,
  PenLine,
  Utensils,
  Award,
  Sparkles,
} from 'lucide-react';
import { Restaurant, Review } from '../types/foody';

interface RestaurantModalProps {
  restaurant: Restaurant;
  reviews: Review[];
  isBookmarked: boolean;
  onToggleBookmark: (restaurantId: string) => void;
  onClose: () => void;
  onOpenWriteReview: (restaurant: Restaurant) => void;
  onHelpfulVote: (reviewId: string) => void;
}

export const RestaurantModal: React.FC<RestaurantModalProps> = ({
  restaurant,
  reviews,
  isBookmarked,
  onToggleBookmark,
  onClose,
  onOpenWriteReview,
  onHelpfulVote,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState<string | null>(null);

  const images = restaurant.gallery && restaurant.gallery.length > 0
    ? restaurant.gallery
    : [restaurant.coverImage];

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(restaurant.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 9.0) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 8.0) return 'text-[#9A3412] bg-amber-50 border-amber-200';
    return 'text-stone-700 bg-stone-100 border-stone-200';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="relative bg-[#FBF9F5] w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-300 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#FBF9F5]/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-sans truncate mr-4">
            <span className="font-semibold text-[#9A3412]">{restaurant.category}</span>
            <span aria-hidden="true">·</span>
            <span>{restaurant.district}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{restaurant.priceRange}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleBookmark(restaurant.id)}
              className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                isBookmarked
                  ? 'bg-[#9A3412] text-white border-[#9A3412]'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 hover:text-[#9A3412]'
              }`}
              title={isBookmarked ? 'Bỏ lưu' : 'Lưu quán'}
            >
              <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'Đã lưu' : 'Lưu quán'}</span>
            </button>

            <button
              onClick={() => onOpenWriteReview(restaurant)}
              className="px-3 py-2 bg-[#9A3412] text-white rounded-lg text-xs font-semibold hover:bg-[#78280E] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Viết Review</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto px-6 py-6 space-y-8 flex-1">
          {/* Main Showcase Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Gallery Column (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-stone-200 border border-stone-200/90 shadow-xs">
                <img
                  src={images[activeImageIndex] || restaurant.coverImage}
                  alt={restaurant.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 flex gap-2">
                  {restaurant.isMichelinSelected && (
                    <span className="bg-red-800 text-white text-xs font-semibold px-2.5 py-1 rounded shadow-sm">
                      Michelin Guide Selected
                    </span>
                  )}
                  {restaurant.isLegacyHeritage && (
                    <span className="bg-stone-900 text-stone-100 text-xs font-medium px-2.5 py-1 rounded shadow-sm">
                      Ẩm Thực Di Sản
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#9A3412] scale-102 shadow-xs'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats & Score Column (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-stone-200 space-y-5">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight mb-1">
                  {restaurant.name}
                </h1>
                <p className="text-xs text-stone-600 italic font-sans leading-relaxed">
                  "{restaurant.tagline}"
                </p>
              </div>

              {/* Overall Score Banner */}
              <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Điểm Đánh Giá Chung
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Dựa trên {restaurant.reviewCount} lượt đánh giá
                  </div>
                </div>
                <div className="flex items-baseline gap-1 text-[#9A3412]">
                  <span className="font-serif text-3xl font-extrabold tabular-nums">
                    {restaurant.ratingOverall.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-stone-400">/ 10</span>
                </div>
              </div>

              {/* Detailed 4-Criteria Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="font-semibold text-stone-700 tracking-wide uppercase text-[11px]">
                  Thang Điểm Tiêu Chí
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 font-medium">Hương vị món ăn:</span>
                    <span className="font-bold tabular-nums text-stone-900">{restaurant.ratingsBreakdown.flavor}/10</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#9A3412] h-full rounded-full transition-all duration-500"
                      style={{ width: `${restaurant.ratingsBreakdown.flavor * 10}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-stone-600 font-medium">Giá cả & Giá trị:</span>
                    <span className="font-bold tabular-nums text-stone-900">{restaurant.ratingsBreakdown.price}/10</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${restaurant.ratingsBreakdown.price * 10}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-stone-600 font-medium">Không gian & Vệ sinh:</span>
                    <span className="font-bold tabular-nums text-stone-900">{restaurant.ratingsBreakdown.space}/10</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-stone-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${restaurant.ratingsBreakdown.space * 10}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-stone-600 font-medium">Tốc độ & Phục vụ:</span>
                    <span className="font-bold tabular-nums text-stone-900">{restaurant.ratingsBreakdown.service}/10</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-stone-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${restaurant.ratingsBreakdown.service * 10}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Hours Mini Strip */}
              <div className="pt-2 border-t border-stone-200/80 space-y-2 text-xs text-stone-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#9A3412] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="leading-snug">{restaurant.address}</span>
                    <button
                      onClick={handleCopyAddress}
                      className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#9A3412] hover:underline cursor-pointer"
                    >
                      {copiedAddress ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedAddress ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>Giờ mở cửa: <strong className="text-stone-800">{restaurant.openingHours}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>Điện thoại: <a href={`tel:${restaurant.phone}`} className="text-stone-800 font-semibold hover:underline">{restaurant.phone}</a></span>
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Notes / Story Section */}
          <div className="bg-white p-6 rounded-xl border border-stone-200">
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#9A3412]" />
              <span>Lời Bình Biên Tập & Giai Thoại Quán</span>
            </h3>
            <p className="text-sm text-stone-700 leading-relaxed font-sans first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:text-[#9A3412] first-letter:mr-1">
              {restaurant.editorialNotes}
            </p>

            {/* Features Tags */}
            <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap gap-2 text-xs text-stone-600">
              <span className="font-medium text-stone-400 mr-1">Tiện ích:</span>
              {restaurant.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="bg-stone-100 px-2.5 py-1 rounded-md text-stone-700 font-medium"
                >
                  ✓ {feat}
                </span>
              ))}
            </div>
          </div>

          {/* Signature Menu Section */}
          <div className="bg-white p-6 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#9A3412]" />
                <span>Thực Đơn Món Đặc Sắc</span>
              </h3>
              <span className="text-xs text-stone-400 font-sans">Giá tham khảo</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {restaurant.menu.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-stone-100 hover:border-stone-300 bg-stone-50/50 transition-colors flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-stone-900">{item.name}</span>
                      {item.isSignature && (
                        <span className="text-[10px] uppercase font-bold text-[#9A3412] bg-[#9A3412]/10 px-1.5 py-0.2 rounded">
                          Đặc sản
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-stone-900 tabular-nums shrink-0">
                    {item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Community Reviews Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Đánh Giá Từ Cộng Đồng ({reviews.length})
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Ý kiến thực tế từ những thực khách đã trải nghiệm
                </p>
              </div>

              <button
                onClick={() => onOpenWriteReview(restaurant)}
                className="px-4 py-2 bg-[#9A3412] text-white rounded-lg text-xs font-semibold hover:bg-[#78280E] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Viết cảm nhận của bạn</span>
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-stone-300 p-6">
                <PenLine className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <h4 className="font-serif text-base font-semibold text-stone-800">
                  Chưa có bài đánh giá nào cho quán này
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto mb-4">
                  Bạn là người từng ghé quán thưởng thức? Hãy là người đầu tiên chia sẻ cảm nhận và hình ảnh thực tế!
                </p>
                <button
                  onClick={() => onOpenWriteReview(restaurant)}
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
                >
                  Viết bài review đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <article
                    key={rev.id}
                    className="bg-white p-5 rounded-xl border border-stone-200/90 shadow-2xs space-y-3"
                  >
                    {/* Review Author & Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {rev.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-stone-900">{rev.authorName}</span>
                            {rev.authorTitle && (
                              <span className="text-xs text-stone-400 font-medium">· {rev.authorTitle}</span>
                            )}
                          </div>
                          <div className="text-xs text-stone-400 font-sans mt-0.5">
                            Đi ăn vào ngày {rev.visitDate} · Đăng ngày {rev.createdAt}
                          </div>
                        </div>
                      </div>

                      {/* Rating Score */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#9A3412]/10 border border-[#9A3412]/20 text-[#9A3412] font-bold text-xs shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current text-[#9A3412]" />
                        <span className="tabular-nums text-sm font-sans">{rev.rating.toFixed(1)}</span>
                        <span className="text-stone-400 font-normal">/ 10</span>
                      </div>
                    </div>

                    {/* Criteria mini tags */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 bg-stone-50 p-2 rounded-md font-sans">
                      <span>Vị giác: <strong className="text-stone-800">{rev.ratingsBreakdown.flavor}/10</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Giá cả: <strong className="text-stone-800">{rev.ratingsBreakdown.price}/10</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Không gian: <strong className="text-stone-800">{rev.ratingsBreakdown.space}/10</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Phục vụ: <strong className="text-stone-800">{rev.ratingsBreakdown.service}/10</strong></span>
                    </div>

                    {/* Review Content */}
                    <p className="text-sm text-stone-700 leading-relaxed font-sans whitespace-pre-line">
                      {rev.content}
                    </p>

                    {/* Review Attached Photos */}
                    {rev.photos && rev.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {rev.photos.map((photo, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => setSelectedPhotoZoom(photo)}
                            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-stone-200 group cursor-pointer"
                          >
                            <img
                              src={photo}
                              alt="Review ảnh món ăn"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Helpful Vote Action */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <button
                        onClick={() => onHelpfulVote(rev.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-stone-100 text-stone-600 hover:text-[#9A3412] transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Hữu ích ({rev.helpfulCount})</span>
                      </button>

                      <span className="text-[11px] text-stone-400">Đã xác thực thực khách</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Photo Zoom Modal */}
        {selectedPhotoZoom && (
          <div
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedPhotoZoom(null)}
          >
            <div className="relative max-w-3xl max-h-[85vh] rounded-lg overflow-hidden">
              <img
                src={selectedPhotoZoom}
                alt="Phóng to ảnh"
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedPhotoZoom(null)}
                className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
