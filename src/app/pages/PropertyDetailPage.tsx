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
import { sendRequestEmails } from '@/lib/send-request-emails';
import { type Property, type SupabasePropertyRow, mapSupabaseRowToProperty } from '@/lib/properties';
import { useCurrency } from '@/app/contexts/CurrencyContext';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface PropertyDetailPageProps {
  propertyId: number;
  source: 'rent' | 'buy';
  onNavigate?: (page: 'home' | 'buy' | 'rent' | 'account' | 'favorites') => void;
  onBack?: () => void;
}

export function PropertyDetailPage({ propertyId, source, onNavigate, onBack }: PropertyDetailPageProps) {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
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
  const [tourError, setTourError] = useState<string | null>(null);
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

  // 既に内見予約・資料請求済みなら完了表示にする（物件読み込み後・DB の bigint に合わせて数値で検索）
  useEffect(() => {
    if (!propertyId || loading) return;
    async function checkAlreadyRequested() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const pid = Number(propertyId);
      const [tourRes, inquiryRes] = await Promise.all([
        supabase
          .from('property_tour_requests')
          .select('id')
          .eq('user_id', user.id)
          .eq('property_id', pid)
          .limit(1),
        supabase
          .from('property_inquiries')
          .select('id')
          .eq('email', String(user.email ?? '').trim())
          .eq('property_id', pid)
          .limit(1),
      ]);
      if (Array.isArray(tourRes.data) && tourRes.data.length > 0) setTourConfirmed(true);
      if (Array.isArray(inquiryRes.data) && inquiryRes.data.length > 0) setInquirySent(true);
    }
    checkAlreadyRequested();
  }, [propertyId, loading]);

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
    const nameForEmail = inquiryName.trim() || '';
    setInquirySent(true);
    setInquiryName('');
    setInquiryEmail('');
    sendRequestEmails({
      type: 'inquiry',
      email,
      name: nameForEmail,
      propertyId: Number(propertyId),
      propertyTitle: property?.title ?? undefined,
    }).then((r) => { if (!r.ok) console.error('[send-request-emails]', r.error); });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{t('property.loading')}</p>
      </div>
    );
  }
  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onNavigate={onNavigate} currentPage={source} />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-red-600 mb-4">{error || t('property.notfound')}</p>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            {t('property.back')}
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbLabel = source === 'rent' ? t('search.rent') : t('search.buy');
  const priceLabel = source === 'rent' ? t('property.price.rent') : t('property.price.buy');
  const priceDisplay = formatPrice(property.price, source);

  const allPhotos = [property.image, ...(property.images ?? [])].filter(Boolean) as string[];
  const featureFlags = [
    property.petFriendly && { label: t('property.feature.pet'), Icon: Building2 },
    property.foreignFriendly && { label: t('property.feature.foreign'), Icon: Building2 },
    property.balcony && { label: t('property.feature.balcony'), Icon: Building2 },
    property.bicycleParking && { label: t('property.feature.bicycle'), Icon: Bike },
    property.deliveryBox && { label: t('property.feature.delivery'), Icon: Package },
    property.elevator && { label: t('property.feature.elevator'), Icon: ArrowUpDown },
    property.southFacing && { label: t('property.feature.south'), Icon: Maximize2 },
  ].filter(Boolean) as { label: string; Icon: typeof Building2 }[];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} currentPage={source} />

      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button type="button" onClick={() => onNavigate?.('home')} className="hover:text-gray-900">
            {t('nav.home')}
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
                        <span className="text-gray-500 text-xs">{t('property.photo')} {i + 1}</span>
                      </div>
                    ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">{t('property.photo.disclaimer')}</p>

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
                  <FileText className="w-4 h-4" /> {t('property.brochure')}
                </button>
              </div>
              {favoriteMessage === 'added' && (
                <p className="text-sm text-green-600 mt-2">{t('property.favorite.added')}</p>
              )}
              {favoriteMessage === 'removed' && (
                <p className="text-sm text-gray-500 mt-2">{t('property.favorite.removed')}</p>
              )}
              {favoriteMessage === 'error' && (
                <p className="text-sm text-red-600 mt-2">{t('property.favorite.error')}</p>
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
                      <span className="text-gray-600">{t('property.management_fee')}</span>
                      <span className="font-medium">
                        {property.managementFee != null ? formatPrice(property.managementFee, 'rent') : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{t('property.deposit')}</span>
                      <span className="font-medium">
                        {property.deposit != null ? (property.deposit === 0 ? t('property.no_deposit') : formatPrice(property.deposit, 'rent')) : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{t('property.key_money')}</span>
                      <span className="font-medium">
                        {property.keyMoney != null ? (property.keyMoney === 0 ? t('property.no_key_money') : formatPrice(property.keyMoney, 'rent')) : '—'}
                      </span>
                    </div>
                  </>
                )}
                {source === 'buy' && property.managementFee != null && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{t('property.management_fee')}</span>
                    <span className="font-medium">{formatPrice(property.managementFee, 'rent')}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t('property.layout')}</span>
                  <span className="font-medium">{property.layout}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t('property.bedrooms')}</span>
                  <span className="font-medium">{property.beds}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t('property.size')}</span>
                  <span className="font-medium">{property.size} m²</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">{t('property.floor')}</span>
                  <span className="font-medium">{property.floor != null ? `${property.floor}F` : '—'}</span>
                </div>
              </div>
            </div>

            {/* Rental Fees pills (from DB) */}
            {source === 'rent' && (property.keyMoney != null || property.deposit != null) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('property.rental_fees')}</h3>
                <div className="flex flex-wrap gap-2">
                  {property.keyMoney === 0 && (
                    <span className="px-4 py-2 bg-[#C1121F]/10 text-[#C1121F] rounded-lg text-sm font-medium">{t('property.no_key_money')}</span>
                  )}
                  {property.keyMoney != null && property.keyMoney > 0 && (
                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">{t('property.key_money')}</span>
                  )}
                  {property.deposit != null && (
                    <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">{property.deposit === 0 ? t('property.no_deposit') : t('property.deposit')}</span>
                  )}
                </div>
              </div>
            )}

            {/* Property Features (only show when true in DB) */}
            {featureFlags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('property.features')}</h3>
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
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('property.information')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {descriptionExpanded
                  ? `${property.title} offers a comfortable living space of ${property.size} m² in ${property.address}, with ${property.beds} bedroom(s) and ${property.layout} layout. Located ${property.walkingMinutes} ${t('property.walk.min')} from ${property.station}, this property provides easy access to transport and local amenities.`
                  : `${property.title} offers a comfortable living space of ${property.size} m² in ${property.address}...`}
              </p>
              <button
                type="button"
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className="mt-2 text-sm font-medium text-[#C1121F] flex items-center gap-1"
              >
                {descriptionExpanded ? t('property.showLess') : t('property.readMore')} <ChevronDown className={`w-4 h-4 transition-transform ${descriptionExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Initial fees by card (only when enabled in DB) */}
            {source === 'rent' && property.initialFeesCreditCard && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('property.initial_fees_card')}</h3>
                <p className="text-xs text-gray-500 mb-4">{t('property.initial_fees_card_note')}</p>
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
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('property.location')}</h3>
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
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('property.tour.title')}</h3>
                {tourConfirmed ? (
                  <p className="text-sm text-green-600 py-2">{t('property.tour.success')}</p>
                ) : (
                <>
                <p className="text-xs text-gray-500 mb-4">{t('property.tour.instruction')}</p>
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
                          <label className="block text-xs text-gray-500 mb-1">{t('property.tour.time_range')}</label>
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
                  {tourError && (
                    <p className="text-xs text-red-600 mb-2">{tourError}</p>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      setTourError(null);
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) {
                        setTourError('Please sign in to your account to request a room tour.');
                        return;
                      }
                      const { data: tourRequest, error: tourError } = await supabase
                        .from('property_tour_requests')
                        .insert({
                          user_id: user.id,
                          property_id: Number(propertyId),
                        })
                        .select('id')
                        .single();
                      if (tourError || !tourRequest) {
                        setTourError(tourError?.message || t('property.tour.submit_error'));
                        return;
                      }
                      const filled = tourCandidates.filter((c) => c.date.trim() !== '');
                      if (filled.length > 0) {
                        const { error: candidatesError } = await supabase
                          .from('property_tour_request_candidates')
                          .insert(
                            filled.map((c) => ({
                              tour_request_id: tourRequest.id,
                              candidate_date: c.date,
                              time_range: c.timeRange,
                            }))
                          );
                        if (candidatesError) {
                          setTourError(candidatesError.message || 'Failed to save preferred times.');
                          return;
                        }
                      }
                      setTourConfirmed(true);
                      const userName = [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(' ') || user.email || '';
                      sendRequestEmails({
                        type: 'tour',
                        userEmail: user.email ?? '',
                        userName,
                        propertyId: Number(propertyId),
                        propertyTitle: property?.title ?? undefined,
                        candidateDates: filled.length > 0 ? filled : undefined,
                      }).then((r) => { if (!r.ok) console.error('[send-request-emails]', r.error); });
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
                  <p className="text-sm text-green-600 py-2">Property details request already submitted. A staff member will contact you within 24 hours.</p>
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
                      {inquiryLoading ? t('property.sending') : t('property.inquiry.submit')}
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
