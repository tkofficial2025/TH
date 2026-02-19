import { useState, useEffect, useRef } from 'react';
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
import { SelectedAreaFilter } from '@/app/components/SelectedAreaFilter';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { StationLineLogo } from '@/app/components/StationLineLogo';
import { PropertiesMapView } from '@/app/components/PropertiesMapView';
import { supabase } from '@/lib/supabase';
import { filterPropertiesByAreas, addressMatchesWard } from '@/lib/wards';
import { type Property, type SupabasePropertyRow, mapSupabaseRowToProperty } from '@/lib/properties';
import { useCurrency } from '@/app/contexts/CurrencyContext';
import { filterPropertiesByHeroParams, type HeroSearchParams } from '@/lib/searchFilters';

interface RentPropertiesPageProps {
  onNavigate?: (page: 'home' | 'buy' | 'rent') => void;
  selectedWard?: string | null;
  onSelectProperty?: (id: number) => void;
  initialSearchParams?: HeroSearchParams;
}

export function RentPropertiesPage({ onNavigate, selectedWard, onSelectProperty, initialSearchParams }: RentPropertiesPageProps) {
  const [showMap, setShowMap] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const hasAppliedInitialSearch = useRef(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    async function fetchRentProperties() {
      setLoading(true);
      setError(null);
      const { data: raw, error: err } = await supabase.from('properties').select('*').eq('type', 'rent');
      const data = Array.isArray(raw) ? raw : [];
      if (import.meta.env.DEV) console.log('[Rent] Supabase', { data, error: err });
      if (err) {
        setError(err.message);
        setAllProperties([]);
      } else {
        setAllProperties((data ?? []).map((row) => mapSupabaseRowToProperty(row as SupabasePropertyRow)));
      }
      setLoading(false);
    }
    fetchRentProperties();
  }, []);

  useEffect(() => {
    if (initialSearchParams?.selectedAreas?.length && !hasAppliedInitialSearch.current) {
      setSelectedAreas(new Set(initialSearchParams.selectedAreas));
      hasAppliedInitialSearch.current = true;
    }
  }, [initialSearchParams]);

  const baseList =
    initialSearchParams && initialSearchParams.propertyType === 'rent'
      ? filterPropertiesByHeroParams(allProperties, initialSearchParams, 'rent')
      : allProperties;

  const properties =
    selectedAreas.size > 0
      ? filterPropertiesByAreas(baseList, selectedAreas)
      : selectedWard
        ? baseList.filter((p) => addressMatchesWard(p.address, selectedWard))
        : baseList;

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="rent" />
      
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

            {/* Selected Area: 23区＋23区外チェックボックス */}
            <SelectedAreaFilter selectedAreas={selectedAreas} onChange={setSelectedAreas} />

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
        <div className="grid grid-cols-1 md:grid-cols-[1fr,400px] gap-6 md:gap-8">
          {/* Left Column - Listings or Map */}
          <div>
            {/* Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {selectedWard ? `Properties for rent in ${selectedWard}` : 'Properties for rent'}
                </h1>
                <p className="text-gray-600">{properties.length} results</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Show Map Toggle */}
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors md:hidden"
                >
                  <MapIcon className="w-4 h-4" />
                  {showMap ? 'Hide map' : 'Show map'}
                </button>

                {/* Sort Dropdown */}
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all text-sm font-medium text-gray-700">
                  Popularity
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Listings Container or Map */}
            {showMap ? (
              <div className="md:hidden mb-6">
                <PropertiesMapView
                  properties={properties}
                  onPropertyClick={onSelectProperty}
                  height="500px"
                />
              </div>
            ) : (
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
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectProperty?.(property.id)}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectProperty?.(property.id)}
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
                        {formatPrice(property.price, 'rent')}
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
                        <StationLineLogo 
                          stationName={property.station} 
                          size={16} 
                          className="flex-shrink-0" 
                        />
                        <MapPin className="w-3.5 h-3.5 text-white flex-shrink-0" />
                        <span className="text-xs font-medium text-white">
                          {property.station} • {property.walkingMinutes} min walk
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              </div>
            )}

            {/* Load More */}
            <div className="mt-8 text-center">
              <button className="px-8 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
                Load more properties
              </button>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="hidden md:block">
            <div className="sticky top-[4.5rem] h-[calc(100vh-5.5rem)] min-h-[600px]">
              <PropertiesMapView
                properties={properties}
                onPropertyClick={onSelectProperty}
                height="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
