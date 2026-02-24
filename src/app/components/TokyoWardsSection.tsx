import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { supabase } from '@/lib/supabase';
import { WARD_MATCH_TERMS } from '@/lib/wards';

interface Ward {
  name: string;
  properties: number;
  image: string;
}

export interface TokyoWardsSectionProps {
  onWardClick?: (wardName: string, page: 'rent' | 'buy') => void;
}

const WARDS_BASE: Omit<Ward, 'properties'>[] = [
  { name: 'Minato', image: 'https://images.unsplash.com/photo-1510713829427-39b690447a8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNaW5hdG8lMjBUb2t5byUyMGNpdHlzY2FwZXxlbnwxfHx8fDE3Njk1NzQ3NTB8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Shibuya', image: 'https://images.unsplash.com/photo-1704251550795-647ac5e50551?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTaGlidXlhJTIwVG9reW8lMjBjcm9zc2luZyUyMHN0cmVldHxlbnwxfHx8fDE3Njk1NzQ3NTB8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Shinjuku', image: 'https://images.unsplash.com/photo-1728734662981-ff934eb6359d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTaGluanVrdSUyMFRva3lvJTIwc2t5c2NyYXBlcnN8ZW58MXx8fHwxNzY5NTc0NzUxfDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Meguro', image: 'https://images.unsplash.com/photo-1769321868367-5beb43b835df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNZWd1cm8lMjBUb2t5byUyMHJlc2lkZW50aWFsfGVufDF8fHx8MTc2OTU3NDc1MXww&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Setagaya', image: 'https://images.unsplash.com/photo-1713635632084-f0dd34f5623e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTZXRhZ2F5YSUyMFRva3lvJTIwbmVpZ2hib3Job29kfGVufDF8fHx8MTc2OTU3NDc1MXww&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Bunkyo', image: 'https://images.unsplash.com/photo-1724045998002-6792534eea3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCdW5reW8lMjBUb2t5byUyMHVuaXZlcnNpdHl8ZW58MXx8fHwxNzY5NTc0NzUxfDA&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Chuo', image: 'https://images.unsplash.com/photo-1759548846978-85544926c40f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaHVvJTIwVG9reW8lMjBidXNpbmVzcyUyMGRpc3RyaWN0fGVufDF8fHx8MTc2OTU3NDc1Mnww&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Taito', image: 'https://images.unsplash.com/photo-1643431543449-d078a74c9f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxUYWl0byUyMFRva3lvJTIwdGVtcGxlfGVufDF8fHx8MTc2OTU3NDc1Mnww&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Chiyoda', image: 'https://images.unsplash.com/photo-1691434226786-9fef3cda90de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxDaGl5b2RhJTIwVG9reW8lMjBJbXBlcmlhbCUyMFBhbGFjZXxlbnwxfHx8fDE3Njk1NzQ3NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080' },
];

export function TokyoWardsSection({ onWardClick }: TokyoWardsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const [wards, setWards] = useState<Ward[]>(() =>
    WARDS_BASE.map((w) => ({ ...w, properties: 0 }))
  );

  useEffect(() => {
    async function fetchCounts() {
      const { data, error } = await supabase.from('properties').select('address');
      if (error || !data?.length) {
        setWards((prev) => prev.map((w) => ({ ...w, properties: 0 })));
        return;
      }
      const counts: Record<string, number> = {};
      for (const name of Object.keys(WARD_MATCH_TERMS)) {
        counts[name] = 0;
      }
      const addrLower = (s: string) => (s ?? '').toLowerCase();
      for (const row of data) {
        const addr = addrLower((row as { address?: string }).address ?? '');
        for (const [wardName, terms] of Object.entries(WARD_MATCH_TERMS)) {
          if (terms.some((t) => addr.includes(t.toLowerCase()) || addr.includes(t))) {
            counts[wardName] = (counts[wardName] ?? 0) + 1;
            break;
          }
        }
      }
      setWards(
        WARDS_BASE.map((w) => ({ ...w, properties: counts[w.name] ?? 0 }))
      );
    }
    fetchCounts();
  }, []);

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
              <motion.div
                key={ward.name}
                className="group relative overflow-hidden rounded-2xl aspect-[3/1.3] min-h-[200px] cursor-default"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Background Image（ホバーで動かさない＝クリック可能に見せない） */}
                <div className="absolute inset-0 overflow-hidden">
                  <ImageWithFallback
                    src={ward.image}
                    alt={`${ward.name} ward`}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" />
                </div>

                {/* Text Content + 常に見えるボタン */}
                <div className="relative h-full flex flex-col justify-between p-6">
                  <div></div>
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                      {ward.name}
                    </h3>
                  <p className="text-white/90 text-sm mb-3">
                    {ward.properties} properties
                  </p>
                  {onWardClick && (
                    <div className="flex gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWardClick(ward.name, 'rent');
                        }}
                        className="cursor-pointer px-4 py-2.5 bg-[#C1121F] hover:bg-[#A00F1A] text-white text-sm font-semibold rounded-lg transition-colors shadow-md"
                      >
                        View Rentals
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWardClick(ward.name, 'buy');
                        }}
                        className="cursor-pointer px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-900 text-sm font-semibold rounded-lg transition-colors shadow-md border border-white/50"
                      >
                        View for Sale
                      </button>
                    </div>
                  )}
                  </div>
                </div>
              </motion.div>
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
