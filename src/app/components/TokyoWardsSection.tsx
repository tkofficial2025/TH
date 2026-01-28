import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface Ward {
  name: string;
  properties: number;
  image: string;
}

const wards: Ward[] = [
  {
    name: 'Minato',
    properties: 841,
    image: 'https://images.unsplash.com/photo-1510713829427-39b690447a8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNaW5hdG8lMjBUb2t5byUyMGNpdHlzY2FwZXxlbnwxfHx8fDE3Njk1NzQ3NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Shibuya',
    properties: 754,
    image: 'https://images.unsplash.com/photo-1704251550795-647ac5e50551?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTaGlidXlhJTIwVG9reW8lMjBjcm9zc2luZyUyMHN0cmVldHxlbnwxfHx8fDE3Njk1NzQ3NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Shinjuku',
    properties: 986,
    image: 'https://images.unsplash.com/photo-1728734662981-ff934eb6359d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTaGluanVrdSUyMFRva3lvJTIwc2t5c2NyYXBlcnN8ZW58MXx8fHwxNzY5NTc0NzUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Meguro',
    properties: 624,
    image: 'https://images.unsplash.com/photo-1769321868367-5beb43b835df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNZWd1cm8lMjBUb2t5byUyMHJlc2lkZW50aWFsfGVufDF8fHx8MTc2OTU3NDc1MXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Setagaya',
    properties: 832,
    image: 'https://images.unsplash.com/photo-1713635632084-f0dd34f5623e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTZXRhZ2F5YSUyMFRva3lvJTIwbmVpZ2hib3Job29kfGVufDF8fHx8MTc2OTU3NDc1MXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Bunkyo',
    properties: 436,
    image: 'https://images.unsplash.com/photo-1724045998002-6792534eea3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCdW5reW8lMjBUb2t5byUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzY5NTc0NzUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Chuo',
    properties: 655,
    image: 'https://images.unsplash.com/photo-1759548846978-85544926c40f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaHVvJTIwVG9reW8lMjBidXNpbmVzcyUyMGRpc3RyaWN0fGVufDF8fHx8MTc2OTU3NDc1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Taito',
    properties: 697,
    image: 'https://images.unsplash.com/photo-1643431543449-d078a74c9f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUYWl0byUyMFRva3lvJTIwdGVtcGxlfGVufDF8fHx8MTc2OTU3NDc1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Chiyoda',
    properties: 257,
    image: 'https://images.unsplash.com/photo-1691434226786-9fef3cda90de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGl5b2RhJTIwVG9reW8lMjBJbXBlcmlhbCUyMFBhbGFjZXxlbnwxfHx8fDE3Njk1NzQ3NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export function TokyoWardsSection() {
  const [showAll, setShowAll] = useState(false);
  const visibleWards = showAll ? wards : wards.slice(0, 6);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Explore Tokyo Wards
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Discover popular areas across Tokyo, from central business districts to quiet residential neighborhoods.
          </p>
        </motion.div>

        {/* Wards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {visibleWards.map((ward, index) => (
              <motion.a
                key={ward.name}
                href="#"
                className="group relative overflow-hidden rounded-2xl aspect-[3/1] block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.01 }}
              >
                {/* Background Image */}
                <div className="absolute inset-0 overflow-hidden">
                  <ImageWithFallback
                    src={ward.image}
                    alt={`${ward.name} ward`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
                </div>

                {/* Text Content */}
                <div className="relative h-full flex flex-col justify-end p-6">
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                    {ward.name}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {ward.properties} properties
                  </p>
                </div>

                {/* Hover Shadow */}
                <div className="absolute inset-0 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </motion.a>
            ))}
          </AnimatePresence>
        </div>

        {/* Show More/Less Button */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors group"
          >
            <span>{showAll ? 'Show less' : 'Show more'}</span>
            {showAll ? (
              <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            ) : (
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
