import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Shield, Globe, CheckCircle2, Home, MapPin, Phone, Mail, Award, Instagram, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { MobileMenu } from '@/app/components/MobileMenu';
import { QuickPropertySearch } from '@/app/components/QuickPropertySearch';
import { FeaturedPropertiesCarousel } from '@/app/components/FeaturedPropertiesCarousel';
import { Header } from '@/app/components/Header';
import { TokyoWardsSection } from '@/app/components/TokyoWardsSection';
import { RentalCategoriesSection } from '@/app/components/RentalCategoriesSection';
import { BuyPropertiesPage } from '@/app/pages/BuyPropertiesPage';
import { RentPropertiesPage } from '@/app/pages/RentPropertiesPage';
import { PropertyDetailPage } from '@/app/pages/PropertyDetailPage';
import { ConsultationPage } from '@/app/pages/ConsultationPage';
import { CategoryPropertiesPage } from '@/app/pages/CategoryPropertiesPage';
import { BlogPage } from '@/app/pages/BlogPage';
import { BlogPostDetailPage } from '@/app/pages/BlogPostDetailPage';
import { AboutPage } from '@/app/pages/AboutPage';
import { CookiePolicyPage } from '@/app/pages/CookiePolicyPage';
import { TermsOfServicePage } from '@/app/pages/TermsOfServicePage';
import { PrivacyPolicyPage } from '@/app/pages/PrivacyPolicyPage';
import { MyAccountPage } from '@/app/pages/MyAccountPage';
import { SignUpPage } from '@/app/pages/SignUpPage';
import { FavoritesPage } from '@/app/pages/FavoritesPage';
import { ActivityPage } from '@/app/pages/ActivityPage';
import { ProfilePage } from '@/app/pages/ProfilePage';
import type { HeroSearchParams } from '@/lib/searchFilters';
import {
  type Page,
  getPageFromPath,
  getPathFromPage,
  getPathname,
  pushState,
  replaceState,
} from '@/lib/routes';

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [currentPage, setCurrentPage] = useState<Page>(() => getPageFromPath(getPathname()));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [heroSearchParams, setHeroSearchParams] = useState<HeroSearchParams | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [detailSource, setDetailSource] = useState<'rent' | 'buy'>('rent');
  const [selectedBlogPostId, setSelectedBlogPostId] = useState<number | null>(null);

  // 初回ロード・ブラウザバック/フォワード: URL から状態を復元
  useEffect(() => {
    const syncFromUrl = () => {
      const path = getPathname();
      const params = new URLSearchParams(window.location.search);
      const page = getPageFromPath(path);
      setCurrentPage(page);
      const propId = params.get('property');
      const source = params.get('source') as 'rent' | 'buy' | null;
      if (propId && !isNaN(Number(propId))) {
        setSelectedPropertyId(Number(propId));
        if (source === 'rent' || source === 'buy') setDetailSource(source);
      } else {
        setSelectedPropertyId(null);
      }
      const cat = params.get('category');
      setSelectedCategory(cat ?? null);
      const postId = params.get('post');
      setSelectedBlogPostId(postId && !isNaN(Number(postId)) ? Number(postId) : null);
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  const handleNavigate = (page: Page, options?: { categoryId?: string; blogPostId?: number }) => {
    if (page === 'home') {
      setSelectedWard(null);
      setHeroSearchParams(null);
      setSelectedCategory(null);
    }
    setSelectedPropertyId(null);
    setSelectedBlogPostId(options?.blogPostId ?? null);
    setSelectedCategory(options?.categoryId ?? null);
    setCurrentPage(page);
    const path = getPathFromPage(page);
    const search =
      page === 'category' && options?.categoryId
        ? `?category=${encodeURIComponent(options.categoryId)}`
        : page === 'blog' && options?.blogPostId != null
          ? `?post=${options.blogPostId}`
          : '';
    pushState(path, search || undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroSearch = (params: HeroSearchParams) => {
    setHeroSearchParams(params);
    setSelectedWard(null);
    setSelectedPropertyId(null);
    setCurrentPage(params.propertyType);
    pushState(getPathFromPage(params.propertyType));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWardClick = (wardName: string, page: 'rent' | 'buy') => {
    setSelectedWard(wardName);
    setCurrentPage(page);
    pushState(getPathFromPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProperty = (id: number, source: 'rent' | 'buy') => {
    setSelectedPropertyId(id);
    setDetailSource(source);
    const path = getPathFromPage(source);
    pushState(path, `?property=${id}&source=${source}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromProperty = () => {
    setSelectedPropertyId(null);
    replaceState(getPathFromPage(detailSource));
  };

  const handleBackFromBlogPost = () => {
    setSelectedBlogPostId(null);
    replaceState(getPathFromPage('blog'));
  };

  // 物件詳細を表示中
  if (selectedPropertyId != null) {
    return (
      <PropertyDetailPage
        propertyId={selectedPropertyId}
        source={detailSource}
        onNavigate={handleNavigate}
        onBack={handleBackFromProperty}
      />
    );
  }

  if (currentPage === 'buy') {
    return (
      <BuyPropertiesPage
        onNavigate={handleNavigate}
        selectedWard={selectedWard}
        onSelectProperty={(id) => handleSelectProperty(id, 'buy')}
        initialSearchParams={heroSearchParams?.propertyType === 'buy' ? heroSearchParams : undefined}
      />
    );
  }

  if (currentPage === 'rent') {
    return (
      <RentPropertiesPage
        onNavigate={handleNavigate}
        selectedWard={selectedWard}
        onSelectProperty={(id) => handleSelectProperty(id, 'rent')}
        initialSearchParams={heroSearchParams?.propertyType === 'rent' ? heroSearchParams : undefined}
      />
    );
  }

  if (currentPage === 'consultation') {
    return <ConsultationPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'category') {
    return (
      <CategoryPropertiesPage
        onNavigate={handleNavigate}
        categoryId={selectedCategory || undefined}
        onSelectProperty={(id, source) => handleSelectProperty(id, source)}
      />
    );
  }

  if (currentPage === 'blog') {
    if (selectedBlogPostId != null) {
      return (
        <BlogPostDetailPage
          postId={selectedBlogPostId}
          onNavigate={handleNavigate}
          onBack={handleBackFromBlogPost}
        />
      );
    }
    return (
      <BlogPage
        onNavigate={handleNavigate}
        onSelectPost={(postId) => {
          setSelectedBlogPostId(postId);
          pushState(getPathFromPage('blog'), `?post=${postId}`);
        }}
      />
    );
  }

  if (currentPage === 'about') {
    return <AboutPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'cookie') {
    return <CookiePolicyPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'terms') {
    return <TermsOfServicePage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'privacy') {
    return <PrivacyPolicyPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'account') {
    return <MyAccountPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'signup') {
    return <SignUpPage onNavigate={handleNavigate} />;
  }

  if (currentPage === 'favorites') {
    return <FavoritesPage onNavigate={handleNavigate} onSelectProperty={handleSelectProperty} />;
  }

  if (currentPage === 'activity') {
    return <ActivityPage onNavigate={handleNavigate} onSelectProperty={handleSelectProperty} />;
  }

  if (currentPage === 'profile') {
    return <ProfilePage onNavigate={handleNavigate} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Header onNavigate={handleNavigate} currentPage={currentPage} />

      {/* Hero Section（overflow-visible で Selected Area ドロップダウンが切れないように） */}
      <section className="relative min-h-screen flex items-center justify-center pt-14">
        {/* Background: tokyo.jpg（この中だけ overflow-hidden で背景の scale をクリップ） */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/tokyo.jpg)',
              transform: 'scale(1.05)',
            }}
          />
        </div>

        {/* Hero Content（文字だけ影で見やすく） */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32 pb-48">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1
                className="text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
                style={{ textShadow: '0 6px 12px rgba(0,0,0,0.5)' }}
              >
                Your Gateway to <br />
                <span className="text-[#C1121F]" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>Japanese Real Estate</span>
              </h1>
            </motion.div>
            
            <motion.p
              className="text-xl lg:text-2xl text-white/95 mb-12 leading-relaxed"
              style={{ textShadow: '0 6px 12px rgba(0,0,0,0.6)' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Buy and Live in Japan with Confidence
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <button
                type="button"
                onClick={() => handleNavigate('consultation')}
                className="px-8 py-4 bg-[#C1121F] text-white rounded-xl font-semibold hover:bg-[#A00F1A] transition-all hover:scale-105 hover:shadow-xl shadow-lg"
              >
                Book Free Consultation
              </button>
              <button
                type="button"
                onClick={() => {
                  // フッターのソーシャルメディアセクションまでスクロール
                  const footer = document.querySelector('footer');
                  if (footer) {
                    footer.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-8 py-4 bg-white/90 backdrop-blur-sm text-gray-900 rounded-xl font-semibold hover:bg-white transition-all hover:scale-105 hover:shadow-xl shadow-lg border border-white/20"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
              >
                Contact Us on Social Media
              </button>
            </motion.div>

            {/* Quick Property Search Module */}
            <div className="mt-8">
              <QuickPropertySearch onSearch={handleHeroSearch} />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex items-start justify-center p-2">
            <motion.div 
              className="w-1.5 h-1.5 bg-gray-400 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Properties Carousel */}
      <FeaturedPropertiesCarousel onSelectProperty={handleSelectProperty} />

      {/* Rental Categories Section */}
      <RentalCategoriesSection onCategoryClick={(categoryId) => {
        handleNavigate('category', { categoryId });
      }} />

      {/* Tokyo Wards Section */}
      <TokyoWardsSection onWardClick={handleWardClick} />

      {/* Trust Indicators */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="flex flex-col items-center text-center p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-[#C1121F]/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-[#C1121F]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Licensed & Compliant Brokerage</h3>
              <p className="text-gray-600">Officially registered under Japanese real estate law with full regulatory compliance and transparent transaction management.</p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center text-center p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-16 h-16 bg-[#C1121F]/10 rounded-full flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-[#C1121F]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multilingual Professional Support (EN / JP / CN / KR)</h3>
              <p className="text-gray-600">Dedicated multilingual team providing contract explanation, negotiation, and full transaction assistance.</p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center text-center p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-[#C1121F]/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#C1121F]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Foreign Resident Specialists</h3>
              <p className="text-gray-600">Extensive experience assisting expats and non-Japanese residents with rentals and purchases.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services and Processes Section */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Our Process</h2>
          </motion.div>

          <div className="space-y-8">
            {/* Step 1 */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#C1121F] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Initial Consultation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Contact us via email, LINE, WeChat, Whatsapp, Instagram, or the inquiry form.
                    Share your goals (rent or purchase), budget, preferred area, timeline, and any special requirements.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#C1121F] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Property Proposal</h3>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Based on your needs, we carefully select suitable properties and provide:
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#C1121F] mt-0.5 flex-shrink-0" />
                      <span>Photos & floor plans</span>
                    </li>
                    <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#C1121F] mt-0.5 flex-shrink-0" />
                      <span>Pricing details</span>
                </li>
                    <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#C1121F] mt-0.5 flex-shrink-0" />
                      <span>Estimated initial costs</span>
                </li>
                    <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#C1121F] mt-0.5 flex-shrink-0" />
                      <span>Key property information</span>
                </li>
              </ul>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#C1121F] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Viewing (In-Person or Online)</h3>
                  <p className="text-gray-600 leading-relaxed">
                    You may visit the property in person or join an online viewing via Zoom.
                    We explain the property condition, neighborhood, and relevant considerations.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#C1121F] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Application or Purchase Offer</h3>
                  <p className="text-gray-600 leading-relaxed">
                    <strong>For Rentals:</strong> We assist with the rental application and required documentation.<br />
                    <strong>For Purchases:</strong> We help prepare and submit a formal purchase offer.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 5 */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#C1121F] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Screening or Negotiation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    <strong>Rentals:</strong> Landlord screening (2–5 business days).<br />
                    <strong>Purchases:</strong> Price negotiation and agreement on terms.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 6 */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#C1121F] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  6
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Contract Preparation & Explanation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We prepare the contract documents and clearly explain all terms and conditions in English before signing.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 7 */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#C1121F] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  7
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Payment & Final Procedures</h3>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    <strong>Rentals:</strong> Initial move-in costs (deposit, key money, agency fee, etc.)<br />
                    <strong>Purchases:</strong> Deposit payment and remaining balance settlement
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    We guide you through every payment step.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step 8 */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#C1121F] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  8
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Key Handover</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Once procedures are completed, you receive the keys and officially take possession of your new home.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Tokyo Housing Section */}
      <section id="why-us" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Why Tokyo Housing</h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                <div className="w-12 h-1 bg-[#C1121F] mb-6"></div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Multilingual Professional Support (EN / JP / CN / KR)</h3>
                <p className="text-gray-600 leading-relaxed">
                  Full support in four languages, ensuring accurate communication from property search to contract signing.
                  No misunderstandings — just clear guidance tailored for international clients.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="mb-6">
                <div className="w-12 h-1 bg-[#C1121F] mb-6"></div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Strong Approval Expertise for Foreign Clients</h3>
                <p className="text-gray-600 leading-relaxed">
                  We understand which properties and guarantor companies are more foreigner-friendly.
                  Our structured approach helps maximize rental approval success and smooth transactions.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-6">
                <div className="w-12 h-1 bg-[#C1121F] mb-6"></div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Fast, Transparent & Structured Process</h3>
                <p className="text-gray-600 leading-relaxed">
                  We work with clear timelines and proactive coordination to meet your move-in goals.
                  Every step — from pricing to paperwork — is explained clearly so you can move forward with confidence.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-[#C1121F] relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Schedule a free consultation with our expert team. We'll guide you through every step of finding your perfect property in Japan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                type="button"
                onClick={() => handleNavigate('consultation')}
                className="px-8 py-4 bg-white text-[#C1121F] rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
              >
                Book Free Consultation
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('buy')}
                className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-semibold hover:bg-white hover:text-[#C1121F] transition-all hover:scale-105"
              >
                Browse Properties
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-semibold">Tokyo Housing</span>
              </div>
              
              {/* Company Info */}
              <div className="mb-6">
                <p className="text-gray-300 font-medium mb-2">
                  Operated by Jokyo Property Co., Ltd.　上京プロパティ株式会社
                </p>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <Award className="w-4 h-4 text-[#C1121F] flex-shrink-0" />
                  <span>Tokyo Governor License (1) No. 113518</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C1121F] flex-shrink-0 mt-0.5" />
                  <div className="text-gray-400 text-sm">
                    <p>77 Space 102, 3-1-5 Kita-Otsuka</p>
                    <p>Toshima-ku, Tokyo 170-0004, Japan</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#C1121F] flex-shrink-0" />
                  <a href="tel:+81359808304" className="text-gray-400 hover:text-white transition-colors text-sm">
                    +81-3-5980-8304
                  </a>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#C1121F] flex-shrink-0" />
                  <a 
                    href="mailto:information@tkofficial.net?subject=Inquiry&body=Hello,%0D%0A%0D%0A" 
                    className="text-gray-400 hover:text-white transition-colors text-sm underline decoration-transparent hover:decoration-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    information@tkofficial.net
                  </a>
                </div>
              </div>

              {/* Social Media Icons */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-gray-400 text-sm mb-3">Follow Us</p>
                <div className="flex gap-3">
                  <a 
                    href="https://www.instagram.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#C1121F] transition-colors group"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </a>
                  <a 
                    href="https://line.me/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#C1121F] transition-colors group"
                    aria-label="LINE"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 50 50" 
                      className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors fill-current"
                    >
                      <path d="M 9 4 C 6.24 4 4 6.24 4 9 L 4 41 C 4 43.76 6.24 46 9 46 L 41 46 C 43.76 46 46 43.76 46 41 L 46 9 C 46 6.24 43.76 4 41 4 L 9 4 z M 25 11 C 33.27 11 40 16.359219 40 22.949219 C 40 25.579219 38.959297 27.960781 36.779297 30.300781 C 35.209297 32.080781 32.660547 34.040156 30.310547 35.660156 C 27.960547 37.260156 25.8 38.519609 25 38.849609 C 24.68 38.979609 24.44 39.039062 24.25 39.039062 C 23.59 39.039062 23.649219 38.340781 23.699219 38.050781 C 23.739219 37.830781 23.919922 36.789063 23.919922 36.789062 C 23.969922 36.419063 24.019141 35.830937 23.869141 35.460938 C 23.699141 35.050938 23.029062 34.840234 22.539062 34.740234 C 15.339063 33.800234 10 28.849219 10 22.949219 C 10 16.359219 16.73 11 25 11 z M 23.992188 18.998047 C 23.488379 19.007393 23 19.391875 23 20 L 23 26 C 23 26.552 23.448 27 24 27 C 24.552 27 25 26.552 25 26 L 25 23.121094 L 27.185547 26.580078 C 27.751547 27.372078 29 26.973 29 26 L 29 20 C 29 19.448 28.552 19 28 19 C 27.448 19 27 19.448 27 20 L 27 23 L 24.814453 19.419922 C 24.602203 19.122922 24.294473 18.992439 23.992188 18.998047 z M 15 19 C 14.448 19 14 19.448 14 20 L 14 26 C 14 26.552 14.448 27 15 27 L 18 27 C 18.552 27 19 26.552 19 26 C 19 25.448 18.552 25 18 25 L 16 25 L 16 20 C 16 19.448 15.552 19 15 19 z M 21 19 C 20.448 19 20 19.448 20 20 L 20 26 C 20 26.552 20.448 27 21 27 C 21.552 27 22 26.552 22 26 L 22 20 C 22 19.448 21.552 19 21 19 z M 31 19 C 30.448 19 30 19.448 30 20 L 30 26 C 30 26.552 30.448 27 31 27 L 34 27 C 34.552 27 35 26.552 35 26 C 35 25.448 34.552 25 34 25 L 32 25 L 32 24 L 34 24 C 34.553 24 35 23.552 35 23 C 35 22.448 34.553 22 34 22 L 32 22 L 32 21 L 34 21 C 34.552 21 35 20.552 35 20 C 35 19.448 34.552 19 34 19 L 31 19 z"></path>
                    </svg>
                  </a>
                  <a 
                    href="https://wa.me/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#C1121F] transition-colors group"
                    aria-label="WhatsApp"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 50 50" 
                      className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors fill-current"
                    >
                      <path d="M25,2C12.318,2,2,12.318,2,25c0,3.96,1.023,7.854,2.963,11.29L2.037,46.73c-0.096,0.343-0.003,0.711,0.245,0.966 C2.473,47.893,2.733,48,3,48c0.08,0,0.161-0.01,0.24-0.029l10.896-2.699C17.463,47.058,21.21,48,25,48c12.682,0,23-10.318,23-23 S37.682,2,25,2z M36.57,33.116c-0.492,1.362-2.852,2.605-3.986,2.772c-1.018,0.149-2.306,0.213-3.72-0.231 c-0.857-0.27-1.957-0.628-3.366-1.229c-5.923-2.526-9.791-8.415-10.087-8.804C15.116,25.235,13,22.463,13,19.594 s1.525-4.28,2.067-4.864c0.542-0.584,1.181-0.73,1.575-0.73s0.787,0.005,1.132,0.021c0.363,0.018,0.85-0.137,1.329,1.001 c0.492,1.168,1.673,4.037,1.819,4.33c0.148,0.292,0.246,0.633,0.05,1.022c-0.196,0.389-0.294,0.632-0.59,0.973 s-0.62,0.76-0.886,1.022c-0.296,0.291-0.603,0.606-0.259,1.19c0.344,0.584,1.529,2.493,3.285,4.039 c2.255,1.986,4.158,2.602,4.748,2.894c0.59,0.292,0.935,0.243,1.279-0.146c0.344-0.39,1.476-1.703,1.869-2.286 s0.787-0.487,1.329-0.292c0.542,0.194,3.445,1.604,4.035,1.896c0.59,0.292,0.984,0.438,1.132,0.681 C37.062,30.587,37.062,31.755,36.57,33.116z"></path>
                    </svg>
                  </a>
                  <a 
                    href="https://weixin.qq.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#C1121F] transition-colors group"
                    aria-label="WeChat"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 50 50" 
                      className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors fill-current"
                    >
                      <path d="M 19 6 C 9.625 6 2 12.503906 2 20.5 C 2 24.769531 4.058594 28.609375 7.816406 31.390625 L 5.179688 39.304688 L 13.425781 34.199219 C 15.714844 34.917969 18.507813 35.171875 21.203125 34.875 C 23.390625 39.109375 28.332031 42 34 42 C 35.722656 42 37.316406 41.675781 38.796875 41.234375 L 45.644531 45.066406 L 43.734375 38.515625 C 46.3125 36.375 48 33.394531 48 30 C 48 23.789063 42.597656 18.835938 35.75 18.105469 C 34.40625 11.152344 27.367188 6 19 6 Z M 13 14 C 14.101563 14 15 14.898438 15 16 C 15 17.101563 14.101563 18 13 18 C 11.898438 18 11 17.101563 11 16 C 11 14.898438 11.898438 14 13 14 Z M 25 14 C 26.101563 14 27 14.898438 27 16 C 27 17.101563 26.101563 18 25 18 C 23.898438 18 23 17.101563 23 16 C 23 14.898438 23.898438 14 25 14 Z M 34 20 C 40.746094 20 46 24.535156 46 30 C 46 32.957031 44.492188 35.550781 42.003906 37.394531 L 41.445313 37.8125 L 42.355469 40.933594 L 39.105469 39.109375 L 38.683594 39.25 C 37.285156 39.71875 35.6875 40 34 40 C 27.253906 40 22 35.464844 22 30 C 22 24.535156 27.253906 20 34 20 Z M 29.5 26 C 28.699219 26 28 26.699219 28 27.5 C 28 28.300781 28.699219 29 29.5 29 C 30.300781 29 31 28.300781 31 27.5 C 31 26.699219 30.300781 26 29.5 26 Z M 38.5 26 C 37.699219 26 37 26.699219 37 27.5 C 37 28.300781 37.699219 29 38.5 29 C 39.300781 29 40 28.300781 40 27.5 C 40 26.699219 39.300781 26 38.5 26 Z"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-6 flex items-center gap-2">
                <Home className="w-5 h-5 text-[#C1121F]" />
                Services
              </h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleNavigate('buy')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                  >
                    <div className="w-1.5 h-1.5 bg-[#C1121F] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span>Buy Property</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('rent')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                  >
                    <div className="w-1.5 h-1.5 bg-[#C1121F] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span>Rent & Live</span>
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#C1121F]" />
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => handleNavigate('about')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group w-full text-left"
                  >
                    <div className="w-1.5 h-1.5 bg-[#C1121F] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span>About Us</span>
                  </button>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <div className="w-1.5 h-1.5 bg-[#C1121F] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span>Contact</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <div className="w-1.5 h-1.5 bg-[#C1121F] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span>Blog</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">© 2026 TK LLC. All Rights Reserved.</p>
              <div className="flex gap-6 text-sm">
                <button type="button" onClick={() => handleNavigate('privacy')} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-sm">Privacy Policy</button>
                <button type="button" onClick={() => handleNavigate('terms')} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-sm">Terms of Service</button>
                <button type="button" onClick={() => handleNavigate('cookie')} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-sm">Cookie Policy</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}