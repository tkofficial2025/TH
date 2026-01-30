import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  ChevronDown,
  Heart,
  Bed,
  Maximize2,
  MapPin,
  SlidersHorizontal,
  Map as MapIcon,
  Bookmark,
} from 'lucide-react';
import { Header } from '@/app/components/Header';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { supabase } from '@/lib/supabase';
import { type Property, type SupabasePropertyRow, mapSupabaseRowToProperty } from '@/lib/properties';

interface RentPropertiesPageProps {
  onNavigate?: (page: 'home' | 'buy' | 'rent') => void;
}

export function RentPropertiesPage({ onNavigate }: RentPropertiesPageProps) {
  const [showMap, setShowMap] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRentProperties() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('Properties')
        .select('*')
        .eq('type', 'rent');
      if (import.meta.env.DEV) console.log('[Rent] Supabase', { data, error: err });
      if (err) {
        setError(err.message);
        setProperties([]);
      } else {
        setProperties((data ?? []).map((row) => mapSupabaseRowToProperty(row as SupabasePropertyRow)));
      }
      setLoading(false);
    }
    fetchRentProperties();
  }, []);

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `¥${(price / 10000).toFixed(0)}万`;
    }
    return `¥${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} />
      
      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:border-gray-300 transition-colors">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent border-none outline-none text-sm w-32"
              />
            </div>

            {/* Type */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-100 transition-all text-sm font-medium text-gray-700">
              Type
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Wards */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-100 transition-all text-sm font-medium text-gray-700">
              Wards
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Train station */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-100 transition-all text-sm font-medium text-gray-700">
              Train station
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Bedrooms */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-100 transition-all text-sm font-medium text-gray-700">
              Bedrooms
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Monthly Rent */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-100 transition-all text-sm font-medium text-gray-700">
              Monthly Rent
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Size */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-100 transition-all text-sm font-medium text-gray-700">
              Size (m²)
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* More */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-100 transition-all text-sm font-medium text-gray-700">
              More
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Spacer */}
            <div className="flex-1 min-w-[20px]" />

            {/* Save */}
            <button className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all text-sm font-medium">
              <Bookmark className="w-3.5 h-3.5" />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8">
          {/* Left Column - Listings */}
          <div>
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Properties for rent
                </h1>
                <p className="text-gray-600">1,523 results</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Show Map Toggle */}
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors lg:hidden"
                >
                  <MapIcon className="w-4 h-4" />
                  Show map
                </button>

                {/* Sort Dropdown */}
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all text-sm font-medium text-gray-700">
                  Popularity
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Listings Container */}
            <div className="space-y-4">
              {loading && (
                <div className="py-16 text-center text-gray-500">読み込み中...</div>
              )}
              {error && (
                <div className="py-16 text-center text-red-600">エラー: {error}</div>
              )}
              {!loading && !error && properties.length === 0 && (
                <div className="py-16 text-center text-gray-500">
                  物件がありません。Supabase の properties テーブルに type=rent のデータを追加してください。
                </div>
              )}
              {!loading && !error && properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    property.isFeatured ? 'lg:h-[480px]' : 'lg:h-[360px]'
                  }`}
                  whileHover={{ y: -4 }}
                >
                  {/* Image */}
                  <div className="relative h-full w-full overflow-hidden">
                    <ImageWithFallback
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {property.isFeatured && (
                        <span className="px-3 py-1 bg-[#C1121F] text-white text-xs font-semibold rounded-full">
                          MOST POPULAR
                        </span>
                      )}
                      {property.isNew && (
                        <span className="px-3 py-1 bg-white text-gray-900 text-xs font-semibold rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(property.id);
                      }}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          favorites.has(property.id)
                            ? 'fill-[#C1121F] text-[#C1121F]'
                            : 'text-gray-700'
                        }`}
                      />
                    </button>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {property.title}
                      </h3>
                      <p className="text-white/80 text-sm mb-3">
                        {property.address}
                      </p>

                      <div className="text-3xl font-bold text-white mb-4">
                        {formatPrice(property.price)}/月
                      </div>

                      {/* Attributes */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1.5 text-white/90">
                          <Bed className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {property.beds} beds
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/90">
                          <Maximize2 className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {property.size} m²
                          </span>
                        </div>
                        <div className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                          <span className="text-sm font-medium text-white">
                            {property.layout}
                          </span>
                        </div>
                      </div>

                      {/* Station Tag */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                        <MapPin className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs font-medium text-white">
                          {property.station} • {property.walkingMinutes} min walk
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-8 text-center">
              <button className="px-8 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
                Load more properties
              </button>
            </div>
          </div>

          {/* Right Column - Map Placeholder */}
          <div className="hidden lg:block">
            <div className="sticky top-24 h-[calc(100vh-120px)] bg-[#E8E5DD] rounded-2xl overflow-hidden shadow-md relative">
              {/* Map Grid Lines - subtle background pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-rent" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#999" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-rent)" />
                </svg>
              </div>

              {/* Map Content - Property Markers */}
              <div className="absolute inset-0 p-8">
                {/* Price Markers */}
                <div className="absolute top-[15%] right-[25%]">
                  <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                    ¥18万/月
                  </div>
                </div>

                <div className="absolute top-[25%] right-[20%]">
                  <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                    ¥22万/月
                  </div>
                </div>

                <div className="absolute top-[45%] left-[30%]">
                  <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                    ¥16.5万/月
                  </div>
                </div>

                <div className="absolute bottom-[35%] left-[25%]">
                  <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                    ¥32万/月
                  </div>
                </div>

                {/* Cluster Markers */}
                <div className="absolute top-[20%] left-[35%] flex items-center justify-center w-10 h-10 bg-[#FF6B35] text-white rounded-full font-bold text-sm shadow-lg border-2 border-white">
                  3
                </div>

                <div className="absolute top-[22%] left-[45%] flex items-center justify-center w-9 h-9 bg-[#FF6B35] text-white rounded-full font-bold text-sm shadow-lg border-2 border-white">
                  2
                </div>

                <div className="absolute top-[35%] right-[28%] flex items-center justify-center w-11 h-11 bg-[#FF6B35] text-white rounded-full font-bold text-sm shadow-lg border-2 border-white">
                  7
                </div>

                <div className="absolute top-[40%] left-[50%] flex items-center justify-center w-9 h-9 bg-[#FF6B35] text-white rounded-full font-bold text-sm shadow-lg border-2 border-white">
                  2
                </div>

                <div className="absolute bottom-[30%] right-[35%] flex items-center justify-center w-10 h-10 bg-[#FF6B35] text-white rounded-full font-bold text-sm shadow-lg border-2 border-white">
                  5
                </div>

                <div className="absolute top-[55%] left-[35%] flex items-center justify-center w-12 h-12 bg-[#FF6B35] text-white rounded-full font-bold shadow-lg border-2 border-white">
                  12
                </div>

                <div className="absolute bottom-[25%] left-[45%] flex items-center justify-center w-9 h-9 bg-[#FF6B35] text-white rounded-full font-bold text-sm shadow-lg border-2 border-white">
                  3
                </div>

                {/* Road-like lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 0 150 Q 200 180 400 150" stroke="#999" strokeWidth="2" fill="none" />
                  <path d="M 100 0 L 120 300" stroke="#999" strokeWidth="1.5" fill="none" />
                  <path d="M 250 50 L 280 400" stroke="#999" strokeWidth="2" fill="none" />
                  <path d="M 50 250 Q 200 240 350 260" stroke="#999" strokeWidth="1.5" fill="none" />
                </svg>
              </div>

              {/* Coming Soon Overlay */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
                <p className="text-xs font-medium text-gray-600">Interactive map coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
