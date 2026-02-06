import { Header } from '@/app/components/Header';
import { PropertyListingPage } from '@/app/components/PropertyListingPage';

interface BuyPropertiesPageProps {
  onNavigate?: (page: 'home' | 'buy' | 'rent') => void;
}

export function BuyPropertiesPage({ onNavigate }: BuyPropertiesPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} />
      <PropertyListingPage />
    </div>
  );
}