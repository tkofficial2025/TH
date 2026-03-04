import { Header } from '@/app/components/Header';

interface CookiePolicyPageProps {
  onNavigate: (page: 'home' | 'buy' | 'rent' | 'consultation' | 'category' | 'blog' | 'about' | 'cookie') => void;
}

export function CookiePolicyPage({ onNavigate }: CookiePolicyPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={onNavigate} currentPage="about" />

      <div className="max-w-4xl mx-auto px-6 py-28 pb-20">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">Cookie Policy</h1>
        <p className="text-gray-500 text-center mb-10">Last Updated: March 4th, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
          <p>
            Jokyo Property Co., Ltd. (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) uses cookies and similar tracking technologies on our website (the &quot;Service&quot;) to distinguish you from other users of our Service. This helps us to provide you with a good experience when you browse our website, allows us to improve our site, and enables us to show you relevant content and advertisements.
          </p>
          <p>
            This Cookie Policy explains what cookies are, how we use them, the types of cookies we use, your choices regarding cookies, and further information about cookies. This policy complies with applicable laws in Japan, including the Act on the Protection of Personal Information (APPI).
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your computer, mobile device, or tablet when you visit a website. They are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>
            <p>
              Cookies set by the website owner (in this case, Jokyo Property Co., Ltd.) are called &quot;first-party cookies.&quot; Cookies set by parties other than the website owner are called &quot;third-party cookies.&quot; Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. How We Use Cookies</h2>
            <p>
              We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
            </p>
            <p className="font-semibold">Specifically, we use cookies to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ensure the website functions correctly.</li>
              <li>Understand how you use our website to improve our services.</li>
              <li>Remember your preferences and settings (such as language or search criteria).</li>
              <li>Deliver advertisements that are relevant to your interests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Types of Cookies We Use</h2>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Strictly Necessary Cookies</h3>
            <p>
              These cookies are essential for you to browse the website and use its features, such as accessing secure areas of the site. Without these cookies, services you have asked for cannot be provided. We do not require your consent to use these cookies as they are necessary for the operation of the website.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Analytics and Performance Cookies</h3>
            <p>
              These cookies collect information about how you use our website, such as which pages you visit most often and if you receive error messages from web pages. These cookies do not collect information that identifies you as an individual; all information these cookies collect is aggregated and therefore anonymous. It is only used to improve how a website works.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Advertising and Targeting Cookies</h3>
            <p>
              These cookies are used to deliver advertisements more relevant to you and your interests. They are also used to limit the number of times you see an advertisement as well as help measure the effectiveness of the advertising campaign. They are usually placed by advertising networks with the website operator&apos;s permission. They remember that you have visited a website and this information is shared with other organizations such as advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Third-Party Cookies</h2>
            <p>
              In addition to our own cookies, we may also use various third-parties cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Google Analytics</h3>
            <p>
              We use Google Analytics to help us understand how our customers use the site. Google Analytics uses cookies to collect information such as how often users visit this site, what pages they visit when they do so, and what other sites they used prior to coming to this site. We use the information we get from Google Analytics only to improve this site.
            </p>
            <p>
              For more information on how Google uses your data, please visit{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#C1121F] hover:underline">Google&apos;s Privacy &amp; Terms</a>.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">Advertising Partners</h3>
            <p>
              We work with third-party advertising companies to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Managing Cookies</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. Alternatively, you can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
            </p>
            <p>
              As the means by which you can refuse cookies through your web browser controls vary from browser-to-browser, you should visit your browser&apos;s help menu for more information. Below are links to manage cookies on common browsers:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#C1121F] hover:underline">Google Chrome</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#C1121F] hover:underline">Safari</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-[#C1121F] hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-[#C1121F] hover:underline">Microsoft Edge</a></li>
            </ul>
            <p>
              To opt out of being tracked by Google Analytics across all websites, visit{' '}
              <a href="http://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#C1121F] hover:underline">http://tools.google.com/dlpage/gaoptout</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Contact Information</h2>
            <p>
              If you have any questions about our use of cookies or other technologies, please contact us at:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mt-4">
              <p className="font-semibold text-gray-900">Jokyo Property Co., Ltd.</p>
              <p>Email: <a href="mailto:information@tkofficial.net" className="text-[#C1121F] hover:underline">information@tkofficial.net</a></p>
              <p>Address: 77 Space 102, 3-1-5 Kita-Otsuka, Toshima-ku, Tokyo 170-0004, Japan</p>
              <p>Website: <a href="https://www.tkofficial.net" target="_blank" rel="noopener noreferrer" className="text-[#C1121F] hover:underline">https://www.tkofficial.net</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
            </p>
            <p>
              The date at the top of this Cookie Policy indicates when it was last updated.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
