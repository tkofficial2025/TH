import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { AREA_OPTIONS } from '@/lib/wards';

const AREA_DROPDOWN_MAX_HEIGHT = 380;

interface DropdownOption {
  value: string;
  label: string;
}

const propertyTypes = ['rent', 'buy'] as const;
type PropertyType = typeof propertyTypes[number];

/** Area: 東京23区＋23区外（QuickPropertySearch 用・複数選択） */
const areas: DropdownOption[] = AREA_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }));

const buyBudgets: DropdownOption[] = [
  { value: '0-50m', label: 'Under ¥50M' },
  { value: '50m-80m', label: '¥50M – ¥80M' },
  { value: '80m-120m', label: '¥80M – ¥120M' },
  { value: '120m-200m', label: '¥120M – ¥200M' },
  { value: '200m+', label: 'Over ¥200M' },
];

const rentBudgets: DropdownOption[] = [
  { value: '0-150k', label: 'Under ¥150,000' },
  { value: '150k-250k', label: '¥150,000 – ¥250,000' },
  { value: '250k-400k', label: '¥250,000 – ¥400,000' },
  { value: '400k-600k', label: '¥400,000 – ¥600,000' },
  { value: '600k+', label: 'Over ¥600,000' },
];

const bedrooms: DropdownOption[] = [
  { value: 'studio', label: 'Studio' },
  { value: '1br', label: '1 BR' },
  { value: '2br', label: '2 BR' },
  { value: '3br+', label: '3 BR+' },
  { value: '4br+', label: '4 BR+' },
];

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

