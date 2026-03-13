/**
 * 物件画像URLのパフォーマンス最適化
 * Supabase Storage の Image Transformation を使い、
 * 一覧では軽量・詳細では高解像度を返す。Supabase 以外のURLはそのまま返す。
 *
 * @see https://supabase.com/docs/guides/storage/serving/image-transformations
 */

const SUPABASE_OBJECT_PUBLIC = '/storage/v1/object/public/'
const SUPABASE_RENDER_IMAGE = '/storage/v1/render/image/public/'

/** Supabase Storage の公開URLかどうか */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  return url.includes('supabase.co') && url.includes(SUPABASE_OBJECT_PUBLIC)
}

export type PropertyImageSize = 'listing' | 'detail'

/** 一覧用: 幅600・WebP・quality 80。詳細用: 幅1200・WebP・quality 85 */
const SIZE_OPTIONS: Record<PropertyImageSize, { width: number; quality: number }> = {
  listing: { width: 600, quality: 80 },
  detail: { width: 1200, quality: 85 },
}

/**
 * 物件画像URLを取得する。
 * - Supabase Storage のURLの場合: Image Transformation でリサイズ・フォーマット指定したURLを返す
 * - それ以外: 元のURLをそのまま返す
 */
export function getPropertyImageUrl(url: string, size: PropertyImageSize = 'listing'): string {
  if (!url || typeof url !== 'string') return url
  if (!isSupabaseStorageUrl(url)) return url

  const transformed = url.replace(SUPABASE_OBJECT_PUBLIC, SUPABASE_RENDER_IMAGE)
  const { width, quality } = SIZE_OPTIONS[size]
  const params = new URLSearchParams()
  params.set('width', String(width))
  params.set('quality', String(quality))
  params.set('format', 'webp')
  const separator = transformed.includes('?') ? '&' : '?'
  return `${transformed}${separator}${params.toString()}`
}
