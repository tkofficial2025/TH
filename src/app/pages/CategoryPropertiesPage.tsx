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
import { type Property, type SupabasePropertyRow, mapSupabaseRowToProperty, getPropertyGalleryOrderedUrls } from '@/lib/properties';
import { useCurrency } from '@/app/contexts/CurrencyContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { getStationDisplay } from '@/lib/stationNames';
import { sortProperties, sortOptions, type SortOption } from '@/lib/sortProperties';
import { fetchTranslationsForProperties, type PropertyTranslationResult } from '@/lib/translate-property';
import { getListingAddressLineMatchingMap } from '@/lib/listingMapDisplay';
import { matchesForStudentsCategory } from '@/lib/forStudentsCategory';
import { matchesBedroomsFilter, matchesPropertyTypeFilter } from '@/lib/propertyTypeFilterMatch';

const SORT_LABEL_KEYS: Record<SortOption, string> = {
  'popularity': 'sort.popularity',
  'price-asc': 'sort.price_asc',
  'price-desc': 'sort.price_desc',
  'size-asc': 'sort.size_asc',
  'size-desc': 'sort.size_desc',
  'walking-asc': 'sort.walking_asc',
  'walking-desc': 'sort.walking_desc',
  'newest': 'sort.newest',
  'oldest': 'sort.oldest',
};

interface CategoryPropertiesPageProps {
  onNavigate?: (page: 'home' | 'buy' | 'rent' | 'consultation' | 'category') => void;
  categoryId?: string;
  onSelectProperty?: (id: number, source: 'rent' | 'buy') => void;
}

