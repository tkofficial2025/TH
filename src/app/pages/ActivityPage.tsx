import { useState, useEffect } from 'react';
import { Heart, User, LogOut, Calendar, MapPin, Bed, Maximize2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { type Property, type SupabasePropertyRow, mapSupabaseRowToProperty } from '@/lib/properties';
import { useCurrency } from '@/app/contexts/CurrencyContext';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { StationLineLogo } from '@/app/components/StationLineLogo';
import { Header } from '@/app/components/Header';
import type { Page } from '@/lib/routes';

interface ActivityPageProps {
  onNavigate: (page: Page) => void;
  onSelectProperty?: (id: number, source: 'rent' | 'buy') => void;
}

type AppliedItem = { property: Property; hasTour: boolean; hasInquiry: boolean };

export function ActivityPage({ onNavigate, onSelectProperty }: ActivityPageProps) {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'rent' | 'buy'>('rent');
  const [appliedRent, setAppliedRent] = useState<AppliedItem[]>([]);
  const [appliedBuy, setAppliedBuy] = useState<AppliedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        onNavigate('account');
        return;
      }
      const first = (user.user_metadata?.first_name as string) ?? '';
      const last = (user.user_metadata?.last_name as string) ?? '';
      setUserName([first, last].filter(Boolean).join(' ') || user.email || 'User');
      setUserEmail(user.email ?? '');

      setLoading(true);
      const [tourRows, inquiryRows] = await Promise.all([
        supabase.from('property_tour_requests').select('property_id').eq('user_id', user.id),
        supabase.from('property_inquiries').select('property_id').eq('email', user.email ?? ''),
      ]);

      const tourIds = new Set((tourRows.data ?? []).map((r) => r.property_id));
      const inquiryIds = new Set((inquiryRows.data ?? []).map((r) => r.property_id));
      const allIds = [...new Set([...tourIds, ...inquiryIds])];

      if (allIds.length === 0) {
        setAppliedRent([]);
        setAppliedBuy([]);
        setLoading(false);
        return;
      }

      const { data: props } = await supabase.from('properties').select('*').in('id', allIds);
      const list: AppliedItem[] = (props ?? []).map((r) => ({
        property: mapSupabaseRowToProperty(r as SupabasePropertyRow),
        hasTour: tourIds.has(r.id),
        hasInquiry: inquiryIds.has(r.id),
      }));

      setAppliedRent(list.filter((x) => x.property.type === 'rent'));
      setAppliedBuy(list.filter((x) => x.property.type === 'buy'));
      setLoading(false);
    }
    load();
  }, [onNavigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate('home');
  };

  function Card({ item, source }: { item: AppliedItem; source: 'rent' | 'buy' }) {
    const { property, hasTour, hasInquiry } = item;
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectProperty?.(property.id, source)}
        onKeyDown={(e) => e.key === 'Enter' && onSelectProperty?.(property.id, source)}
        className="text-left rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all relative cursor-pointer"
      >
        <div className="relative aspect-[4/3] bg-gray-100">
          <ImageWithFallback src={property.image} alt={property.title} className="w-full h-full object-cover" />
          <span
            className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-lg ${
              source === 'rent' ? 'bg-white text-gray-900' : 'bg-[#C1121F] text-white'
            }`}
          >
            {source === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            {hasTour && <span className="px-2 py-0.5 bg-[#C1121F] text-white text-xs font-medium rounded">Room tour</span>}
            {hasInquiry && <span className="px-2 py-0.5 bg-gray-700 text-white text-xs font-medium rounded">資料請求</span>}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{property.title}</h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-1">{property.address}</p>
          <p className="font-semibold text-[#C1121F] mb-2">{formatPrice(property.price, source)}</p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Bed className="w-3.5 h-3.5" />
            <span>{property.beds}</span>
            <Maximize2 className="w-3.5 h-3.5 ml-1" />
            <span>{property.size} m²</span>
            <span className="ml-1">{property.layout}</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <StationLineLogo stationName={property.station} size={14} className="flex-shrink-0" />
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{property.station} • {property.walkingMinutes} min</span>
          </div>
        </div>
      </div>
    );
  }

  const list = activeTab === 'rent' ? appliedRent : appliedBuy;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onNavigate={onNavigate} currentPage="account" />
      <div className="flex pt-20">
        <aside className="w-64 min-h-[calc(100vh-5rem)] bg-gray-200 border-r border-gray-300 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-300">
            <button type="button" onClick={() => onNavigate('home')} className="hover:opacity-80">
              <img src="/logo2.png" alt="Tokyo Housing" className="h-10 w-auto object-contain" />
            </button>
          </div>
          <nav className="p-3 flex-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">User</div>
            <button
              type="button"
              onClick={() => onNavigate('favorites')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-300/50 mt-1"
            >
              <Heart className="w-5 h-5" />
              Favorites
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-300 text-gray-900 font-medium mt-1"
            >
              <Calendar className="w-5 h-5 text-[#C1121F]" />
              Activity
            </button>
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-300/50 mt-1"
            >
              <User className="w-5 h-5" />
              Profile
            </button>
          </nav>
          <div className="p-3 border-t border-gray-300 mt-auto space-y-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-[#C1121F]/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-[#C1121F]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{userName || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail || '—'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-300/50 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 min-h-[calc(100vh-5rem)] bg-white p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">応募した物件</h1>
          <p className="text-sm text-gray-500 mb-6">Room tour または資料請求をした物件を確認できます。</p>

          <div className="flex gap-8 border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('rent')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'rent' ? 'border-[#C1121F] text-[#C1121F]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Rent
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('buy')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'buy' ? 'border-[#C1121F] text-[#C1121F]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Buy
            </button>
          </div>

          {loading ? (
            <p className="text-gray-500">読み込み中...</p>
          ) : list.length === 0 ? (
            <p className="text-gray-600">
              {activeTab === 'rent' ? '応募した賃貸物件はありません。' : '応募した売買物件はありません。'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((item) => (
                <Card key={item.property.id} item={item} source={activeTab} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
