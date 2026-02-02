import { Header } from '@/app/components/Header';
import { PropertyListingPage } from '@/app/components/PropertyListingPage';

interface BuyPropertiesPageProps {
  onNavigate?: (page: 'home' | 'buy' | 'rent') => void;
  selectedWard?: string | null;
  onSelectProperty?: (id: number) => void;
}

export function BuyPropertiesPage({ onNavigate, selectedWard, onSelectProperty }: BuyPropertiesPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} />
      <PropertyListingPage selectedWard={selectedWard} onSelectProperty={onSelectProperty} />
    </div>
  );
}