import { Header } from '@/app/components/Header';

type NavPage = 'home' | 'buy' | 'rent' | 'consultation' | 'category' | 'blog' | 'about' | 'cookie' | 'terms';

interface TermsOfServicePageProps {
  onNavigate: (page: NavPage) => void;
}

export function TermsOfServicePage({ onNavigate }: TermsOfServicePageProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={onNavigate} currentPage="about" />

      <div className="max-w-4xl mx-auto px-6 py-28 pb-20">
        <p className="text-gray-600 text-center mb-1">Jokyo Property Co., Ltd.</p>
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-center mb-10">Last Updated: March 4th, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">1. Acceptance of Terms</h2>
            <p>
              These Terms of Service (hereinafter referred to as &quot;Terms&quot;) govern the use of the real estate search website and services (hereinafter referred to as the &quot;Service&quot;) provided by Jokyo Property Co., Ltd. (hereinafter referred to as the &quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            </p>
            <p>
              By accessing, browsing, or using the Service, you (hereinafter referred to as the &quot;User&quot;) acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must immediately cease using the Service. These Terms constitute a legally binding agreement between you and the Company.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">2. Description of Service</h2>
            <p>
              The Service is a platform specifically designed to assist foreign nationals in finding real estate properties in Japan. The Service provides users with access to property listings, search tools, and related information to facilitate the process of renting or purchasing real estate in Japan.
            </p>
            <p>
              The Company acts as an information provider and intermediary platform. While we strive to provide accurate information, the Company does not own the properties listed unless explicitly stated otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">3. User Eligibility</h2>
            <p>
              The Service is intended for use by individuals who are currently residing in Japan or are planning to move to Japan. By using the Service, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are at least 18 years of age or possess legal parental or guardian consent.</li>
              <li>You have the legal capacity to enter into a binding contract under Japanese law.</li>
              <li>All information you provide to the Company is truthful and accurate.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">4. User Account &amp; Registration</h2>
            <p>
              To access certain features of the Service, such as saving property searches or contacting agents, you may be required to register for an account.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">4.1 Registration Information</h3>
            <p>
              When creating an account, you agree to provide accurate, current, and complete information, specifically your full name and email address. You are responsible for maintaining the confidentiality of your account credentials.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">4.2 Account Security</h3>
            <p>
              You are solely responsible for all activities that occur under your account. You agree to notify the Company immediately of any unauthorized use of your account or any other breach of security. The Company will not be liable for any loss or damage arising from your failure to comply with this section.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">5. Prohibited Activities</h2>
            <p>In using the Service, you agree not to engage in any of the following prohibited activities:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violating any applicable laws, regulations, or third-party rights.</li>
              <li>Using the Service for any fraudulent or illegal purpose.</li>
              <li>Submitting false, misleading, or inaccurate information.</li>
              <li>Attempting to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running the Service.</li>
              <li>Copying, distributing, or disclosing any part of the Service in any medium, including without limitation by any automated or non-automated &quot;scraping.&quot;</li>
              <li>Using the Service to send spam, unsolicited communications, or chain letters.</li>
              <li>Impersonating another person or otherwise misrepresenting your affiliation with a person or entity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">6. Intellectual Property</h2>
            <p>
              All content included on the Service, such as text, graphics, logos, images, as well as the compilation thereof, and any software used on the Service, is the property of TK LLC. or its suppliers and protected by copyright and other laws that protect intellectual property and proprietary rights.
            </p>
            <p>
              You are granted a limited, non-exclusive, non-transferable license to access and use the Service strictly in accordance with these Terms. You agree not to modify, publish, transmit, reverse engineer, participate in the transfer or sale, create derivative works, or in any way exploit any of the content, in whole or in part.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">7. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. To the fullest extent permitted by law, the Company expressly disclaims all warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
            </p>
            <p>
              The Company makes no warranty that (i) the Service will meet your requirements; (ii) the Service will be uninterrupted, timely, secure, or error-free; (iii) the results that may be obtained from the use of the Service will be accurate or reliable; or (iv) the quality of any products, services, information, or other material obtained by you through the Service will meet your expectations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, in no event shall Jokyo Property Co., Ltd., its affiliates, agents, directors, employees, suppliers, or licensors be liable for any direct, indirect, punitive, incidental, special, consequential, or exemplary damages, including without limitation damages for loss of profits, goodwill, use, data, or other intangible losses, arising out of or relating to the use of, or inability to use, the Service.
            </p>
            <p>
              The Company assumes no liability or responsibility for any (i) errors, mistakes, or inaccuracies of content; (ii) personal injury or property damage, of any nature whatsoever, resulting from your access to and use of our Service; or (iii) any unauthorized access to or use of our secure servers and/or any and all personal information stored therein.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">9. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Japan, without regard to its conflict of law provisions. Any dispute arising from or relating to the subject matter of these Terms shall be subject to the exclusive jurisdiction of the Tokyo District Court or the Tokyo Summary Court as the court of first instance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">10. Changes to Terms</h2>
            <p>
              The Company reserves the right, at its sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p>
              By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">11. Contact Information</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <div className="bg-gray-50 rounded-lg p-6 mt-4">
              <p className="font-semibold text-gray-900">Jokyo Property Co., Ltd.</p>
              <p>Email: <a href="mailto:information@tkofficial.net" className="text-[#C1121F] hover:underline">information@tkofficial.net</a></p>
              <p>Address: 77 Space 102, 3-1-5 Kita-Otsuka, Toshima-ku, Tokyo 170-0004, Japan</p>
            </div>
          </section>

          <p className="text-gray-500 text-sm mt-12">© 2026 TK LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