function Dropdown({ label, options, value, onChange, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative flex-1 min-w-[140px]" ref={dropdownRef}>
      <button
        type="button"
        className="w-full px-4 py-3 text-left flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors rounded-lg group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-0.5">{label}</div>
          <div className="text-sm text-gray-900 font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </div>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  value === option.value
                    ? 'bg-[#C1121F]/5 text-[#C1121F] font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Area 用: 複数選択・チェックボックス・スクロール可能 */
interface AreaMultiSelectProps {
  selectedAreas: Set<string>;
  onChange: (selected: Set<string>) => void;
}

function AreaMultiSelect({ selectedAreas, onChange }: AreaMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [areaSearch, setAreaSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) setAreaSearch('');
  }, [isOpen]);

  const toggle = (value: string) => {
    const next = new Set(selectedAreas);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange(next);
  };

  const searchLower = areaSearch.trim().toLowerCase();
  const filteredAreas = searchLower
    ? areas.filter((a) => a.label.toLowerCase().includes(searchLower))
    : areas;

  const count = selectedAreas.size;
  const displayText = count === 0 ? 'Select area' : count === 1 ? areas.find((a) => a.value === [...selectedAreas][0])?.label ?? '1 area' : `${count} areas`;

  return (
    <div className="relative flex-1 min-w-[140px]" ref={dropdownRef}>
      <button
        type="button"
        className="w-full px-4 py-3 text-left flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors rounded-lg group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 mb-0.5">Area</div>
          <div className="text-sm text-gray-900 font-medium truncate">{displayText}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50 flex flex-col overflow-hidden"
            style={{ maxHeight: AREA_DROPDOWN_MAX_HEIGHT }}
          >
            <div className="flex-shrink-0 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              Tokyo 23 wards + Outer 23 wards
            </div>
            <div className="flex-shrink-0 p-2 border-b border-gray-100">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={areaSearch}
                  onChange={(e) => setAreaSearch(e.target.value)}
                  placeholder="Search area..."
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-1">
              {filteredAreas.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">No matching area</div>
              ) : (
                filteredAreas.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAreas.has(option.value)}
                      onChange={() => toggle(option.value)}
                      className="w-4 h-4 rounded border-gray-300 text-[#C1121F] focus:ring-[#C1121F] flex-shrink-0"
                    />
                    <span>{option.label}</span>
                  </label>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function QuickPropertySearch() {
  const [propertyType, setPropertyType] = useState<PropertyType>('rent');
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const [budget, setBudget] = useState('');
  const [bedroomCount, setBedroomCount] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced filters
  const [propertySizeMin, setPropertySizeMin] = useState('');
  const [propertySizeMax, setPropertySizeMax] = useState('');
  const [petFriendly, setPetFriendly] = useState(false);
  const [foreignFriendly, setForeignFriendly] = useState(false);

  const budgetOptions = 
    propertyType === 'buy' ? buyBudgets : 
    rentBudgets;

  const budgetLabel = 
    propertyType === 'buy' ? 'Price' :
    'Monthly Rent';

  const handleSearch = () => {
    console.log('Search params:', {
      propertyType,
      selectedAreas: [...selectedAreas],
      budget,
      bedroomCount,
      propertySizeMin: propertySizeMin ? `${propertySizeMin} m²` : undefined,
      propertySizeMax: propertySizeMax ? `${propertySizeMax} m²` : undefined,
      petFriendly,
      foreignFriendly,
    });
    // Handle search logic here
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="w-full max-w-5xl mx-auto"
    >
      {/* Property Type Segmented Control */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-white/95 backdrop-blur-sm rounded-full p-1.5 shadow-lg border border-gray-100">
          {propertyTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                setPropertyType(type);
                setBudget(''); // Reset budget when type changes
              }}
              className="relative px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300"
            >
              {/* Active background */}
              {propertyType === type && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-full shadow-md"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              
              {/* Text */}
              <span className={`relative z-10 transition-colors ${
                propertyType === type 
                  ? 'text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
                {type === 'rent' && 'Rent'}
                {type === 'buy' && 'Buy'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Search Bar（overflow-visible で Selected Area ドロップダウンが切れないように） */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-visible">
        <AnimatePresence mode="wait">
          <motion.div
            key={propertyType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col lg:flex-row items-stretch divide-y lg:divide-y-0 lg:divide-x divide-gray-100"
          >
            <AreaMultiSelect selectedAreas={selectedAreas} onChange={setSelectedAreas} />
            
            <Dropdown
              label="Bedrooms"
              options={bedrooms}
              value={bedroomCount}
              onChange={setBedroomCount}
              placeholder="Any"
            />
            
            <Dropdown
              label={budgetLabel}
              options={budgetOptions}
              value={budget}
              onChange={setBudget}
              placeholder="Any budget"
            />

            <div className="lg:flex-shrink-0">
              <button
                onClick={handleSearch}
                className="w-full lg:w-auto px-8 py-3 lg:py-[18px] bg-[#C1121F] text-white font-semibold rounded-none lg:rounded-r-xl hover:bg-[#A00F1A] transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group"
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="lg:inline">Search</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Advanced Filters Toggle */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#C1121F] transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Advanced filters</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden border-t border-gray-100"
            >
              <div className="p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Size (m²) — 広さの範囲を手動で指定 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Size (m²)
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                      <span className="text-sm text-gray-500 whitespace-nowrap">From</span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={propertySizeMin}
                        onChange={(e) => setPropertySizeMin(e.target.value)}
                        placeholder="e.g. 30"
                        className="flex-1 min-w-0 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1121F]/20 focus:border-[#C1121F] transition-colors"
                      />
                      <span className="text-sm text-gray-500">m²</span>
                    </div>
                    <span className="text-gray-400">–</span>
                    <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                      <span className="text-sm text-gray-500 whitespace-nowrap">To</span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={propertySizeMax}
                        onChange={(e) => setPropertySizeMax(e.target.value)}
                        placeholder="e.g. 80"
                        className="flex-1 min-w-0 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C1121F]/20 focus:border-[#C1121F] transition-colors"
                      />
                      <span className="text-sm text-gray-500">m²</span>
                    </div>
                  </div>
                </div>

                {/* Pet-friendly Toggle (for rent and short-term) */}
                {(propertyType === 'rent') && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Pet-friendly</span>
                    <button
                      type="button"
                      onClick={() => setPetFriendly(!petFriendly)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        petFriendly ? 'bg-[#C1121F]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          petFriendly ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* Foreign-friendly Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg md:col-span-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700 block">Foreign-friendly</span>
                    <span className="text-xs text-gray-500">No Japanese guarantor required</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForeignFriendly(!foreignFriendly)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      foreignFriendly ? 'bg-[#C1121F]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        foreignFriendly ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}