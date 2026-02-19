import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { geocodeAddress, type Coordinates } from '@/lib/geocoding';

// Leafletのデフォルトアイコンの問題を修正
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PropertyMapProps {
  address: string;
  title?: string;
  className?: string;
  height?: string;
}

/**
 * 地図の中心を更新するコンポーネント
 */
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}

export function PropertyMap({ address, title, className = '', height = '400px' }: PropertyMapProps) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoordinates() {
      if (!address) {
        setError('住所が指定されていません');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      const coords = await geocodeAddress(address);
      
      if (coords) {
        setCoordinates(coords);
      } else {
        setError('住所から位置を取得できませんでした');
      }
      
      setLoading(false);
    }

    loadCoordinates();
  }, [address]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <p className="text-gray-500">地図を読み込み中...</p>
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <p className="text-gray-500">{error || '地図を表示できません'}</p>
      </div>
    );
  }

  const center: [number, number] = [coordinates.lat, coordinates.lng];

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-200 ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenterUpdater center={center} />
        <Marker position={center}>
          <Popup>
            <div>
              <p className="font-semibold">{title || '物件位置'}</p>
              <p className="text-sm text-gray-600">{address}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
