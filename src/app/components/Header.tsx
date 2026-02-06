import { useState } from 'react';
import { Building2, ChevronDown, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onNavigate?: (page: 'home' | 'buy' | 'rent') => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const [activeNav, setActiveNav] = useState('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (itemName: string, href: string) => {
    setActiveNav(itemName);
    
    // Handle navigation to different pages
    if (itemName === 'Buy' && onNavigate) {
      onNavigate('buy');
    } else if (itemName === 'Rent' && onNavigate) {
      onNavigate('rent');
    } else if (itemName === 'Home' && onNavigate) {
      onNavigate('home');
    } else if (href.startsWith('#') && href.length > 1) {
      // Handle hash navigation for same page (only if href is more than just '#')
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navItems = [
    { name: 'Home', href: '#' },
    { name: 'Buy', href: '#properties' },
    { name: 'Rent', href: '#properties' },
    { name: 'Blog', href: '#' },
    { name: 'About', href: '#why-us', hasDropdown: true },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Building2 className="w-7 h-7 text-[#C1121F]" />
              <span className="text-xl font-semibold text-gray-900">Tokyo Housing</span>
            </div>

            {/* Desktop Navigation - Pill Container */}
            <nav className="hidden lg:flex items-center bg-gray-100 rounded-full px-2 py-2">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => handleNavClick(item.name, item.href)}
                  className={`
                    relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200
                    flex items-center gap-1
                    ${
                      activeNav === item.name
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/50'
                    }
                  `}
                >
                  {item.name}
                  {item.hasDropdown && (
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  )}
                </a>
              ))}
            </nav>

            {/* Right Section - Utilities & CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language Selector */}
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                EN
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* Currency Selector */}
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
                ¥
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-gray-200 mx-1" />

              {/* Free Consultation CTA */}
              <button className="px-5 py-2 text-sm font-semibold text-[#C1121F] border-2 border-[#C1121F] rounded-full hover:bg-[#C1121F] hover:text-white transition-all duration-200">
                Free Consultation
              </button>

              {/* My Account Button */}
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                <User className="w-4 h-4" />
                My account
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-20 left-0 right-0 z-40 bg-white border-b border-gray-100 lg:hidden overflow-hidden"
          >
            <div className="px-6 py-6 space-y-1">
              {/* Mobile Navigation */}
              <div className="bg-gray-100 rounded-2xl p-2 space-y-1 mb-6">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      handleNavClick(item.name, item.href);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      block px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      flex items-center justify-between
                      ${
                        activeNav === item.name
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-200/50'
                      }
                    `}
                  >
                    {item.name}
                    {item.hasDropdown && (
                      <ChevronDown className="w-4 h-4 opacity-70" />
                    )}
                  </a>
                ))}
              </div>

              {/* Mobile Utilities */}
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl">
                  EN
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl">
                  ¥
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>
              </div>

              {/* Mobile CTAs */}
              <div className="space-y-3 pt-4">
                <button className="w-full px-5 py-3 text-sm font-semibold text-[#C1121F] border-2 border-[#C1121F] rounded-xl hover:bg-[#C1121F] hover:text-white transition-all duration-200">
                  Free Consultation
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl">
                  <User className="w-4 h-4" />
                  My account
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}