import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { MaptilerLayer } from '@maptiler/leaflet-maptilersdk';
import type { Layer } from 'leaflet';

interface MapTilerLayerProps {
  apiKey: string;
  language: string;
}

/**
 * MapTiler のベースマップを言語（en/zh）指定で表示。
 * MapContainer の子として使用。API キーが有効なら地名・住所が英語/中国語で表示される。
 */
export function MapTilerLayer({ apiKey, language }: MapTilerLayerProps) {
  const map = useMap();
  const layerRef = useRef<Layer | null>(null);

  useEffect(() => {
    if (!apiKey?.trim() || !map) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    const layer = new MaptilerLayer({
      apiKey: apiKey.trim(),
      language: language === 'zh' ? 'zh' : 'en',
    }).addTo(map) as unknown as Layer;

    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, apiKey, language]);

  return null;
}
