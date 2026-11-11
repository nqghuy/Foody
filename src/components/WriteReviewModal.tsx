import React, { useState } from 'react';
import { X, Star, Upload, Trash2, Camera, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Restaurant, Review, DetailedRating } from '../types/foody';

interface WriteReviewModalProps {
  restaurants: Restaurant[];
  preselectedRestaurant?: Restaurant | null;
  onClose: () => void;
  onSubmitReview: (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  restaurants,
  preselectedRestaurant,
  onClose,
  onSubmitReview,
}) => {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(
    preselectedRestaurant?.id || (restaurants[0]?.id ?? '')
  );
  const [authorName, setAuthorName] = useState('');
  const [authorTitle, setAuthorTitle] = useState('Thực khách sành ăn');
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Overall rating
  const [rating, setRating] = useState<number>(9.0);

  // 4 Criteria breakdown
  const [flavorRating, setFlavorRating] = useState<number>(9.0);
  const [priceRating, setPriceRating] = useState<number>(8.5);
  const [spaceRating, setSpaceRating] = useState<number>(8.0);
  const [serviceRating, setServiceRating] = useState<number>(8.5);

  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Read up to 4 images
    const currentCount = photos.length;
    const remainingSlots = 4 - currentCount;
    if (remainingSlots <= 0) {
      setErrorMsg('Bạn chỉ có thể đính kèm tối đa 4 hình ảnh cho mỗi bài review.');
      return;
    }

    const filesToRead = Array.from(files).slice(0, remainingSlots);

    filesToRead.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Vui lòng chỉ chọn file hình ảnh (JPG, PNG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so user can re-select same file if needed
    e.target.value = '';
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedRestaurantId) {
      setErrorMsg('Vui lòng chọn quán ăn cần đánh giá.');
      return;
    }

    if (!authorName.trim()) {
      setErrorMsg('Vui lòng nhập họ tên hoặc biệt danh của bạn.');
      return;
    }

    if (content.trim().length < 15) {
      setErrorMsg('Nội dung bài đánh giá cần dài ít nhất 15 ký tự để giúp ích cho cộng đồng.');
      return;
    }

    const targetRestaurant = restaurants.find((r) => r.id === selectedRestaurantId);

    const detailedRatings: DetailedRating = {
      flavor: flavorRating,
      price: priceRating,
      space: spaceRating,
      service: serviceRating,
    };

    onSubmitReview({
      restaurantId: selectedRestaurantId,
      restaurantName: targetRestaurant?.name || '',
      authorName: authorName.trim(),
      authorTitle: authorTitle.trim() || undefined,
      rating,
      ratingsBreakdown: detailedRatings,
      content: content.trim(),
      photos,
      visitDate: visitDate || new Date().toISOString().split('T')[0],
    });
  };

  const getRatingDescription = (score: number) => {
    if (score >= 9.5) return 'Kiệt tác ẩm thực Hà Thành! Không thể bỏ qua.';
    if (score >= 8.5) return 'Rất ngon & chuẩn vị, rất đáng ghé thưởng thức!';
    if (score >= 7.0) return 'Khá ổn, phù hợp cho bữa ăn hàng ngày.';
    if (score >= 5.0) return 'Tạm được, còn nhiều điểm cần cải thiện.';
    return 'Chưa đạt kỳ vọng, cần nâng cấp chất lượng.';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="relative bg-[#FBF9F5] w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-300 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#FBF9F5]/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Viết Đánh Giá Ẩm Thực
            </h2>
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              Chia sẻ cảm nhận chân thật giúp cộng đồng tìm được quán chuẩn vị
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Restaurant Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Quán Ăn Muốn Đánh Giá <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:border-[#9A3412] focus:ring-1 focus:ring-[#9A3412]"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.district} ({r.category})
                </option>
              ))}
            </select>
          </div>

          {/* Author info & visit date row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-1">
              <label className="block text-xs font-semibold text-stone-700">
                Tên của bạn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="VD: Tuấn Anh, Lan Hương..."
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#9A3412]"
                required
              />
            </div>

            <div className="space-y-1 sm:col-span-1">
              <label className="block text-xs font-semibold text-stone-700">
                Chức danh / Danh xưng
              </label>
              <input
                type="text"
                value={authorTitle}
                onChange={(e) => setAuthorTitle(e.target.value)}
                placeholder="VD: Người sành ăn Hà Nội..."
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#9A3412]"
              />
            </div>

            <div className="space-y-1 sm:col-span-1">
              <label className="block text-xs font-semibold text-stone-700">
                Ngày ghé quán
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-[#9A3412]"
              />
            </div>
          </div>

          {/* Rating Section */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 space-y-4">
            {/* Overall Score */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Điểm Đánh Giá Tổng Thể: <span className="text-lg text-[#9A3412] font-serif">{rating.toFixed(1)} / 10</span>
                </label>
                <span className="text-xs text-stone-500 italic">
                  {getRatingDescription(rating)}
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#9A3412]"
              />
            </div>

            {/* Criteria Breakdown Grid */}
            <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Flavor */}
              <div>
                <div className="flex justify-between font-medium text-stone-700 mb-1">
                  <span>Hương vị món ăn:</span>
                  <span className="font-bold text-[#9A3412]">{flavorRating.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={flavorRating}
                  onChange={(e) => setFlavorRating(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#9A3412]"
                />
              </div>

              {/* Price */}
              <div>
                <div className="flex justify-between font-medium text-stone-700 mb-1">
                  <span>Giá cả & độ hài lòng:</span>
                  <span className="font-bold text-[#9A3412]">{priceRating.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={priceRating}
                  onChange={(e) => setPriceRating(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#9A3412]"
                />
              </div>

              {/* Space */}
              <div>
                <div className="flex justify-between font-medium text-stone-700 mb-1">
                  <span>Không gian & vệ sinh:</span>
                  <span className="font-bold text-[#9A3412]">{spaceRating.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={spaceRating}
                  onChange={(e) => setSpaceRating(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#9A3412]"
                />
              </div>

              {/* Service */}
              <div>
                <div className="flex justify-between font-medium text-stone-700 mb-1">
                  <span>Tốc độ phục vụ:</span>
                  <span className="font-bold text-[#9A3412]">{serviceRating.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={serviceRating}
                  onChange={(e) => setServiceRating(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#9A3412]"
                />
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Nội Dung Đánh Giá Chi Tiết <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-stone-400 font-sans">
                {content.length} ký tự (tối thiểu 15)
              </span>
            </div>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bạn cảm nhận thế nào về món ăn (độ đậm đà, nước dùng, thịt, bánh cuốn...), thái độ phục vụ của nhân viên, thời gian chờ đợi, và không gian quán?..."
              className="w-full p-3.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#9A3412] focus:ring-1 focus:ring-[#9A3412]"
              required
            />
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#9A3412]" />
                <span>Hình Ảnh Món Ăn Thực Tế (Tối đa 4 ảnh)</span>
              </label>
              <span className="text-[11px] text-stone-400">
                Đã chọn {photos.length}/4 ảnh
              </span>
            </div>

            {/* Photos Preview Grid */}
            <div className="flex flex-wrap gap-3 items-center">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-300 group shadow-xs"
                >
                  <img
                    src={photo}
                    alt={`Ảnh đính kèm ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-700 text-white rounded-full transition-colors cursor-pointer"
                    title="Xóa ảnh này"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {photos.length < 4 && (
                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-[#9A3412] rounded-lg bg-stone-50 hover:bg-stone-100 cursor-pointer transition-colors text-stone-500 hover:text-[#9A3412]">
                  <Upload className="w-4 h-4 mb-1" />
                  <span className="text-[10px] font-semibold">Tải ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[11px] text-stone-400">
              Mẹo: Tải ảnh chụp món ăn tại quán giúp bài review sinh động và nhận được nhiều lượt cảm ơn hơn!
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-200/70 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-xs font-semibold text-white bg-[#9A3412] hover:bg-[#78280E] transition-all shadow-sm cursor-pointer"
            >
              Đăng Bài Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
