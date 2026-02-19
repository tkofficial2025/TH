import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Supercluster from 'supercluster';
import { geocodeAddresses, type Coordinates } from '@/lib/geocoding';
import { type Property } from '@/lib/properties';
import { useCurrency } from '@/app/contexts/CurrencyContext';

// Leafletのデフォルトアイコンの問題を修正
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PropertiesMapViewProps {
  properties: Property[];
  onPropertyClick?: (propertyId: number) => void;
  className?: string;
  height?: string;
}

/**
 * 地図の表示範囲を自動調整するコンポーネント
 */
function MapBoundsUpdater({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [map, bounds]);
  return null;
}

/**
 * ズームレベルに応じてクラスターを更新するコンポーネント
 */
function ClusterUpdater({ 
  cluster, 
  onPropertyClick 
}: { 
  cluster: Supercluster; 
  onPropertyClick?: (propertyId: number) => void;
}) {
  const map = useMap();
  const { formatPrice } = useCurrency();
  const [clusters, setClusters] = useState<any[]>([]);

  useEffect(() => {
    const updateClusters = () => {
      const bounds = map.getBounds();
      const bbox: [number, number, number, number] = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ];
      const zoom = Math.floor(map.getZoom());
      const newClusters = cluster.getClusters(bbox, zoom);
      setClusters(newClusters);
    };

    updateClusters();
    map.on('moveend', updateClusters);
    map.on('zoomend', updateClusters);

    return () => {
      map.off('moveend', updateClusters);
      map.off('zoomend', updateClusters);
    };
  }, [map, cluster]);

  return (
    <>
      {clusters.map((point) => {
        const [lng, lat] = point.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount } = point.properties;

        if (isCluster) {
          // クラスターアイコン（テーマ色に統一）
          const themeColor = '#C1121F';
          const clusterIcon = L.divIcon({
            className: 'cluster-marker',
            html: `
              <div style="
                background-color: ${themeColor};
                color: white;
                width: ${pointCount < 10 ? '36px' : pointCount < 100 ? '42px' : '48px'};
                height: ${pointCount < 10 ? '36px' : pointCount < 100 ? '42px' : '48px'};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: ${pointCount < 10 ? '14px' : pointCount < 100 ? '16px' : '18px'};
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 3px solid white;
                cursor: pointer;
              ">
                ${pointCount}
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

          return (
            <Marker
              key={`cluster-${point.id}`}
              position={[lat, lng]}
              icon={clusterIcon}
              eventHandlers={{
                click: () => {
                  const expansionZoom = Math.min(
                    cluster.getClusterExpansionZoom(point.id as number),
                    18
                  );
                  map.setView([lat, lng], expansionZoom, {
                    animate: true,
                  });
                },
              }}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">{pointCount} properties</p>
                  <p className="text-xs text-gray-500">Click to zoom in</p>
                </div>
              </Popup>
            </Marker>
          );
        } else {
          // 個別の物件マーカー
          const property = point.properties.property as Property;
          const priceText = formatPrice(property.price, property.type === 'rent' ? 'rent' : 'buy');
          // テーマ色に統一
          const themeColor = '#C1121F';

          const customIcon = L.divIcon({
            className: 'custom-price-marker',
            html: `
              <div style="
                background-color: ${themeColor};
                color: white;
                padding: 8px 14px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: bold;
                white-space: nowrap;
                box-shadow: 0 3px 8px rgba(0,0,0,0.4);
                border: 3px solid white;
                cursor: pointer;
                line-height: 1.3;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                min-width: fit-content;
                display: inline-block;
              ">
                ${priceText}
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
            popupAnchor: [0, -10],
          });

          return (
            <Marker
              key={`property-${property.id}`}
              position={[lat, lng]}
              icon={customIcon}
              eventHandlers={{
                click: () => onPropertyClick?.(property.id),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-semibold text-sm mb-1">{property.title}</h3>
                  <p className="text-xs text-gray-600 mb-2">{property.address}</p>
                  <p className="text-sm font-semibold text-[#C1121F] mb-2">
                    {priceText}
                  </p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span>{property.beds} bed</span>
                    <span>•</span>
                    <span>{property.size} m²</span>
                  </div>
                  {onPropertyClick && (
                    <button
                      onClick={() => onPropertyClick(property.id)}
                      className="mt-2 w-full px-3 py-1.5 bg-[#C1121F] text-white text-xs font-medium rounded hover:bg-[#A00F1A] transition-colors"
                    >
                      詳細を見る
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        }
      })}
    </>
  );
}

export function PropertiesMapView({ 
  properties, 
  onPropertyClick, 
  className = '', 
  height = '600px' 
}: PropertiesMapViewProps) {
  const { formatPrice } = useCurrency();
  const [propertyCoordinates, setPropertyCoordinates] = useState<Map<number, Coordinates>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCoordinates() {
      if (properties.length === 0) {
        setPropertyCoordinates(new Map());
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      // 住所の配列を作成
      const addresses = properties.map(p => p.address);
      
      // ジオコーディング（レート制限を考慮して順次実行）
      const coordinates = await geocodeAddresses(addresses);
      
      // プロパティIDと座標のマップを作成
      const coordMap = new Map<number, Coordinates>();
      properties.forEach((property, index) => {
        const coord = coordinates[index];
        if (coord) {
          coordMap.set(property.id, coord);
        }
      });
      
      setPropertyCoordinates(coordMap);
      setLoading(false);
    }

    loadCoordinates();
  }, [properties]);

  // Superclusterの初期化
  const cluster = useMemo(() => {
    if (propertyCoordinates.size === 0) return null;

    const points = properties
      .map((property) => {
        const coords = propertyCoordinates.get(property.id);
        if (!coords) return null;
        return {
          type: 'Feature' as const,
          properties: {
            cluster: false,
            property,
            propertyId: property.id,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [coords.lng, coords.lat],
          },
        };
      })
      .filter((point): point is NonNullable<typeof point> => point !== null);

    const clusterInstance = new Supercluster({
      radius: 60, // クラスター化する半径（ピクセル）
      maxZoom: 15, // このズームレベル以上ではクラスター化しない
      minZoom: 0,
      minPoints: 2, // 2つ以上のポイントでクラスター化
    });

    clusterInstance.load(points);
    return clusterInstance;
  }, [properties, propertyCoordinates]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <p className="text-gray-500">地図を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (propertyCoordinates.size === 0 || !cluster) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <p className="text-gray-500">表示できる物件がありません</p>
      </div>
    );
  }

  // すべての座標から境界を計算
  const coordsArray = Array.from(propertyCoordinates.values());
  const bounds = coordsArray.length > 0
    ? L.latLngBounds(coordsArray.map(c => [c.lat, c.lng] as [number, number]))
    : null;

  // デフォルトの中心（東京）
  const defaultCenter: [number, number] = [35.6762, 139.6503];

  return (
    <>
      <style>{`
        .custom-price-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-price-marker > div {
          transition: transform 0.2s, box-shadow 0.2s;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .custom-price-marker:hover > div {
          transform: translate(-50%, -100%) scale(1.15);
          box-shadow: 0 5px 12px rgba(0,0,0,0.5);
          z-index: 1000;
        }
        .cluster-marker {
          background: transparent !important;
          border: none !important;
        }
        .cluster-marker > div {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cluster-marker:hover > div {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        /* Leaflet地図のz-indexを制御 */
        .leaflet-container {
          z-index: 0 !important;
        }
        .leaflet-top,
        .leaflet-bottom {
          z-index: 1 !important;
        }
        .leaflet-pane {
          z-index: 0 !important;
        }
        .leaflet-control {
          z-index: 1 !important;
        }
      `}</style>
      <div className={`rounded-lg overflow-hidden border border-gray-200 ${className}`} style={{ height, position: 'relative', zIndex: 0 }}>
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ height: '100%', width: '100%', position: 'relative', zIndex: 0 }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {bounds && <MapBoundsUpdater bounds={bounds} />}
          <ClusterUpdater cluster={cluster} onPropertyClick={onPropertyClick} />
        </MapContainer>
      </div>
    </>
  );
}
