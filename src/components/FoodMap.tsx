import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Restaurant, Review } from '../types/foody';
import { Star, MapPin, Sparkles, ArrowRight, X, Eye, Utensils } from 'lucide-react';

interface FoodMapProps {
  restaurants: Restaurant[];
  reviews: Review[];
  hoveredRestaurantId: string | null;
  onHoverRestaurant: (restaurantId: string | null) => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  selectedDistrict: string;
}

export const FoodMap: React.FC<FoodMapProps> = ({
  restaurants,
  reviews,
  hoveredRestaurantId,
  onHoverRestaurant,
  onSelectRestaurant,
  selectedDistrict,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const [activePreviewRestaurant, setActivePreviewRestaurant] = useState<Restaurant | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Leaflet Map centered on central Hanoi
      const map = L.map(mapContainerRef.current, {
        center: [21.033, 105.850],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap Tile Layer (100% free, no API key required, crisp Vietnamese street names)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Add zoom control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Attribution bottom-right
      L.control.attribution({ position: 'bottomright', prefix: '© OpenStreetMap' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers when restaurants change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const bounds = L.latLngBounds([]);

    restaurants.forEach((restaurant) => {
      const { lat, lng } = restaurant.coordinates;
      bounds.extend([lat, lng]);

      // Custom HTML Pin Marker
      const isHovered = hoveredRestaurantId === restaurant.id;
      const markerHtml = `
        <div class="group relative cursor-pointer transform -translate-x-1/2 -translate-y-full transition-transform duration-200">
          <div class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow-md transition-all ${
            isHovered
              ? 'bg-[#9A3412] text-white scale-110 ring-4 ring-[#9A3412]/30 z-30'
              : 'bg-white text-stone-900 border border-stone-300 hover:bg-[#9A3412] hover:text-white'
          }">
            <span class="text-amber-400">★</span>
            <span class="tabular-nums">${restaurant.ratingOverall.toFixed(1)}</span>
            <span class="text-[10px] opacity-80 truncate max-w-[70px]">${restaurant.name.split(' ')[0]}</span>
          </div>
          <div class="w-2 h-2 bg-stone-800 rotate-45 mx-auto -mt-1 ${
            isHovered ? 'bg-[#9A3412]' : 'bg-white'
          }"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-food-pin',
        html: markerHtml,
        iconSize: [80, 36],
        iconAnchor: [40, 36],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Event handlers for hover and click
      marker.on('mouseover', () => {
        onHoverRestaurant(restaurant.id);
        setActivePreviewRestaurant(restaurant);
      });

      marker.on('click', () => {
        onSelectRestaurant(restaurant);
      });

      markersRef.current[restaurant.id] = marker;
    });

    // Fit map bounds if restaurants exist
    if (restaurants.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [restaurants]);

  // Handle external hover changes (e.g. from list card hover)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (hoveredRestaurantId) {
      const target = restaurants.find((r) => r.id === hoveredRestaurantId);
      if (target) {
        setActivePreviewRestaurant(target);
        // Pan gently to hovered restaurant
        map.panTo([target.coordinates.lat, target.coordinates.lng], {
          animate: true,
          duration: 0.5,
        });
      }
    }

    // Update marker styling
    restaurants.forEach((restaurant) => {
      const marker = markersRef.current[restaurant.id];
      if (!marker) return;

      const isHovered = hoveredRestaurantId === restaurant.id;
      const markerHtml = `
        <div class="group relative cursor-pointer transform -translate-x-1/2 -translate-y-full transition-transform duration-200">
          <div class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-md transition-all ${
            isHovered
              ? 'bg-[#9A3412] text-white scale-120 ring-4 ring-[#9A3412]/30 shadow-lg z-30'
              : 'bg-white text-stone-900 border border-stone-300 hover:bg-[#9A3412] hover:text-white'
          }">
            <span class="text-amber-400">★</span>
            <span class="tabular-nums">${restaurant.ratingOverall.toFixed(1)}</span>
            <span class="text-[11px] opacity-90 truncate max-w-[85px]">${restaurant.name.split(' (')[0]}</span>
          </div>
          <div class="w-2.5 h-2.5 rotate-45 mx-auto -mt-1.5 ${
            isHovered ? 'bg-[#9A3412]' : 'bg-white border-r border-b border-stone-300'
          }"></div>
        </div>
      `;

      marker.setIcon(
        L.divIcon({
          className: 'custom-food-pin',
          html: markerHtml,
          iconSize: [90, 40],
          iconAnchor: [45, 40],
        })
      );
    });
  }, [hoveredRestaurantId, restaurants]);

  // Find reviews for currently active preview restaurant
  const currentRestaurantReviews = activePreviewRestaurant
    ? reviews.filter((r) => r.restaurantId === activePreviewRestaurant.id)
    : [];

  const latestReview = currentRestaurantReviews[0];

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([21.033, 105.850], 14, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-[580px] lg:h-[650px] rounded-2xl overflow-hidden border border-stone-300 shadow-sm bg-stone-100">
      {/* The Leaflet Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Banner Guide on the Map */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-stone-200/90 shadow-sm flex items-center gap-2 text-xs font-medium text-stone-700 pointer-events-auto">
        <MapPin className="w-4 h-4 text-[#9A3412]" />
        <span>Di chuột vào quán trên bản đồ để xem đánh giá & review</span>
        <button
          onClick={handleResetView}
          className="ml-2 text-[11px] text-[#9A3412] hover:underline font-semibold cursor-pointer"
        >
          Trọng tâm Hà Nội
        </button>
      </div>

      {/* Interactive Review Hover / Preview Popover Card */}
      {activePreviewRestaurant && (
        <div
          className="absolute bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-96 z-20 bg-white rounded-2xl border border-stone-300 shadow-2xl p-4 sm:p-5 animate-slide-up backdrop-blur-md pointer-events-auto"
          onMouseEnter={() => onHoverRestaurant(activePreviewRestaurant.id)}
          onMouseLeave={() => onHoverRestaurant(null)}
        >
          {/* Card Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-sans">
                <span className="font-semibold text-[#9A3412]">{activePreviewRestaurant.category}</span>
                <span aria-hidden="true">·</span>
                <span>{activePreviewRestaurant.district}</span>
              </div>
              <h3
                onClick={() => onSelectRestaurant(activePreviewRestaurant)}
                className="font-serif text-base sm:text-lg font-bold text-stone-900 hover:text-[#9A3412] cursor-pointer transition-colors leading-tight"
              >
                {activePreviewRestaurant.name}
              </h3>
            </div>

            <button
              onClick={() => setActivePreviewRestaurant(null)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors cursor-pointer"
              title="Đóng xem trước"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Score & Thumbnail Strip */}
          <div className="flex gap-3 items-center mb-3">
            <div
              onClick={() => onSelectRestaurant(activePreviewRestaurant)}
              className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0 cursor-pointer"
            >
              <img
                src={activePreviewRestaurant.coverImage}
                alt={activePreviewRestaurant.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1 text-[#9A3412]">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
                <span className="font-serif text-xl font-bold tabular-nums">
                  {activePreviewRestaurant.ratingOverall.toFixed(1)}
                </span>
                <span className="text-xs text-stone-400">/ 10</span>
                <span className="text-[11px] text-stone-500 ml-1">
                  ({activePreviewRestaurant.reviewCount} đánh giá)
                </span>
              </div>

              {/* 4 Criteria mini pills */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-stone-600 mt-1">
                <span>Vị giác: <strong className="text-stone-800">{activePreviewRestaurant.ratingsBreakdown.flavor}</strong></span>
                <span>Giá cả: <strong className="text-stone-800">{activePreviewRestaurant.ratingsBreakdown.price}</strong></span>
                <span>Không gian: <strong className="text-stone-800">{activePreviewRestaurant.ratingsBreakdown.space}</strong></span>
                <span>Phục vụ: <strong className="text-stone-800">{activePreviewRestaurant.ratingsBreakdown.service}</strong></span>
              </div>
            </div>
          </div>

          {/* Review Quote Highlight */}
          {latestReview ? (
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 mb-3 text-xs">
              <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                <span className="font-bold text-stone-800">{latestReview.authorName}</span>
                <span className="text-[10px] text-stone-400">Đánh giá {latestReview.rating}/10</span>
              </div>
              <p className="text-stone-700 italic line-clamp-2 leading-relaxed">
                "{latestReview.content}"
              </p>
            </div>
          ) : (
            <p className="text-xs text-stone-500 italic mb-3">
              Chưa có bài review chi tiết. Hãy là người đầu tiên đánh giá!
            </p>
          )}

          {/* Card Footer Actions */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700 tabular-nums">
              {activePreviewRestaurant.priceRange}
            </span>

            <button
              onClick={() => onSelectRestaurant(activePreviewRestaurant)}
              className="px-3 py-1.5 bg-[#9A3412] hover:bg-[#78280E] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <span>Xem chi tiết & Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
