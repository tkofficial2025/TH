import { useState, useEffect } from 'react';
import { Header } from '@/app/components/Header';
import { PropertiesMapView } from '@/app/components/PropertiesMapView';
import { supabase } from '@/lib/supabase';
import { type Property, type SupabasePropertyRow, mapSupabaseRowToProperty } from '@/lib/properties';
import { filterPropertiesByAreas, addressMatchesWard } from '@/lib/wards';
import { SelectedAreaFilter } from '@/app/components/SelectedAreaFilter';

interface MapSearchPageProps {
  onNavigate?: (page: 'home' | 'buy' | 'rent') => void;
  selectedWard?: string | null;
  onSelectProperty?: (id: number, source: 'rent' | 'buy') => void;
}

export function MapSearchPage({ onNavigate, selectedWard, onSelectProperty }: MapSearchPageProps) {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const [propertyType, setPropertyType] = useState<'rent' | 'buy' | 'all'>('all');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [sizeMin, setSizeMin] = useState<string>('');
  const [sizeMax, setSizeMax] = useState<string>('');
  const [petFriendly, setPetFriendly] = useState<boolean>(false);
  const [foreignFriendly, setForeignFriendly] = useState<boolean>(false);
  const [elevator, setElevator] = useState<boolean>(false);
  const [balcony, setBalcony] = useState<boolean>(false);

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      setError(null);
      
      let query = supabase.from('properties').select('*');
      
      // 物件タイプでフィルター
      if (propertyType !== 'all') {
        query = query.eq('type', propertyType);
      }
      
      const { data: raw, error: err } = await query;
      const data = Array.isArray(raw) ? raw : [];
      
      if (import.meta.env.DEV) console.log('[MapSearch] Supabase', { data, error: err });
      
      if (err) {
        setError(err.message);
        setAllProperties([]);
      } else {
        setAllProperties((data ?? []).map((row) => mapSupabaseRowToProperty(row as SupabasePropertyRow)));
      }
      setLoading(false);
    }
    
    fetchProperties();
  }, [propertyType]);

  // フィルター適用
  const filteredProperties = allProperties.filter((property) => {
    // エリアフィルター
    if (selectedAreas.size > 0) {
      const matchesArea = Array.from(selectedAreas).some(area => 
        property.address.includes(area)
      );
      if (!matchesArea) return false;
    }
    
    // 区フィルター
    if (selectedWard) {
      if (!addressMatchesWard(property.address, selectedWard)) return false;
    }
    
    // 価格フィルター
    if (priceMin) {
      const min = parseInt(priceMin.replace(/\D/g, ''), 10);
      if (property.price < min) return false;
    }
    if (priceMax) {
      const max = parseInt(priceMax.replace(/\D/g, ''), 10);
      if (property.price > max) return false;
    }
    
    // ベッドルームフィルター
    if (bedrooms) {
      const beds = parseInt(bedrooms, 10);
      if (property.beds !== beds) return false;
    }
    
    // 広さフィルター
    if (sizeMin) {
      const min = parseFloat(sizeMin);
      if (property.size < min) return false;
    }
    if (sizeMax) {
      const max = parseFloat(sizeMax);
      if (property.size > max) return false;
    }
    
    // Pet friendlyフィルター（チェックが入っている場合のみ、trueの物件を表示）
    if (petFriendly && property.petFriendly !== true) return false;
    
    // Foreign friendlyフィルター（チェックが入っている場合のみ、trueの物件を表示）
    if (foreignFriendly && property.foreignFriendly !== true) return false;
    
    // Elevatorフィルター（チェックが入っている場合のみ、trueの物件を表示）
    if (elevator && property.elevator !== true) return false;
    
    // Balconyフィルター（チェックが入っている場合のみ、trueの物件を表示）
    if (balcony && property.balcony !== true) return false;
    
    return true;
  });

  const handleSelectProperty = (id: number) => {
    const property = filteredProperties.find(p => p.id === id);
    if (property) {
      onSelectProperty?.(id, property.type === 'rent' ? 'rent' : 'buy');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} currentPage="rent" />
      
      {/* Main Content - Sidebar + Map */}
      <div className="flex relative" style={{ height: 'calc(100vh - 80px)', marginTop: '80px' }}>
        {/* Left Sidebar - Filters */}
        <div className="w-80 bg-white border-r border-gray-200 shadow-sm overflow-y-auto overflow-x-hidden relative z-10" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="p-6 space-y-6" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => {
                  setPropertyType('all');
                  setSelectedAreas(new Set());
                  setPriceMin('');
                  setPriceMax('');
                  setBedrooms('');
                  setSizeMin('');
                  setSizeMax('');
                  setPetFriendly(false);
                  setForeignFriendly(false);
                  setElevator(false);
                  setBalcony(false);
                }}
                className="text-sm text-[#C1121F] hover:text-[#A00F1A] font-medium"
              >
                Clear all
              </button>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as 'rent' | 'buy' | 'all')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="rent">Rent</option>
                <option value="buy">Buy</option>
              </select>
            </div>

            {/* Selected Area Filter */}
            <div className="w-full overflow-hidden">
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <div className="w-full">
                <SelectedAreaFilter selectedAreas={selectedAreas} onChange={setSelectedAreas} />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
                />
              </div>
            </div>

            {/* Size Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size (m²)</label>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={sizeMin}
                  onChange={(e) => setSizeMin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={sizeMax}
                  onChange={(e) => setSizeMax(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
                />
              </div>
            </div>

            {/* Pet Friendly */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={petFriendly}
                  onChange={(e) => setPetFriendly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                />
                <span className="text-sm font-medium text-gray-700">Pet Friendly</span>
              </label>
            </div>

            {/* Foreign Friendly */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={foreignFriendly}
                  onChange={(e) => setForeignFriendly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                />
                <span className="text-sm font-medium text-gray-700">Foreign Friendly</span>
              </label>
            </div>

            {/* Elevator */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={elevator}
                  onChange={(e) => setElevator(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                />
                <span className="text-sm font-medium text-gray-700">Elevator</span>
              </label>
            </div>

            {/* Balcony */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={balcony}
                  onChange={(e) => setBalcony(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F]"
                />
                <span className="text-sm font-medium text-gray-700">Balcony</span>
              </label>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
              >
                <option value="">All</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{filteredProperties.length}</span> properties found
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Map Container */}
        <div className="flex-1 relative z-0">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <p className="text-gray-500">Loading map...</p>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <p className="text-red-600">Error: {error}</p>
            </div>
          )}
          
          {!loading && !error && (
            <PropertiesMapView
              properties={filteredProperties}
              onPropertyClick={handleSelectProperty}
              height="100%"
              className="w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}
