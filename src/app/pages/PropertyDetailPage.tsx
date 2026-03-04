import { useState, useEffect } from 'react';
import {
  Heart,
  FileText,
  MapPin,
  Bed,
  Maximize2,
  Building2,
  Bike,
  Package,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
} from 'lucide-react';
import { Header } from '@/app/components/Header';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { StationLineLogo } from '@/app/components/StationLineLogo';
import { PropertyMap } from '@/app/components/PropertyMap';
import { supabase } from '@/lib/supabase';
import { type Property, type SupabasePropertyRow, mapSupabaseRowToProperty } from '@/lib/properties';
import { useCurrency } from '@/app/contexts/CurrencyContext';

interface PropertyDetailPageProps {
  propertyId: number;
  source: 'rent' | 'buy';
  onNavigate?: (page: 'home' | 'buy' | 'rent' | 'account' | 'favorites') => void;
  onBack?: () => void;
}

export function PropertyDetailPage({ propertyId, source, onNavigate, onBack }: PropertyDetailPageProps) {
  const { formatPrice } = useCurrency();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState<'added' | 'removed' | 'error' | null>(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [tourCandidates, setTourCandidates] = useState<{ date: string; timeRange: string }[]>([
    { date: '', timeRange: '09:00-12:00' },
    { date: '', timeRange: '09:00-12:00' },
    { date: '', timeRange: '09:00-12:00' },
  ]);
  const [tourConfirmed, setTourConfirmed] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();
      if (err) {
        setError(err.message);
        setProperty(null);
      } else if (data) {
        setProperty(mapSupabaseRowToProperty(data as SupabasePropertyRow));
      } else {
        setProperty(null);
      }
      setLoading(false);
    }
    fetchProperty();
  }, [propertyId]);

  useEffect(() => {
    async function checkFavorite() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .maybeSingle();
      setFavorite(!!data);
    }
    checkFavorite();
  }, [propertyId]);

  const toggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      onNavigate?.('account');
      return;
    }
    setFavoriteLoading(true);
    setFavoriteMessage(null);
    if (favorite) {
      const { error: err } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);
      if (err) {
        setFavoriteMessage('error');
      } else {
        setFavorite(false);
        setFavoriteMessage('removed');
      }
    } else {
      const { error: err } = await supabase.from('user_favorites').insert({
        user_id: user.id,
        property_id: propertyId,
        type: source,
      });
      if (err) {
        setFavoriteMessage('error');
      } else {
        setFavorite(true);
        setFavoriteMessage('added');
      }
    }
    setFavoriteLoading(false);
    setTimeout(() => setFavoriteMessage((m) => (m === 'error' ? m : null)), 3000);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inquiryEmail.trim();
    if (!email) return;
    setInquiryError(null);
    setInquiryLoading(true);
    const { error } = await supabase.from('property_inquiries').insert({
      name: inquiryName.trim() || null,
      email,
      property_id: propertyId,
      property_title: property?.title ?? null,
    });
    setInquiryLoading(false);
    if (error) {
      setInquiryError(error.message);
      return;
    }
    setInquirySent(true);
    setInquiryName('');
    setInquiryEmail('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }
  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onNavigate={onNavigate} currentPage={source} />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-red-600 mb-4">{error || '物件が見つかりません'}</p>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbLabel = source === 'rent' ? 'Rent' : 'Buy';
  const priceLabel = source === 'rent' ? 'Monthly rent' : 'Price';
  const priceDisplay = formatPrice(property.price, source);

  const allPhotos = [property.image, ...(property.images ?? [])].filter(Boolean) as string[];
  const featureFlags = [
    property.petFriendly && { label: 'Pet-friendly', Icon: Building2 },
    property.foreignFriendly && { label: 'Foreign-friendly', Icon: Building2 },
    property.balcony && { label: 'Balcony', Icon: Building2 },
    property.bicycleParking && { label: 'Bicycle parking', Icon: Bike },
    property.deliveryBox && { label: 'Delivery box', Icon: Package },
    property.elevator && { label: 'Elevator', Icon: ArrowUpDown },
    property.southFacing && { label: 'South facing', Icon: Maximize2 },
  ].filter(Boolean) as { label: string; Icon: typeof Building2 }[];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} currentPage={source} />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button type="button" onClick={() => onNavigate?.('home')} className="hover:text-gray-900">
            Home page
          </button>
          <ChevronRight className="w-4 h-4" />
          <span>{breadcrumbLabel}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 truncate max-w-[200px]">{property.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image + Grid (multiple photos from DB) */}
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-4 md:col-span-3 relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-200">
                <ImageWithFallback
                  src={allPhotos[0] ?? property.image}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="col-span-4 md:col-span-1 grid grid-rows-3 gap-2">
                {allPhotos.slice(1, 4).length > 0
                  ? allPhotos.slice(1, 4).map((url, i) => (
                      <div key={i} className="rounded-lg overflow-hidden bg-gray-200">
                        <ImageWithFallback src={url} alt="" className="w-full h-full object-cover min-h-[80px]" />
                      </div>
                    ))
                  : [1, 2, 3].map((i) => (
                      <div key={i} className="rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Photo {i + 1}</span>
                      </div>
                    ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">※The building completion forecast image is based on the drawing and may differ from the actual property.</p>

            {/* Location + Title + Station */}
            <p className="text-gray-600">{property.address}</p>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{property.title}</h1>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
                  aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 ${favorite ? 'fill-[#C1121F] text-[#C1121F]' : 'text-gray-600'}`} />
                </button>
                <button type="button" className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  <FileText className="w-4 h-4" /> Brochure
                </button>
              </div>
              {favoriteMessage === 'added' && (
                <p className="text-sm text-green-600 mt-2">Added to Favorites.</p>
              )}
              {favoriteMessage === 'removed' && (
                <p className="text-sm text-gray-500 mt-2">Removed from Favorites.</p>
              )}
              {favoriteMessage === 'error' && (
                <p className="text-sm text-red-600 mt-2">Could not save. Check Supabase: run add_user_favorites.sql in SQL Editor.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                <StationLineLogo 
                  stationName={property.station} 
                  size={20} 
                  className="flex-shrink-0" 
                />
                <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <span>{property.station} • {property.walkingMinutes} min walk</span>
              </div>
            </div>

            {/* Specs Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">{priceLabel}</span>
                  <span className="font-semibold">{priceDisplay}</span>
                </div>
                {source === 'rent' && (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Management fee</span>
                      <span className="font-medium">
                        {property.managementFee != null ? formatPrice(property.managementFee, 'rent') : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Deposit</span>
                      <span className="font-medium">
                        {property.deposit != null ? (property.deposit === 0 ? 'No deposit' : formatPrice(property.deposit, 'rent')) : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Key money</span>
                      <span className="font-medium">
                        {property.keyMoney != null ? (property.keyMoney === 0 ? 'No key money' : formatPrice(property.keyMoney, 'rent')) : '—'}
                      </span>
                    </div>
                  </>
                )}
                {source === 'buy' && property.managementFee != null && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Management fee</span>
                    <span className="font-medium">{formatPrice(property.managementFee, 'rent')}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Layout</span>
                  <span className="font-medium">{property.layout}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Bedrooms</span>
                  <span className="font-medium">{property.beds}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Size</span>
                  <span className="font-medium">{property.size} m²</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Floor</span>
                  <span className="font-medium">{property.floor != null ? `${property.floor}F` : '—'}</span>
                </div>
              </div>
            </div>

            {/* Rental Fees pills (from DB) */}
            {source === 'rent' && (property.keyMoney != null || property.deposit != null) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Rental fees</h3>
                <div className="flex flex-wrap gap-2">
                  {property.keyMoney === 0 && (
                    <span className="px-4 py-2 bg-[#C1121F]/10 text-[#C1121F] rounded-lg text-sm font-medium">No key money</span>
                  )}
                  {property.keyMoney != null && property.keyMoney > 0 && (
                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Key money</span>
                  )}
                  {property.deposit != null && (
                    <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">Deposit</span>
                  )}
                </div>
              </div>
            )}

            {/* Property Features (only show when true in DB) */}
            {featureFlags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Property features</h3>
                <div className="flex flex-wrap gap-2">
                  {featureFlags.map(({ label, Icon }) => (
                    <span key={label} className="px-3 py-1.5 bg-gray-900 text-white text-sm rounded-full flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Property Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Property information</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {descriptionExpanded
                  ? `${property.title} offers a comfortable living space of ${property.size} m² in ${property.address}, with ${property.beds} bedroom(s) and ${property.layout} layout. Located ${property.walkingMinutes} minutes walk from ${property.station}, this property provides easy access to transport and local amenities.`
                  : `${property.title} offers a comfortable living space of ${property.size} m² in ${property.address}...`}
              </p>
              <button
                type="button"
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className="mt-2 text-sm font-medium text-[#C1121F] flex items-center gap-1"
              >
                {descriptionExpanded ? 'Show less' : 'Show more'} <ChevronDown className={`w-4 h-4 transition-transform ${descriptionExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Initial fees by card (only when enabled in DB) */}
            {source === 'rent' && property.initialFeesCreditCard && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Initial fees can be paid by credit card</h3>
                <p className="text-xs text-gray-500 mb-4">*Additional transaction fees may apply</p>
                <div className="flex gap-4 text-gray-600">
                  <span className="text-xs font-medium">JCB</span>
                  <span className="text-xs font-medium">Mastercard</span>
                  <span className="text-xs font-medium">VISA</span>
                  <span className="text-xs font-medium">AMEX</span>
                </div>
              </div>
            )}

            {/* Map */}
            {property.address && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Location</h3>
                <PropertyMap 
                  address={property.address} 
                  title={property.title}
                  height="400px"
                />
              </div>
            )}
          </div>

          {/* Right Column - Sticky */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-[4.5rem] space-y-6">
              {/* Request a Tour */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Request a Tour</h3>
                {tourConfirmed ? (
                  <p className="text-sm text-green-600 py-2">A staff member will contact you within 24 hours.</p>
                ) : (
                <>
                <p className="text-xs text-gray-500 mb-4">Please provide up to 3 preferred date and time options. We will contact you to confirm.</p>
                <div className="space-y-4">
                  {tourCandidates.map((candidate, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg space-y-2">
                      <span className="text-xs font-medium text-gray-600">Option {index + 1}</span>
                      <div className="flex flex-wrap gap-2 items-end">
                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-xs text-gray-500 mb-1">Date</label>
                          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1.5">
                            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <input
                              type="date"
                              value={candidate.date}
                              onChange={(e) => {
                                const next = [...tourCandidates];
                                next[index] = { ...next[index], date: e.target.value };
                                setTourCandidates(next);
                              }}
                              className="flex-1 outline-none text-sm min-w-0"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-xs text-gray-500 mb-1">Time range</label>
                          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1.5">
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <select
                              value={candidate.timeRange}
                              onChange={(e) => {
                                const next = [...tourCandidates];
                                next[index] = { ...next[index], timeRange: e.target.value };
                                setTourCandidates(next);
                              }}
                              className="flex-1 outline-none text-sm bg-transparent min-w-0"
                            >
                              <option value="09:00-12:00">09:00 – 12:00</option>
                              <option value="12:00-15:00">12:00 – 15:00</option>
                              <option value="15:00-18:00">15:00 – 18:00</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (user) {
                        await supabase.from('property_tour_requests').insert({
                          user_id: user.id,
                          property_id: propertyId,
                          tour_candidates: tourCandidates,
                        });
                      }
                      setTourConfirmed(true);
                    }}
                    disabled={!tourCandidates.every((c) => c.date.trim() !== '')}
                    className="w-full py-3 bg-[#C1121F] text-white font-semibold rounded-lg hover:bg-[#A00F1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#C1121F]"
                  >
                    Confirm
                  </button>
                </div>
                </>
                )}
              </div>

              {/* Check Availability and Request Property Details */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Check Availability and Request Property Details</h3>
                <p className="text-xs text-gray-500 mb-3">Enter your name and email address. We will send you availability and full details for this property. You can check anytime.</p>
                {inquirySent ? (
                  <p className="text-sm text-green-600 py-2">Request received. A staff member will contact you within 24 hours.</p>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-3">
                    <div>
                      <label htmlFor="inquiry-name" className="block text-xs text-gray-500 mb-1">Name</label>
                      <input
                        id="inquiry-name"
                        type="text"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        placeholder="Your name"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="inquiry-email" className="block text-xs text-gray-500 mb-1">Email address</label>
                      <input
                        id="inquiry-email"
                        type="email"
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C1121F] focus:border-transparent"
                      />
                    </div>
                    {inquiryError && (
                      <p className="text-xs text-red-600">{inquiryError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={inquiryLoading}
                      className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-60 transition-colors"
                    >
                      {inquiryLoading ? 'Sending...' : 'Submit'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back to list */}
        <div className="mt-8 pb-12">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
          >
            ← 一覧に戻る
          </button>
        </div>
      </div>
    </div>
  );
}
