import { useState } from 'react';
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
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface Property {
  id: number;
  title: string;
  address: string;
  price: number;
  beds: number;
  size: number;
  layout: string;
  image: string;
  station: string;
  walkingMinutes: number;
  isFeatured?: boolean;
  isNew?: boolean;
}

const mockProperties: Property[] = [
  {
    id: 1,
    title: 'Meguro Honcho 4-chome',
    address: 'Meguro-ku, Tokyo',
    price: 129800000,
    beds: 3,
    size: 87.5,
    layout: '3LDK',
    image: 'https://images.unsplash.com/photo-1589572368687-c093a494522a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBUb2t5byUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc2OTU2ODgxMXww&ixlib=rb-4.1.0&q=80&w=1080',
    station: 'Meguro',
    walkingMinutes: 8,
    isFeatured: true,
  },
  {
    id: 2,
    title: 'Shibuya Sky Tower',
    address: 'Shibuya-ku, Tokyo',
    price: 245000000,
    beds: 2,
    size: 95.2,
    layout: '2LDK+S',
    image: 'https://images.unsplash.com/photo-1685540256938-f02082efaa25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBUb2t5byUyMHBlbnRob3VzZSUyMHZpZXd8ZW58MXx8fHwxNzY5NTgwNDYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    station: 'Shibuya',
    walkingMinutes: 5,
    isNew: true,
  },
  {
    id: 3,
    title: 'Minato Azabu Residence',
    address: 'Minato-ku, Tokyo',
    price: 178500000,
    beds: 2,
    size: 72.8,
    layout: '2LDK',
    image: 'https://images.unsplash.com/photo-1713022643918-34bb17feb95d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBKYXBhbmVzZSUyMGFwYXJ0bWVudHxlbnwxfHx8fDE3Njk1ODA0NjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    station: 'Azabu-juban',
    walkingMinutes: 6,
  },
  {
    id: 4,
    title: 'Shinjuku Central Park View',
    address: 'Shinjuku-ku, Tokyo',
    price: 156700000,
    beds: 2,
    size: 68.4,
    layout: '2LDK',
    image: 'https://images.unsplash.com/photo-1665706356234-9a5200e38a1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMHJlc2lkZW50aWFsJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzY5NTgwNDYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    station: 'Shinjuku',
    walkingMinutes: 12,
  },
  {
    id: 5,
    title: 'Setagaya Modern House',
    address: 'Setagaya-ku, Tokyo',
    price: 98900000,
    beds: 3,
    size: 105.3,
    layout: '3LDK+S',
    image: 'https://images.unsplash.com/photo-1501876725168-00c445821c9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXBhcnRtZW50JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY5NTEzNjA5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    station: 'Sakurashinmachi',
    walkingMinutes: 9,
    isNew: true,
  },
  {
    id: 6,
    title: 'Chiyoda Imperial View',
    address: 'Chiyoda-ku, Tokyo',
    price: 215000000,
    beds: 2,
    size: 82.1,
    layout: '2LDK',
    image: 'https://images.unsplash.com/photo-1635834365696-898c3b44d91c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBKYXBhbmVzZSUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzY5NTgwNDY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    station: 'Kudanshita',
    walkingMinutes: 7,
  },
];

export function PropertyListingPage() {
  const [showMap, setShowMap] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

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
    return `¥${(price / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

            {/* Price */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-100 transition-all text-sm font-medium text-gray-700">
              Price
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
                  Properties for sale
                </h1>
                <p className="text-gray-600">2,117 results</p>
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
              {mockProperties.map((property, index) => (
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
                        {formatPrice(property.price)}
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
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#999" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Map Content - Property Markers */}
              <div className="absolute inset-0 p-8">
                {/* Price Markers */}
                <div className="absolute top-[15%] right-[25%]">
                  <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                    ¥53,100,000
                  </div>
                </div>

                <div className="absolute top-[25%] right-[20%]">
                  <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                    ¥72,500,000
                  </div>
                </div>

                <div className="absolute top-[45%] left-[30%]">
                  <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                    ¥235,000,000
                  </div>
                </div>

                <div className="absolute bottom-[35%] left-[25%]">
                  <div className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                    ¥141,900,000
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

              {/* Coming Soon Overlay (optional - can remove if you want full map look) */}
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