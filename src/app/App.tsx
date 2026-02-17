import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Shield, Globe, CheckCircle2, Home, MapPin } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { MobileMenu } from '@/app/components/MobileMenu';
import { QuickPropertySearch } from '@/app/components/QuickPropertySearch';
import { FeaturedPropertiesCarousel } from '@/app/components/FeaturedPropertiesCarousel';
import { Header } from '@/app/components/Header';
import { TokyoWardsSection } from '@/app/components/TokyoWardsSection';
import { BuyPropertiesPage } from '@/app/pages/BuyPropertiesPage';
import { RentPropertiesPage } from '@/app/pages/RentPropertiesPage';
import { PropertyDetailPage } from '@/app/pages/PropertyDetailPage';
import { ConsultationPage } from '@/app/pages/ConsultationPage';
import type { HeroSearchParams } from '@/lib/searchFilters';

type Page = 'home' | 'buy' | 'rent' | 'consultation';

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [currentPage, setCurrentPage] = useState<'home' | 'buy' | 'rent'>('home');
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const [heroSearchParams, setHeroSearchParams] = useState<HeroSearchParams | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [detailSource, setDetailSource] = useState<'rent' | 'buy'>('rent');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (page: Page) => {
    if (page === 'home') {
      setSelectedWard(null);
      setHeroSearchParams(null);
    }
    setSelectedPropertyId(null);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroSearch = (params: HeroSearchParams) => {
    setHeroSearchParams(params);
    setSelectedWard(null);
    setSelectedPropertyId(null);
    setCurrentPage(params.propertyType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWardClick = (wardName: string, page: 'rent' | 'buy') => {
    setSelectedWard(wardName);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProperty = (id: number, source: 'rent' | 'buy') => {
    setSelectedPropertyId(id);
    setDetailSource(source);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 物件詳細を表示中
  if (selectedPropertyId != null) {
    return (
      <PropertyDetailPage
        propertyId={selectedPropertyId}
        source={detailSource}
        onNavigate={handleNavigate}
        onBack={() => setSelectedPropertyId(null)}
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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Header onNavigate={handleNavigate} currentPage="home" />

      {/* Hero Section（overflow-visible で Selected Area ドロップダウンが切れないように） */}
      <section className="relative min-h-screen flex items-center justify-center pt-14">
        {/* Background: tokyo.jpg（この中だけ overflow-hidden で背景の scale をクリップ） */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/tokyo.jpg)',
              transform: `translateY(${scrollY * 0.3}px) scale(1.05)`,
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Licensed Broker</h3>
              <p className="text-gray-600">Fully licensed and regulated real estate agency in Japan</p>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">English Support</h3>
              <p className="text-gray-600">Complete support in English from start to finish</p>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Foreign-Friendly</h3>
              <p className="text-gray-600">Specialized in serving international buyers and renters</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Comprehensive real estate solutions tailored for international clients</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <div className="w-14 h-14 bg-[#C1121F]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#C1121F] transition-colors">
                <Home className="w-7 h-7 text-[#C1121F] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Buy Property</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Find your dream home in Tokyo. We guide you through the entire purchase process, from property search to closing.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-[#C1121F] mt-0.5 flex-shrink-0" />
                  <span>Property search and viewings</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-[#C1121F] mt-0.5 flex-shrink-0" />
                  <span>Legal and financial guidance</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-[#C1121F] mt-0.5 flex-shrink-0" />
                  <span>Negotiation and contract support</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8 }}
            >
              <div className="w-14 h-14 bg-[#C1121F]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#C1121F] transition-colors">
                <MapPin className="w-7 h-7 text-[#C1121F] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Rent & Live in Japan</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Settle into life in Tokyo. We help you find the perfect rental property and navigate the leasing process.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-[#C1121F] mt-0.5 flex-shrink-0" />
                  <span>Rental property search</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-[#C1121F] mt-0.5 flex-shrink-0" />
                  <span>Lease negotiation and translation</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-[#C1121F] mt-0.5 flex-shrink-0" />
                  <span>Move-in and relocation support</span>
                </li>
              </ul>
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
            <p className="text-xl text-gray-600">What sets us apart in the Japanese real estate market</p>
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
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">English-First Support</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our entire team is fluent in English, ensuring clear communication at every step. No language barriers, no misunderstandings—just seamless service tailored for international clients.
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
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Transparent Process</h3>
                <p className="text-gray-600 leading-relaxed">
                  We believe in complete transparency. From pricing to paperwork, we explain every detail in plain English so you can make informed decisions with confidence.
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
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Local Expertise</h3>
                <p className="text-gray-600 leading-relaxed">
                  With deep roots in Tokyo's real estate market, we offer insider knowledge and connections that only locals have. Get access to the best properties before they hit the market.
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
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-8 h-8 text-[#C1121F]" />
                <span className="text-2xl font-semibold">Tokyo Housing</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Your trusted partner for buying and renting in Japan. We provide English-first real estate services to international clients.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#C1121F] transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#C1121F] transition-colors">
                  <Shield className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Buy Property</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Rent & Live</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Property Management</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">© 2026 Tokyo Housing. All rights reserved.</p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}