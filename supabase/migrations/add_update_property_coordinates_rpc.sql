-- ジオコーディング結果を latitude / longitude だけ更新する RPC（クライアントから安全に呼ぶ用）
-- 物件の他のカラムは変更できず、緯度・経度のみ更新可能。

CREATE OR REPLACE FUNCTION public.update_property_coordinates(
  p_property_id bigint,
  p_lat double precision,
  p_lng double precision
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  IF p_lat IS NULL OR p_lng IS NULL THEN
    RETURN;
  END IF;
  IF p_lat < -90 OR p_lat > 90 OR p_lng < -180 OR p_lng > 180 THEN
    RETURN;
  END IF;
  UPDATE public.properties
  SET latitude = p_lat, longitude = p_lng
  WHERE id = p_property_id;
END;
$fn$;

COMMENT ON FUNCTION public.update_property_coordinates(bigint, double precision, double precision)
  IS 'Updates only latitude and longitude for a property (e.g. after geocoding). Callable by anon.';

GRANT EXECUTE ON FUNCTION public.update_property_coordinates(bigint, double precision, double precision) TO anon;
GRANT EXECUTE ON FUNCTION public.update_property_coordinates(bigint, double precision, double precision) TO authenticated;