export function CategoryPropertiesPage({ onNavigate, categoryId, onSelectProperty }: CategoryPropertiesPageProps) {
  const { formatPrice } = useCurrency();
  const { t, language } = useLanguage();
  // デスクトップは地図表示ON、モバイルはOFF。言語切り替えで再マウントされても sessionStorage で復元
  const SHOW_MAP_KEY = 'category-listing-showMap';
  const [showMap, setShowMapState] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = sessionStorage.getItem(SHOW_MAP_KEY);
    if (stored !== null) return stored === '1';
    return window.innerWidth >= 768;
  });
  const setShowMap = (value: boolean | ((prev: boolean) => boolean)) => {
    setShowMapState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      try { sessionStorage.setItem(SHOW_MAP_KEY, next ? '1' : '0'); } catch {}
      return next;
    });
  };
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
  const [filterBarOpen, setFilterBarOpen] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(384);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<SortOption>('popularity');
  const [translationMap, setTranslationMap] = useState<Map<number, PropertyTranslationResult>>(new Map());

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
    
    if (categoryIdToUse && categoryIdToUse !== 'featured') {
      // カテゴリーIDをフィルターのstateにマッピング（featured のときは何も選択しない）
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
                case 'featured':
                  return prop.isFeatured === true;
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
                  return matchesForStudentsCategory(property);
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
    if (!matchesBedroomsFilter(property, bedrooms)) return false;

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
    if (propertyTypeFilter && !matchesPropertyTypeFilter(property, propertyTypeFilter)) return false;

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
    if (forStudents && !matchesForStudentsCategory(property)) return false;
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
  const sortedIdsKey = sortedProperties.map((p) => p.id).sort((a, b) => a - b).join(',');
  useEffect(() => {
    if (language !== 'zh' || sortedProperties.length === 0) {
      setTranslationMap(new Map());
      return;
    }
    let cancelled = false;
    fetchTranslationsForProperties(sortedProperties, language).then((map) => {
      if (!cancelled) setTranslationMap(map);
    });
    return () => { cancelled = true; };
  }, [language, sortedIdsKey]);

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
    <div className="min-h-screen bg-gray-50 w-full min-w-0 overflow-x-hidden">
      <Header onNavigate={onNavigate} currentPage="home" />
      
      {/* Sticky Filter Bar */}
      <div className="sticky top-20 z-40 w-full min-w-0 max-w-full overflow-x-hidden bg-white border-b border-gray-200 shadow-sm" style={{ marginTop: '80px' }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 min-w-0">
          {/* Filter Bar Toggle Button */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">{t('filter.title')}</h2>
            <div className="flex items-center gap-4">
              {/* Show Map Toggle Switch */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{t('filter.show_map')}</span>
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
                    <span>{t('filter.hide')}</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>{t('filter.show')}</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Filter Options - 展開時のみ表示（Rent/Buy と同系のグリッド＋ラベル） */}
          {filterBarOpen && (
            <div className="border-t border-gray-100 py-4 min-w-0 md:border-t-0">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end lg:gap-x-3 lg:gap-y-3">
                <div className="flex min-w-0 flex-col gap-1.5 lg:w-40">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {t('filter.listing_type').replace(/:\s*$/, '')}
                  </span>
                  <select
                    value={listingTypeFilter}
                    onChange={(e) => setListingTypeFilter(e.target.value as 'rent' | 'buy' | '')}
                    className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-[#C1121F] focus:ring-2 focus:ring-[#C1121F]/25"
                  >
                    <option value="">{t('filter.all')}</option>
                    <option value="rent">{t('search.rent')}</option>
                    <option value="buy">{t('search.buy')}</option>
                  </select>
                </div>

                <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2 lg:max-w-md lg:flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('filter.search')}</span>
                  <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                    <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('filter.keyword_placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="min-w-0 flex-1 border-0 bg-transparent text-sm text-gray-800 outline-none focus:ring-0 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex min-w-0 flex-col gap-1.5 lg:w-44">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('filter.property_type')}</span>
                  <select
                    value={propertyTypeFilter}
                    onChange={(e) => setPropertyTypeFilter(e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-[#C1121F] focus:ring-2 focus:ring-[#C1121F]/25"
                  >
                    <option value="">{t('filter.all')}</option>
                    <option value="mansion_apartment">{t('filter.type.mansion_apartment')}</option>
                    <option value="house">{t('filter.type.house')}</option>
                    <option value="studio">{t('filter.type.studio')}</option>
                  </select>
                </div>

                <div className="min-w-0 sm:col-span-2 lg:flex-1 lg:min-w-[200px]">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 lg:sr-only">{t('filter.selected_area')}</span>
                  <SelectedAreaFilter selectedAreas={selectedAreas} onChange={setSelectedAreas} compact />
                </div>

                <div className="flex min-w-0 flex-col gap-1.5 lg:min-w-[160px] lg:flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('filter.station')}</span>
                  <div className="flex min-h-[44px] items-center rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                    <input
                      type="text"
                      placeholder={t('filter.station_placeholder')}
                      value={stationFilter}
                      onChange={(e) => setStationFilter(e.target.value)}
                      className="min-w-0 flex-1 border-0 bg-transparent text-sm text-gray-800 outline-none focus:ring-0 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex min-w-0 flex-col gap-1.5 lg:w-48">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('filter.bedrooms')}</span>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-[#C1121F] focus:ring-2 focus:ring-[#C1121F]/25"
                  >
                    <option value="">{t('filter.bedrooms.any')}</option>
                    <option value="1">{t('filter.bedrooms.opt1')}</option>
                    <option value="2">{t('filter.bedrooms.opt2')}</option>
                    <option value="3">{t('filter.bedrooms.opt3')}</option>
                    <option value="4">{t('filter.bedrooms.opt4')}</option>
                  </select>
                </div>

                <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2 lg:max-w-md">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {listingTypeFilter === 'rent' ? t('listing.monthly_rent_label') : t('filter.price_range')}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                    <input
                      type="text"
                      placeholder={t('filter.min_yen')}
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="min-w-[6rem] flex-1 rounded-lg border border-gray-100 bg-gray-50/80 px-2 py-2 text-sm text-gray-800 outline-none focus:border-[#C1121F] focus:ring-1 focus:ring-[#C1121F]/30"
                    />
                    <span className="text-gray-300">—</span>
                    <input
                      type="text"
                      placeholder={t('filter.max_yen')}
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="min-w-[6rem] flex-1 rounded-lg border border-gray-100 bg-gray-50/80 px-2 py-2 text-sm text-gray-800 outline-none focus:border-[#C1121F] focus:ring-1 focus:ring-[#C1121F]/30"
                    />
                  </div>
                </div>

                <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2 lg:max-w-md">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('filter.size')}</span>
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                    <input
                      type="number"
                      placeholder={t('filter.min_sqm')}
                      value={sizeMin}
                      onChange={(e) => setSizeMin(e.target.value)}
                      className="min-w-[5rem] flex-1 rounded-lg border border-gray-100 bg-gray-50/80 px-2 py-2 text-sm text-gray-800 outline-none focus:border-[#C1121F] focus:ring-1 focus:ring-[#C1121F]/30"
                    />
                    <span className="text-gray-300">—</span>
                    <input
                      type="number"
                      placeholder={t('filter.max_sqm')}
                      value={sizeMax}
                      onChange={(e) => setSizeMax(e.target.value)}
                      className="min-w-[5rem] flex-1 rounded-lg border border-gray-100 bg-gray-50/80 px-2 py-2 text-sm text-gray-800 outline-none focus:border-[#C1121F] focus:ring-1 focus:ring-[#C1121F]/30"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2 lg:ml-auto lg:flex-row lg:flex-wrap lg:items-end lg:gap-3">
                  <div className="flex min-w-0 flex-col gap-1.5 lg:w-52">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('sort.label')}</span>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition focus:border-[#C1121F] focus:ring-2 focus:ring-[#C1121F]/25"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {t(SORT_LABEL_KEYS[option.value])}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative w-full lg:w-auto">
                    <button
                      type="button"
                      onClick={() => setMoreFiltersOpen(!moreFiltersOpen)}
                      className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#C1121F]/30 lg:min-w-[140px] ${
                        moreFiltersOpen
                          ? 'border-[#C1121F] bg-[#C1121F]/5 text-[#C1121F]'
                          : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                      }`}
                    >
                      <SlidersHorizontal className="h-4 w-4 flex-shrink-0" />
                      {t('filter.more_filters')}
                    </button>

                    {moreFiltersOpen && (
                      <div className="absolute left-0 right-0 z-[60] mt-2 max-h-[min(70vh,22rem)] w-full overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white p-4 shadow-xl sm:left-auto sm:right-auto sm:w-80 lg:max-h-[min(80vh,28rem)]">
                        <div className="mb-3 flex shrink-0 items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">{t('filter.more_filters')}</h3>
                          <button
                            type="button"
                            onClick={() => setMoreFiltersOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={petFriendly}
                              onChange={(e) => setPetFriendly(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                            />
                            <span className="text-sm font-medium text-gray-700">{t('category.pet_friendly')}</span>
                          </label>
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={foreignFriendly}
                              onChange={(e) => setForeignFriendly(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                            />
                            <span className="text-sm font-medium text-gray-700">{t('category.foreign_friendly')}</span>
                          </label>
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={elevator}
                              onChange={(e) => setElevator(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                            />
                            <span className="text-sm font-medium text-gray-700">{t('property.feature.elevator')}</span>
                          </label>
                          <label className="flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={balcony}
                              onChange={(e) => setBalcony(e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                            />
                            <span className="text-sm font-medium text-gray-700">{t('property.feature.balcony')}</span>
                          </label>
                        </div>

                        <div className="mt-3 border-t border-gray-200 pt-3">
                          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('filter.categories')}</h4>
                          <div className="space-y-3">
                            <label className="flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={luxury}
                                onChange={(e) => setLuxury(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                              />
                              <span className="text-sm font-medium text-gray-700">{t('category.luxury')}</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={furnished}
                                onChange={(e) => setFurnished(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                              />
                              <span className="text-sm font-medium text-gray-700">{t('category.furnished')}</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={highRiseResidence}
                                onChange={(e) => setHighRiseResidence(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                              />
                              <span className="text-sm font-medium text-gray-700">{t('category.high_rise')}</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={noKeyMoney}
                                onChange={(e) => setNoKeyMoney(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                              />
                              <span className="text-sm font-medium text-gray-700">{t('category.no_key_money')}</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={forStudents}
                                onChange={(e) => setForStudents(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                              />
                              <span className="text-sm font-medium text-gray-700">{t('category.students')}</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={designers}
                                onChange={(e) => setDesigners(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                              />
                              <span className="text-sm font-medium text-gray-700">{t('category.designers')}</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                checked={forFamilies}
                                onChange={(e) => setForFamilies(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                              />
                              <span className="text-sm font-medium text-gray-700">{t('category.families')}</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="flex min-h-[44px] w-full shrink-0 items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 lg:w-auto"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    {t('filter.save')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Sidebar + Map */}
      <div className="flex relative w-full min-w-0 overflow-x-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Left Sidebar - Property Listings（モバイルで showMap 時は非表示＝地図のみ表示） */}
        <div
          className={`bg-white border-r border-gray-200 overflow-y-auto overflow-x-hidden relative min-w-0 ${showMap ? 'hidden md:block' : ''}`}
          style={showMap ? { width: `${sidebarWidth}px`, minWidth: '320px', maxWidth: '800px' } : { width: '100%', minWidth: 0 }}
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
              {t('listing.properties_found').replace('{count}', String(sortedProperties.length))}
            </div>

            {/* Property Listings */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">{t('property.loading')}</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : !showMap ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedProperties.map((property, index) => {
                  const displayTitle = language === 'zh' ? (translationMap.get(property.id)?.title_zh ?? property.title) : property.title;
                  const displayAddress = getListingAddressLineMatchingMap(property, language, translationMap);
                  return (
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
                    {/* Image - モバイル: メイン大・その他小 / PC: 単一 */}
                    {(() => {
                      const allImages = getPropertyGalleryOrderedUrls(property);
                      const mainImage = allImages[0] ?? property.image;
                      const photoCount = allImages.length;
                      const typeBadge = (
                        <span className={`px-3 py-1.5 bg-white text-xs font-bold rounded-full shadow-lg ${
                          property.type === 'rent' ? 'text-blue-600 border-2 border-blue-600' : 'text-green-600 border-2 border-green-600'
                        }`}>
                          {property.type === 'rent' ? t('search.rent').toUpperCase() : t('search.buy').toUpperCase()}
                        </span>
                      );
                      return (
                        <>
                          <div className="md:hidden">
                            <div className="relative h-64 w-full overflow-hidden">
                              <ImageWithFallback src={mainImage} alt={displayTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                              <div className="absolute top-2 left-2 flex gap-2 z-10 items-center">
                                {typeBadge}
                                {property.isFeatured && <span className="px-3 py-1.5 bg-[#C1121F] text-white text-xs font-bold rounded-full shadow-lg">{t('listing.badge.popular')}</span>}
                                {property.isNew && <span className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-full shadow-lg">{t('listing.badge.new')}</span>}
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }} className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-10">
                                <Heart className={`w-4 h-4 ${favorites.has(property.id) ? 'fill-[#C1121F] text-[#C1121F]' : 'text-gray-700'}`} />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h3 className={`text-base font-bold text-white mb-1 line-clamp-1 ${property.isFeatured ? 'pt-10' : ''}`}>{displayTitle}</h3>
                                <p className="text-white/80 text-xs mb-2 line-clamp-1">{displayAddress}</p>
                                <div className="text-xl font-bold text-white mb-2">{formatPrice(property.price, property.type)}</div>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <div className="flex items-center gap-1 text-white/90"><Bed className="w-3 h-3" /><span className="text-xs font-medium">{property.beds}</span></div>
                                  <div className="flex items-center gap-1 text-white/90"><Maximize2 className="w-3 h-3" /><span className="text-xs font-medium">{property.size} m²</span></div>
                                  <div className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full"><span className="text-xs font-medium text-white">{property.layout}</span></div>
                                </div>
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                                  <StationLineLogo stationName={property.station} size={12} className="flex-shrink-0" />
                                  <MapPin className="w-3 h-3 text-white flex-shrink-0" />
                                  <span className="text-xs font-medium text-white">{getStationDisplay(property.station, language)} • {property.walkingMinutes} {t('property.walk.min')}</span>
                                </div>
                              </div>
                            </div>
                            {photoCount > 1 && (
                              <div className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
                                +{photoCount - 1}
                              </div>
                            )}
                          </div>
                          <div className="hidden md:block relative h-52 w-full overflow-hidden">
                            <ImageWithFallback src={mainImage} alt={displayTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                            <div className="absolute top-2 left-2 flex gap-2 z-10 items-center">
                              {typeBadge}
                              {property.isFeatured && <span className="px-3 py-1.5 bg-[#C1121F] text-white text-xs font-bold rounded-full shadow-lg">{t('listing.badge.popular')}</span>}
                              {property.isNew && <span className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-full shadow-lg">{t('listing.badge.new')}</span>}
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }} className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-10">
                              <Heart className={`w-4 h-4 ${favorites.has(property.id) ? 'fill-[#C1121F] text-[#C1121F]' : 'text-gray-700'}`} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h3 className={`text-base font-bold text-white mb-1 line-clamp-1 ${property.isFeatured ? 'pt-10' : ''}`}>{displayTitle}</h3>
                              <p className="text-white/80 text-xs mb-2 line-clamp-1">{displayAddress}</p>
                              <div className="text-xl font-bold text-white mb-2">{formatPrice(property.price, property.type)}</div>
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <div className="flex items-center gap-1 text-white/90"><Bed className="w-3 h-3" /><span className="text-xs font-medium">{property.beds}</span></div>
                                <div className="flex items-center gap-1 text-white/90"><Maximize2 className="w-3 h-3" /><span className="text-xs font-medium">{property.size} m²</span></div>
                                <div className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full"><span className="text-xs font-medium text-white">{property.layout}</span></div>
                              </div>
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                                <StationLineLogo stationName={property.station} size={12} className="flex-shrink-0" />
                                <MapPin className="w-3 h-3 text-white flex-shrink-0" />
                                <span className="text-xs font-medium text-white">{getStationDisplay(property.station, language)} • {property.walkingMinutes} {t('property.walk.min')}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                ); })}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProperties.map((property, index) => {
                  const displayTitle = language === 'zh' ? (translationMap.get(property.id)?.title_zh ?? property.title) : property.title;
                  const displayAddress = getListingAddressLineMatchingMap(property, language, translationMap);
                  return (
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
                    {(() => {
                      const allImages = getPropertyGalleryOrderedUrls(property);
                      const mainImage = allImages[0] ?? property.image;
                      const photoCount = allImages.length;
                      const typeBadge = (
                        <span className={`px-3 py-1.5 bg-white text-xs font-bold rounded-full shadow-lg ${
                          property.type === 'rent' ? 'text-blue-600 border-2 border-blue-600' : 'text-green-600 border-2 border-green-600'
                        }`}>
                          {property.type === 'rent' ? t('search.rent').toUpperCase() : t('search.buy').toUpperCase()}
                        </span>
                      );
                      return (
                        <>
                          <div className="md:hidden">
                            <div className="relative h-64 w-full overflow-hidden">
                              <ImageWithFallback src={mainImage} alt={displayTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                              <div className="absolute top-2 left-2 flex gap-2 z-10 items-center">
                                {typeBadge}
                                {property.isFeatured && <span className="px-3 py-1.5 bg-[#C1121F] text-white text-xs font-bold rounded-full shadow-lg">{t('listing.badge.popular')}</span>}
                                {property.isNew && <span className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-full shadow-lg">{t('listing.badge.new')}</span>}
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }} className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-10">
                                <Heart className={`w-4 h-4 ${favorites.has(property.id) ? 'fill-[#C1121F] text-[#C1121F]' : 'text-gray-700'}`} />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h3 className={`text-base font-bold text-white mb-1 line-clamp-1 ${property.isFeatured ? 'pt-10' : ''}`}>{displayTitle}</h3>
                                <p className="text-white/80 text-xs mb-2 line-clamp-1">{displayAddress}</p>
                                <div className="text-xl font-bold text-white mb-2">{formatPrice(property.price, property.type)}</div>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <div className="flex items-center gap-1 text-white/90"><Bed className="w-3 h-3" /><span className="text-xs font-medium">{property.beds}</span></div>
                                  <div className="flex items-center gap-1 text-white/90"><Maximize2 className="w-3 h-3" /><span className="text-xs font-medium">{property.size} m²</span></div>
                                  <div className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full"><span className="text-xs font-medium text-white">{property.layout}</span></div>
                                </div>
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                                  <StationLineLogo stationName={property.station} size={12} className="flex-shrink-0" />
                                  <MapPin className="w-3 h-3 text-white flex-shrink-0" />
                                  <span className="text-xs font-medium text-white">{getStationDisplay(property.station, language)} • {property.walkingMinutes} {t('property.walk.min')}</span>
                                </div>
                              </div>
                            </div>
                            {photoCount > 1 && (
                              <div className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
                                +{photoCount - 1}
                              </div>
                            )}
                          </div>
                          <div className="hidden md:block relative h-52 w-full overflow-hidden">
                            <ImageWithFallback src={mainImage} alt={displayTitle} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                            <div className="absolute top-2 left-2 flex gap-2 z-10 items-center">
                              {typeBadge}
                              {property.isFeatured && <span className="px-3 py-1.5 bg-[#C1121F] text-white text-xs font-bold rounded-full shadow-lg">{t('listing.badge.popular')}</span>}
                              {property.isNew && <span className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded-full shadow-lg">{t('listing.badge.new')}</span>}
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(property.id); }} className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-10">
                              <Heart className={`w-4 h-4 ${favorites.has(property.id) ? 'fill-[#C1121F] text-[#C1121F]' : 'text-gray-700'}`} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h3 className={`text-base font-bold text-white mb-1 line-clamp-1 ${property.isFeatured ? 'pt-10' : ''}`}>{displayTitle}</h3>
                              <p className="text-white/80 text-xs mb-2 line-clamp-1">{displayAddress}</p>
                              <div className="text-xl font-bold text-white mb-2">{formatPrice(property.price, property.type)}</div>
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <div className="flex items-center gap-1 text-white/90"><Bed className="w-3 h-3" /><span className="text-xs font-medium">{property.beds}</span></div>
                                <div className="flex items-center gap-1 text-white/90"><Maximize2 className="w-3 h-3" /><span className="text-xs font-medium">{property.size} m²</span></div>
                                <div className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full"><span className="text-xs font-medium text-white">{property.layout}</span></div>
                              </div>
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                                <StationLineLogo stationName={property.station} size={12} className="flex-shrink-0" />
                                <MapPin className="w-3 h-3 text-white flex-shrink-0" />
                                <span className="text-xs font-medium text-white">{getStationDisplay(property.station, language)} • {property.walkingMinutes} {t('property.walk.min')}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                ); })}
              </div>
            )}
          </div>
        </div>

        {/* Map View */}
        {showMap && (
          <div className="flex-1 relative min-w-0 overflow-hidden">
            <PropertiesMapView
              properties={sortedProperties}
              onPropertyClick={(propertyId) => {
                const property = sortedProperties.find(p => p.id === propertyId);
                if (property) {
                  onSelectProperty?.(propertyId, property.type);
                }
              }}
              onCoordinatesUpdated={(propertyId, lat, lng) => {
                setAllProperties((prev) =>
                  prev.map((p) => (p.id === propertyId ? { ...p, latitude: lat, longitude: lng } : p))
                );
              }}
              translationMap={translationMap}
            />
          </div>
        )}
      </div>
    </div>
  );
}
