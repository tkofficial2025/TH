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

// デフォルト画像URL（UnsplashのTokyo関連画像）
const DEFAULT_TOKYO_IMAGE = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080';

const WARDS_BASE: Omit<Ward, 'properties'>[] = [
  // 23区
  { name: 'Chiyoda', image: 'https://images.unsplash.com/photo-1691434226786-9fef3cda90de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Chuo', image: 'https://images.unsplash.com/photo-1759548846978-85544926c40f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Minato', image: 'https://images.unsplash.com/photo-1510713829427-39b690447a8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Shinjuku', image: 'https://images.unsplash.com/photo-1728734662981-ff934eb6359d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Bunkyo', image: 'https://images.unsplash.com/photo-1724045998002-6792534eea3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Taito', image: 'https://images.unsplash.com/photo-1643431543449-d078a74c9f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Sumida', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Koto', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Shinagawa', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Meguro', image: 'https://images.unsplash.com/photo-1769321868367-5beb43b835df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Ota', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Setagaya', image: 'https://images.unsplash.com/photo-1713635632084-f0dd34f5623e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Shibuya', image: 'https://images.unsplash.com/photo-1704251550795-647ac5e50551?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080' },
  { name: 'Nakano', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Suginami', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Toshima', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Kita', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Arakawa', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Itabashi', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Nerima', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Adachi', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Katsushika', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Edogawa', image: DEFAULT_TOKYO_IMAGE },
  // 23区外（市部）
  { name: 'Hachioji', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Tachikawa', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Musashino', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Mitaka', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Ome', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Fuchu', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Akishima', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Chofu', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Machida', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Koganei', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Kodaira', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Hino', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Higashimurayama', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Kokubunji', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Kunitachi', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Fussa', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Komae', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Higashiyamato', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Kiyose', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Higashikurume', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Musashimurayama', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Tama', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Inagi', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Hamura', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Akiruno', image: DEFAULT_TOKYO_IMAGE },
  { name: 'Nishitokyo', image: DEFAULT_TOKYO_IMAGE },
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

  // 23区と23区外を分けて表示
  const ward23Names = ['Chiyoda', 'Chuo', 'Minato', 'Shinjuku', 'Bunkyo', 'Taito', 'Sumida', 'Koto', 'Shinagawa', 'Meguro', 'Ota', 'Setagaya', 'Shibuya', 'Nakano', 'Suginami', 'Toshima', 'Kita', 'Arakawa', 'Itabashi', 'Nerima', 'Adachi', 'Katsushika', 'Edogawa'];
  const wards23 = wards.filter((w) => ward23Names.includes(w.name));
  const outerWards = wards.filter((w) => !ward23Names.includes(w.name));
  
  // 23区外の物件数を合計
  const outerWardsTotalProperties = outerWards.reduce((sum, w) => sum + w.properties, 0);
  
  // 23区は最初の2行（6カード）だけ表示、残りは「Show more」で表示
  const visibleWards23 = showAll ? wards23 : wards23.slice(0, 6);

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

        {/* 23 Wards Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">23 Special Wards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {visibleWards23.map((ward, index) => (
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
        </div>

        {/* Outer 23 Wards - Single Card */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Outer 23 Wards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              className="group relative overflow-hidden rounded-2xl aspect-[3/1.3] min-h-[200px] cursor-default"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              {/* Background Image */}
              <div className="absolute inset-0 overflow-hidden">
                <ImageWithFallback
                  src={DEFAULT_TOKYO_IMAGE}
                  alt="Outer 23 Wards"
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
                    Outer 23 Wards
                  </h3>
                  <p className="text-white/90 text-sm mb-3">
                    {outerWardsTotalProperties} properties
                  </p>
                  {onWardClick && (
                    <div className="flex gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          // 23区外を選択した状態でrentページに遷移
                          onWardClick('Outside23', 'rent');
                        }}
                        className="cursor-pointer px-4 py-2.5 bg-[#C1121F] hover:bg-[#A00F1A] text-white text-sm font-semibold rounded-lg transition-colors shadow-md"
                      >
                        View Rentals
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWardClick('Outside23', 'buy');
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
          </div>
        </div>

        {/* Show More/Less Button - 23区のみ（23区外は常に表示） */}
        {wards23.length > 6 && (
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
        )}
      </div>
    </section>
  );
}
