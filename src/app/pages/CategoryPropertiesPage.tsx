import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Heart,
  Bed,
  Maximize2,
  MapPin,
  SlidersHorizontal,
  Map as MapIcon,
  Bookmark,
  X,
} from 'lucide-react';
import { Header } from '@/app/components/Header';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { SelectedAreaFilter } from '@/app/components/SelectedAreaFilter';
import { StationLineLogo } from '@/app/components/StationLineLogo';
import { PropertiesMapView } from '@/app/components/PropertiesMapView';
import { supabase } from '@/lib/supabase';
import { filterPropertiesByAreas, addressMatchesWard } from '@/lib/wards';
import { type Property, type SupabasePropertyRow, mapSupabaseRowToProperty } from '@/lib/properties';
import { useCurrency } from '@/app/contexts/CurrencyContext';
import { sortProperties, sortOptions, type SortOption } from '@/lib/sortProperties';

interface CategoryPropertiesPageProps {
  onNavigate?: (page: 'home' | 'buy' | 'rent' | 'consultation' | 'category') => void;
  categoryId?: string;
  onSelectProperty?: (id: number, source: 'rent' | 'buy') => void;
}

export function CategoryPropertiesPage({ onNavigate, categoryId, onSelectProperty }: CategoryPropertiesPageProps) {
  const { formatPrice } = useCurrency();
  const [showMap, setShowMap] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [sizeMin, setSizeMin] = useState<string>('');
  const [sizeMax, setSizeMax] = useState<string>('');
  const [stationFilter, setStationFilter] = useState<string>('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('');
  const [listingTypeFilter, setListingTypeFilter] = useState<'rent' | 'buy' | ''>('');
  const [petFriendly, setPetFriendly] = useState<boolean>(false);
  const [foreignFriendly, setForeignFriendly] = useState<boolean>(false);
  const [elevator, setElevator] = useState<boolean>(false);
  const [balcony, setBalcony] = useState<boolean>(false);
  const [luxury, setLuxury] = useState<boolean>(false);
  const [furnished, setFurnished] = useState<boolean>(false);
  const [highRiseResidence, setHighRiseResidence] = useState<boolean>(false);
  const [noKeyMoney, setNoKeyMoney] = useState<boolean>(false);
  const [forStudents, setForStudents] = useState<boolean>(false);
  const [designers, setDesigners] = useState<boolean>(false);
  const [forFamilies, setForFamilies] = useState<boolean>(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState<boolean>(false);
  const [filterBarOpen, setFilterBarOpen] = useState<boolean>(true);
  const [sidebarWidth, setSidebarWidth] = useState<number>(384);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<SortOption>('popularity');

  // サイドバー幅を35%に初期化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSidebarWidth(window.innerWidth * 0.35);
    }
  }, []);

  // URLパラメータまたはpropsからカテゴリーを読み取って、該当フィルターをチェック
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryIdFromUrl = params.get('category');
    const categoryIdToUse = categoryId || categoryIdFromUrl;
    
    if (categoryIdToUse) {
      // カテゴリーIDをフィルターのstateにマッピング
      switch (categoryIdToUse) {
        case 'luxury':
          setLuxury(true);
          break;
        case 'pet-friendly':
          setPetFriendly(true);
          break;
        case 'furnished':
          setFurnished(true);
          break;
        case 'top-floor':
          setHighRiseResidence(true);
          break;
        case 'no-key-money':
          setNoKeyMoney(true);
          break;
        case 'for-students':
          setForStudents(true);
          break;
        case 'designers':
          setDesigners(true);
          break;
        case 'for-families':
          setForFamilies(true);
          break;
      }
    }
  }, [categoryId]);

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      setError(null);
      
      try {
        // 賃貸と売買の両方を取得
        const { data: raw, error: err } = await supabase.from('properties').select('*');
        const data = Array.isArray(raw) ? raw : [];
        
        if (err) {
          setError(err.message);
          setAllProperties([]);
        } else {
          const properties = (data ?? []).map((row) => mapSupabaseRowToProperty(row as SupabasePropertyRow));
          
          // カテゴリーに応じたフィルタリング
          let filtered = properties;
          if (categoryId) {
            filtered = properties.filter((property) => {
              const prop = property as any;
              const titleLower = (prop.title || '').toLowerCase();
              
              switch (categoryId) {
                case 'luxury':
                  return prop.isFeatured === true;
                case 'pet-friendly':
                  return prop.petFriendly === true;
                case 'furnished':
                  return titleLower.includes('furnished') || titleLower.includes('家具付き');
                case 'top-floor':
                  return prop.floor && prop.floor >= 5;
                case 'no-key-money':
                  return !prop.keyMoney || prop.keyMoney === 0;
                case 'for-students':
                  return titleLower.includes('student') || titleLower.includes('学生');
                case 'designers':
                  return titleLower.includes('design') || titleLower.includes('デザイナー');
                case 'for-families':
                  return titleLower.includes('family') || titleLower.includes('家族') || (prop.beds && prop.beds >= 2);
                default:
                  return true;
              }
            });
          }
          
          setAllProperties(filtered);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch properties');
        setAllProperties([]);
      }
      setLoading(false);
    }
    fetchProperties();
  }, [categoryId]);

  // フィルター適用
  const properties = allProperties.filter((property) => {
    // 物件タイプフィルター（rent/buy）
    if (listingTypeFilter) {
      if (property.type !== listingTypeFilter) return false;
    }

    // エリアフィルター
    if (selectedAreas.size > 0) {
      const matchesArea = Array.from(selectedAreas).some(area => 
        addressMatchesWard(property.address, area)
      );
      if (!matchesArea) return false;
    }

    // キーワード検索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesKeyword = 
        property.title.toLowerCase().includes(query) ||
        property.address.toLowerCase().includes(query) ||
        (property.station && property.station.toLowerCase().includes(query));
      if (!matchesKeyword) return false;
    }

    // 価格フィルター
    if (priceMin) {
      const min = parseFloat(priceMin);
      if (!isNaN(min) && property.price < min) return false;
    }
    if (priceMax) {
      const max = parseFloat(priceMax);
      if (!isNaN(max) && property.price > max) return false;
    }

    // ベッドルームフィルター
    if (bedrooms) {
      const beds = parseInt(bedrooms);
      if (!isNaN(beds) && property.beds !== beds) return false;
    }

    // サイズフィルター
    if (sizeMin) {
      const min = parseFloat(sizeMin);
      if (!isNaN(min) && property.size < min) return false;
    }
    if (sizeMax) {
      const max = parseFloat(sizeMax);
      if (!isNaN(max) && property.size > max) return false;
    }

    // 駅フィルター
    if (stationFilter) {
      if (!property.station || !property.station.toLowerCase().includes(stationFilter.toLowerCase())) {
        return false;
      }
    }

    // 物件タイプフィルター
    if (propertyTypeFilter) {
      const titleLower = property.title.toLowerCase();
      const typeLower = propertyTypeFilter.toLowerCase();
      if (typeLower === 'apartment' && !titleLower.includes('apartment') && !titleLower.includes('アパート')) return false;
      if (typeLower === 'condominium' && !titleLower.includes('condominium') && !titleLower.includes('マンション')) return false;
      if (typeLower === 'house' && !titleLower.includes('house') && !titleLower.includes('一戸建て')) return false;
      if (typeLower === 'studio' && !titleLower.includes('studio') && !titleLower.includes('スタジオ')) return false;
    }

    // その他のフィルター
    if (petFriendly && property.petFriendly !== true) return false;
    if (foreignFriendly && property.foreignFriendly !== true) return false;
    if (elevator && property.elevator !== true) return false;
    if (balcony && property.balcony !== true) return false;

    // カテゴリーフィルター
    if (luxury && property.isFeatured !== true) return false;
    if (furnished) {
      const titleLower = property.title.toLowerCase();
      if (!titleLower.includes('furnished') && !titleLower.includes('家具付き')) return false;
    }
    if (highRiseResidence && (!property.floor || property.floor < 5)) return false;
    if (noKeyMoney && property.keyMoney && property.keyMoney !== 0) return false;
    if (forStudents) {
      const titleLower = property.title.toLowerCase();
      if (!titleLower.includes('student') && !titleLower.includes('学生')) return false;
    }
    if (designers) {
      const titleLower = property.title.toLowerCase();
      if (!titleLower.includes('design') && !titleLower.includes('デザイナー')) return false;
    }
    if (forFamilies) {
      const titleLower = property.title.toLowerCase();
      if (!titleLower.includes('family') && !titleLower.includes('家族') && (!property.beds || property.beds < 2)) return false;
    }

    return true;
  });

  // ソート適用
  const sortedProperties = sortProperties(properties, sortOption);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // サイドバーリサイズ処理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      // 最小幅320px、最大幅800px
      if (newWidth >= 320 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleSelectProperty = (id: number) => {
    const property = sortedProperties.find(p => p.id === id);
    if (property) {
      onSelectProperty?.(id, property.type);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="home" />
      
      {/* Sticky Filter Bar */}
      <div className="sticky top-20 z-40 bg-white border-b border-gray-200 shadow-sm" style={{ marginTop: '80px' }}>
        <div className="max-w-[1600px] mx-auto px-6">
          {/* Filter Bar Toggle Button */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center gap-4">
              {/* Show Map Toggle Switch */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Show map</span>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:ring-offset-2 ${
                    showMap ? 'bg-[#C1121F]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showMap ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={() => setFilterBarOpen(!filterBarOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {filterBarOpen ? (
                  <>
                    <span>Hide</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Show</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Filter Options */}
          {filterBarOpen && (
            <div className="py-4">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Listing Type Filter (Rent/Buy) */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Listing Type:</label>
                  <select
                    value={listingTypeFilter}
                    onChange={(e) => setListingTypeFilter(e.target.value as 'rent' | 'buy' | '')}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="rent">Rent</option>
                    <option value="buy">Buy</option>
                  </select>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:border-gray-300 transition-colors">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-40"
                  />
                </div>

                {/* Selected Area */}
                <SelectedAreaFilter
                  selectedAreas={selectedAreas}
                  onChange={setSelectedAreas}
                />

                {/* Property Type */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Building Type:</label>
                  <select
                    value={propertyTypeFilter}
                    onChange={(e) => setPropertyTypeFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="apartment">Apartment</option>
                    <option value="condominium">Condominium</option>
                    <option value="house">House</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Price:</label>
                  <input
                    type="number"
                    placeholder="Min ¥"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 w-24 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max ¥"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 w-24 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
                  />
                </div>

                {/* Bedrooms */}
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
                >
                  <option value="">Bedrooms</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>

                {/* Size Range */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Size:</label>
                  <input
                    type="number"
                    placeholder="Min m²"
                    value={sizeMin}
                    onChange={(e) => setSizeMin(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 w-20 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max m²"
                    value={sizeMax}
                    onChange={(e) => setSizeMax(e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 w-20 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
                  />
                </div>

                {/* Station */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:border-gray-300 transition-colors">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Station..."
                    value={stationFilter}
                    onChange={(e) => setStationFilter(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-32"
                  />
                </div>

                {/* More Filters Button */}
                <div className="relative">
                  <button
                    onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors flex items-center gap-2"
                  >
                    <span>More</span>
                    {moreFiltersOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {moreFiltersOpen && (
                    <div className="absolute z-10 top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-3 min-w-[200px]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={petFriendly}
                          onChange={(e) => setPetFriendly(e.target.checked)}
                          className="w-4 h-4 text-[#C1121F] border-gray-300 rounded focus:ring-[#C1121F]"
                        />
                        <span className="text-sm text-gray-700">Pet Friendly</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={foreignFriendly}
                          onChange={(e) => setForeignFriendly(e.target.checked)}
                          className="w-4 h-4 text-[#C1121F] border-gray-300 rounded focus:ring-[#C1121F]"
                        />
                        <span className="text-sm text-gray-700">Foreign Friendly</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={elevator}
                          onChange={(e) => setElevator(e.target.checked)}
                          className="w-4 h-4 text-[#C1121F] border-gray-300 rounded focus:ring-[#C1121F]"
                        />
                        <span className="text-sm text-gray-700">Elevator</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={balcony}
                          onChange={(e) => setBalcony(e.target.checked)}
                          className="w-4 h-4 text-[#C1121F] border-gray-300 rounded focus:ring-[#C1121F]"
                        />
                        <span className="text-sm text-gray-700">Balcony</span>
                      </label>

                      {/* Categories Section */}
                      <div className="pt-3 border-t border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Categories</h4>
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={luxury}
                              onChange={(e) => setLuxury(e.target.checked)}
                              className="w-4 h-4 text-[#C1121F] border-gray-300 rounded focus:ring-[#C1121F]"
                            />
                            <span className="text-sm font-medium text-gray-700">Luxury</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={furnished}
                              onChange={(e) => setFurnished(e.target.checked)}
                              className="w-4 h-4 text-[#C1121F] border-gray-300 rounded focus:ring-[#C1121F]"
                            />
                            <span className="text-sm font-medium text-gray-700">Furnished</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={highRiseResidence}
                              onChange={(e) => setHighRiseResidence(e.target.checked)}
                              className="w-4 h-4 text-[#C1121F] border-gray-300 rounded focus:ring-[#C1121F]"
                            />
                            <span className="text-sm font-medium text-gray-700">High-Rise Residence</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={noKeyMoney}
                              onChange={(e) => setNoKeyMoney(e.target.checked)}
                              className="w-4 h-4 text-[#C1121F] border-gray-300 rounded focus:ring-[#C1121F]"
                            />
                            <span className="text-sm font-medium text-gray-700">No key money</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={forStudents}
                              onChange={(e) => setForStudents(e.target.checked)}
                              className="w-4 h-4 text-[#C1121F] border-gray-300 rounded focus:ring-[#C1121F]"
                            />
                            <span className="text-sm font-medium text-gray-700">For students</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={designers}
                              onChange={(e) => setDesigners(e.target.checked)}
                              className="w-4 h-4 text-[#C1121F] border-gray-300 rounded focus:ring-[#C1121F]"
                            />
                            <span className="text-sm font-medium text-gray-700">Designers</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={forFamilies}
                              onChange={(e) => setForFamilies(e.target.checked)}
                              className="w-4 h-4 text-[#C1121F] border-gray-300 rounded focus:ring-[#C1121F]"
                            />
                            <span className="text-sm font-medium text-gray-700">For families</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sort */}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Sidebar + Map */}
      <div className="flex relative" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Left Sidebar - Property Listings */}
        <div
          className="bg-white border-r border-gray-200 overflow-y-auto relative"
          style={{ width: `${sidebarWidth}px`, minWidth: '320px', maxWidth: '800px' }}
        >
          {/* Resize Handle */}
          <div
            className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-[#C1121F] transition-colors z-10"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizing(true);
            }}
            style={{ marginRight: '-2px' }}
          />

          <div className="p-6">
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              {sortedProperties.length} properties found
            </div>

            {/* Property Listings */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : !showMap ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectProperty?.(property.id, property.type)}
                    onKeyDown={(e) => e.key === 'Enter' && onSelectProperty?.(property.id, property.type)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
                    whileHover={{ y: -2 }}
                  >
                    {/* Image */}
                    <div className="relative h-52 w-full overflow-hidden">
                      <ImageWithFallback
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="absolute top-2 left-2 flex gap-2 z-10 items-center">
                        <span className={`px-3 py-1.5 bg-white text-xs font-bold rounded-full shadow-lg ${
                          property.type === 'rent' 
                            ? 'text-blue-600 border-2 border-blue-600' 
                            : 'text-green-600 border-2 border-green-600'
                        }`}>
                          {property.type === 'rent' ? 'RENT' : 'BUY'}
                        </span>
                        {property.isFeatured && (
                          <span className="px-3 py-1.5 bg-[#C1121F] text-white text-xs font-bold rounded-full shadow-lg">
                            POPULAR
                          </span>
                        )}
                        {property.isNew && (
                          <span className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-full shadow-lg">
                            New
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(property.id);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-10"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            favorites.has(property.id)
                              ? 'fill-[#C1121F] text-[#C1121F]'
                              : 'text-gray-700'
                          }`}
                        />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className={`text-base font-bold text-white mb-1 line-clamp-1 ${property.isFeatured ? 'pt-10' : ''}`}>
                          {property.title}
                        </h3>
                        <p className="text-white/80 text-xs mb-2 line-clamp-1">
                          {property.address}
                        </p>
                        <div className="text-xl font-bold text-white mb-2">
                          {formatPrice(property.price, property.type)}
                        </div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <div className="flex items-center gap-1 text-white/90">
                            <Bed className="w-3 h-3" />
                            <span className="text-xs font-medium">{property.beds}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white/90">
                            <Maximize2 className="w-3 h-3" />
                            <span className="text-xs font-medium">{property.size} m²</span>
                          </div>
                          <div className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                            <span className="text-xs font-medium text-white">{property.layout}</span>
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                          <StationLineLogo stationName={property.station} size={12} className="flex-shrink-0" />
                          <MapPin className="w-3 h-3 text-white flex-shrink-0" />
                          <span className="text-xs font-medium text-white">
                            {property.station} • {property.walkingMinutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectProperty?.(property.id, property.type)}
                    onKeyDown={(e) => e.key === 'Enter' && onSelectProperty?.(property.id, property.type)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
                    whileHover={{ y: -2 }}
                  >
                    <div className="relative h-52 w-full overflow-hidden">
                      <ImageWithFallback
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="absolute top-2 left-2 flex gap-2 z-10 items-center">
                        <span className={`px-3 py-1.5 bg-white text-xs font-bold rounded-full shadow-lg ${
                          property.type === 'rent' 
                            ? 'text-blue-600 border-2 border-blue-600' 
                            : 'text-green-600 border-2 border-green-600'
                        }`}>
                          {property.type === 'rent' ? 'RENT' : 'BUY'}
                        </span>
                        {property.isFeatured && (
                          <span className="px-3 py-1.5 bg-[#C1121F] text-white text-xs font-bold rounded-full shadow-lg">
                            POPULAR
                          </span>
                        )}
                        {property.isNew && (
                          <span className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-full shadow-lg">
                            New
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(property.id);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-10"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            favorites.has(property.id)
                              ? 'fill-[#C1121F] text-[#C1121F]'
                              : 'text-gray-700'
                          }`}
                        />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className={`text-base font-bold text-white mb-1 line-clamp-1 ${property.isFeatured ? 'pt-10' : ''}`}>
                          {property.title}
                        </h3>
                        <p className="text-white/80 text-xs mb-2 line-clamp-1">
                          {property.address}
                        </p>
                        <div className="text-xl font-bold text-white mb-2">
                          {formatPrice(property.price, property.type)}
                        </div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <div className="flex items-center gap-1 text-white/90">
                            <Bed className="w-3 h-3" />
                            <span className="text-xs font-medium">{property.beds}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white/90">
                            <Maximize2 className="w-3 h-3" />
                            <span className="text-xs font-medium">{property.size} m²</span>
                          </div>
                          <div className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                            <span className="text-xs font-medium text-white">{property.layout}</span>
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                          <StationLineLogo stationName={property.station} size={12} className="flex-shrink-0" />
                          <MapPin className="w-3 h-3 text-white flex-shrink-0" />
                          <span className="text-xs font-medium text-white">
                            {property.station} • {property.walkingMinutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map View */}
        {showMap && (
          <div className="flex-1 relative">
            <PropertiesMapView
              properties={sortedProperties}
              onPropertyClick={(propertyId) => {
                const property = sortedProperties.find(p => p.id === propertyId);
                if (property) {
                  onSelectProperty?.(propertyId, property.type);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
