import { Header } from '@/app/components/Header';
import { MapPin, Phone, Mail, Award, Building2, Globe, Shield, CheckCircle2 } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: 'home' | 'buy' | 'rent' | 'consultation' | 'category' | 'blog' | 'about') => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={onNavigate} currentPage="about" />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1 h-12 bg-[#C1121F]"></div>
            <h1 className="text-4xl font-bold text-gray-900">About Us</h1>
          </div>
          <div className="max-w-4xl space-y-4 text-lg text-gray-700 leading-relaxed">
            <p>
              Tokyo Expat Housing (operated by Jokyo Property Co., Ltd.) is a Tokyo-based real estate service dedicated to international residents, students, and global clients.
            </p>
            <p>
              We specialize in helping international clients find ideal properties in Tokyo through clear communication, transparent fees, and full multilingual support.
            </p>
            <p>
              Our team brings diverse international experience, with backgrounds connected to the United States, China, and Korea. This global perspective enables us to understand cultural expectations, communication styles, and the unique challenges clients may face when relocating to Japan.
            </p>
            <p>
              Navigating Japan's housing system can be complex — from guarantor requirements to detailed contract procedures. Our role is to simplify the process and provide accurate, straightforward guidance at every step.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">

        {/* Company Profile Table */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-1 h-12 bg-[#C1121F]"></div>
            <h2 className="text-4xl font-bold text-gray-900">Company Profile</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 w-1/3">Company Name</td>
                  <td className="px-6 py-4 text-gray-700">
                    Jokyo Property Co., Ltd.<br />
                    <span className="text-gray-500">上京プロパティ株式会社</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 w-1/3">License</td>
                  <td className="px-6 py-4 text-gray-700">
                    Tokyo Governor License (1) No. 113518
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 w-1/3">Corporate Number</td>
                  <td className="px-6 py-4 text-gray-700">
                    6010501054967
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 w-1/3">Representative Director</td>
                  <td className="px-6 py-4 text-gray-700">
                    Kosei Kudo
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 w-1/3">Address</td>
                  <td className="px-6 py-4 text-gray-700">
                    77 Space 102, 3-1-5 Kita-Otsuka<br />
                    Toshima-ku, Tokyo 170-0004, Japan
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 w-1/3">Phone</td>
                  <td className="px-6 py-4 text-gray-700">
                    <a 
                      href="tel:+81359808304" 
                      className="hover:text-[#C1121F] transition-colors"
                    >
                      +81-3-5980-8304
                    </a>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 w-1/3">Email</td>
                  <td className="px-6 py-4 text-gray-700">
                    <a 
                      href="mailto:information@tkofficial.net?subject=Inquiry&body=Hello, I would like to inquire about..."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#C1121F] transition-colors"
                    >
                      information@tkofficial.net
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
