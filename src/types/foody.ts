export type District =
  | 'Tất cả quận'
  | 'Hoàn Kiếm'
  | 'Ba Đình'
  | 'Tây Hồ'
  | 'Hai Bà Trưng'
  | 'Đống Đa'
  | 'Cầu Giấy'
  | 'Thanh Xuân';

export type Category =
  | 'Tất cả món'
  | 'Phở gia truyền'
  | 'Bún chả & Nem'
  | 'Cà phê & Trà'
  | 'Chả cá & Đặc sản'
  | 'Bánh cuốn & Bánh mì'
  | 'Bún đậu mắm tôm'
  | 'Bún riêu & Miến ngan'
  | 'Chè & Tráng miệng';

export type PriceLevel = '$' | '$$' | '$$$' | '$$$$';

export interface DetailedRating {
  flavor: number; // 1 to 10
  price: number;
  space: number;
  service: number;
}

export interface Review {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  authorName: string;
  authorTitle?: string;
  rating: number; // overall 1 to 10
  ratingsBreakdown: DetailedRating;
  content: string;
  photos: string[];
  visitDate: string;
  helpfulCount: number;
  createdAt: string;
}

export interface MenuItem {
  name: string;
  price: string;
  description?: string;
  isSignature?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  category: Category;
  district: District;
  address: string;
  phone: string;
  openingHours: string;
  priceRange: string;
  priceLevel: PriceLevel;
  coverImage: string;
  gallery: string[];
  ratingOverall: number;
  ratingsBreakdown: DetailedRating;
  reviewCount: number;
  editorialNotes: string;
  signatureDishes: string[];
  menu: MenuItem[];
  features: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  isMichelinSelected?: boolean;
  isLegacyHeritage?: boolean;
}
