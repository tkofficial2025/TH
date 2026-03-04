import { Header } from '@/app/components/Header';

type NavPage = 'home' | 'buy' | 'rent' | 'consultation' | 'category' | 'blog' | 'about' | 'cookie' | 'terms' | 'privacy';

interface PrivacyPolicyPageProps {
  onNavigate: (page: NavPage) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={onNavigate} currentPage="about" />

      <div className="max-w-4xl mx-auto px-6 py-28 pb-20">
        <p className="text-gray-600 text-center mb-1">Jokyo Property Co., Ltd.</p>
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-center mb-2">Effective Date: March 4th, 2026</p>
        <p className="text-gray-500 text-center mb-10">Last Updated: March 4th, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">1. Introduction</h2>
            <p>
              Jokyo Property Co., Ltd. (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates a real estate search website dedicated to assisting foreign nationals in finding properties in Japan. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>
            <p>
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">2. Information We Collect</h2>
            <p>
              We collect information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with you (&quot;Personal Information&quot;). We collect the following categories of information:
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">A. Personal Information You Provide</h3>
            <p>
              We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, or otherwise contact us. The personal information we collect depends on the context of your interactions with us and the choices you make. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Full Name:</strong> To identify you as a user and prospective tenant/buyer.</li>
              <li><strong>Email Address:</strong> To communicate with you regarding your inquiries, property updates, and account information.</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">B. Information Automatically Collected</h3>
            <p>
              We automatically collect certain information when you visit, use, or navigate the website. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, and information about how and when you use our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">3. How We Use Your Information</h2>
            <p>
              We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>To Facilitate Property Searches:</strong> To connect you with real estate listings that match your criteria.</li>
              <li><strong>Communication:</strong> To send you administrative information, such as product, service, and new feature information, and/or information about changes to our terms, conditions, and policies.</li>
              <li><strong>Service Improvement:</strong> To analyze usage trends and determine the effectiveness of our promotional campaigns to improve our website and your experience.</li>
              <li><strong>Marketing:</strong> With your consent, we may send you marketing emails about new listings or services that may interest you. You can opt-out at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">4. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out below.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Google Analytics</h3>
            <p>
              We use Google Analytics to analyze user activity in order to improve the website. Google Analytics uses cookies to collect information such as your IP address, browser type, referring page, and time spent on the site. This data is aggregated and anonymized. You can opt-out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Advertising Cookies</h3>
            <p>
              We may use third-party advertising companies to serve ads when you visit the website. These companies may use information about your visits to this and other websites contained in web cookies to provide advertisements about goods and services of interest to you.
            </p>
            <p>
              Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">5. Sharing of Information</h2>
            <p>
              We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may process or share your data that we hold based on the following legal bases:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Property Owners and Agents:</strong> To facilitate the rental or purchase process, we may share your Name and Email Address with real estate agents or property owners for the properties you have inquired about.</li>
              <li><strong>Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work (e.g., data analysis, email delivery, hosting services).</li>
              <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">6. Data Retention</h2>
            <p>
              We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">7. Your Rights (Under Japanese Law)</h2>
            <p>
              Under the Act on the Protection of Personal Information (APPI) of Japan, you have specific rights regarding your personal data held by us. These rights include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Request Disclosure:</strong> You have the right to request that we disclose the personal data we hold about you.</li>
              <li><strong>Right to Correction:</strong> You have the right to request the correction, addition, or deletion of your personal data if it is factually incorrect.</li>
              <li><strong>Right to Suspension of Use:</strong> You have the right to request that we stop using or delete your personal data if it is being used for purposes other than those stated, or if it was acquired by improper means.</li>
              <li><strong>Right to Restrict Third-Party Provision:</strong> You have the right to request that we stop providing your data to third parties if such provision violates the law.</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the contact information provided below. We will respond to your request in accordance with applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">8. Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our website is at your own risk. You should only access the services within a secure environment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">9. Children&apos;s Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 18. We do not knowingly solicit data from or market to children under 18 years of age. By using the website, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent&apos;s use of the website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. The updated version will be indicated by an updated &quot;Revised&quot; date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy policy frequently to be informed of how we are protecting your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">11. Contact Information</h2>
            <p>
              If you have questions or comments about this policy, or if you wish to exercise your rights under Japanese law, you may contact us at:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mt-4">
              <p className="font-semibold text-gray-900">Jokyo Property Co., Ltd.</p>
              <p>Address: 77 Space 102, 3-1-5 Kita-Otsuka, Toshima-ku, Tokyo 170-0004, Japan</p>
              <p>Email: <a href="mailto:information@tkofficial.net" className="text-[#C1121F] hover:underline">information@tkofficial.net</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">12. Governing Law</h2>
            <p>
              This Privacy Policy and any disputes related thereto shall be governed by and construed in accordance with the laws of Japan, specifically the Act on the Protection of Personal Information (APPI). Any legal action or proceeding relating to your access to or use of the website or this Privacy Policy shall be instituted in a competent court in Tokyo, Japan.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
