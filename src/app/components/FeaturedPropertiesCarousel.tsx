import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { useRef, useState } from 'react';

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  type: 'Rent' | 'Buy' | 'Investment';
  image: string;
  beds: number;
  baths: number;
  size: string;
}

const properties: Property[] = [
  {
    id: 1,
    title: 'Shibuya Premium Apartment',
    location: 'Shibuya, Tokyo',
    price: '¥89,000,000',
    type: 'Buy',
    image: 'https://images.unsplash.com/photo-1589572368687-c093a494522a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBUb2t5byUyMGFwYXJ0bWVudCUyMGludGVyaW9yfGVufDF8fHx8MTc2OTU2ODgxMXww&ixlib=rb-4.1.0&q=80&w=1080',
    beds: 2,
    baths: 2,
    size: '85㎡',
  },
  {
    id: 2,
    title: 'Roppongi Luxury Penthouse',
    location: 'Roppongi, Tokyo',
    price: '¥165,000,000',
    type: 'Investment',
    image: 'https://images.unsplash.com/photo-1768711610981-7e106038ddcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUb2t5byUyMGNpdHklMjBza3lsaW5lJTIwdmlldyUyMGFwYXJ0bWVudHxlbnwxfHx8fDE3Njk1Njg4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    beds: 3,
    baths: 3,
    size: '120㎡',
  },
  {
    id: 3,
    title: 'Setagaya Modern House',
    location: 'Setagaya, Tokyo',
    price: '¥350,000/mo',
    type: 'Rent',
    image: 'https://images.unsplash.com/photo-1635834098903-1c1288d9a73a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxKYXBhbmVzZSUyMG1vZGVybiUyMGhvdXNlJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzY5NTY4ODEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    beds: 4,
    baths: 2,
    size: '145㎡',
  },
  {
    id: 4,
    title: 'Meguro Stylish Condo',
    location: 'Meguro, Tokyo',
    price: '¥72,000,000',
    type: 'Buy',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    beds: 2,
    baths: 1,
    size: '68㎡',
  },
  {
    id: 5,
    title: 'Ginza Executive Suite',
    location: 'Ginza, Tokyo',
    price: '¥280,000/mo',
    type: 'Rent',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    beds: 1,
    baths: 1,
    size: '55㎡',
  },
  {
    id: 6,
    title: 'Shinjuku Investment Tower',
    location: 'Shinjuku, Tokyo',
    price: '¥125,000,000',
    type: 'Investment',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    beds: 3,
    baths: 2,
    size: '95㎡',
  },
];

export function FeaturedPropertiesCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Featured Properties</h2>
            <p className="text-lg text-gray-600">Handpicked homes and investment opportunities in Japan</p>
          </motion.div>

          <motion.a
            href="#"
            className="hidden md:flex items-center gap-2 text-gray-600 hover:text-[#C1121F] transition-colors group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="font-medium">View all</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        {/* Carousel Container */}
        <div className="relative group/carousel">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-gray-900" />
            </button>
          )}

          {/* Scrollable Cards Container */}
          <motion.div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4"
            onScroll={handleScroll}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                className="flex-shrink-0 w-[340px] md:w-[380px] snap-start group/card cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  {/* Property Image */}
                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                    />
                    {/* Type Badge */}
                    <div
                      className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                        property.type === 'Buy'
                          ? 'bg-[#C1121F] text-white'
                          : property.type === 'Investment'
                          ? 'bg-gray-900 text-white'
                          : 'bg-white text-gray-900'
                      }`}
                    >
                      {property.type === 'Rent' ? 'For Rent' : property.type === 'Buy' ? 'For Sale' : 'Investment'}
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover/card:text-[#C1121F] transition-colors">
                      {property.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{property.location}</p>

                    {/* Property Stats */}
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                      <span>{property.beds} bed</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{property.baths} bath</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{property.size}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-gray-900">{property.price}</span>
                      {property.type === 'Buy' && (
                        <span className="text-sm text-gray-500">
                          ~${(parseInt(property.price.replace(/[¥,]/g, '')) / 150000).toFixed(0)}k USD
                        </span>
                      )}
                      {property.type === 'Rent' && (
                        <span className="text-sm text-gray-500">
                          ~${(parseInt(property.price.replace(/[¥,/mo]/g, '')) / 150).toFixed(1)}k USD
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Mobile View All Link */}
        <motion.a
          href="#"
          className="flex md:hidden items-center justify-center gap-2 text-gray-600 hover:text-[#C1121F] transition-colors group mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-medium">View all properties</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.a>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
