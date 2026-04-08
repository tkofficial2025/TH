import type { Property } from '@/lib/properties';

/** 学生向けカテゴリに「家賃のみ」で入る上限（円／月・税込想定は DB 定義に合わせる） */
export const FOR_STUDENTS_MAX_MONTHLY_RENT_YEN = 150_000;

/**
 * 「For students」カテゴリに該当するか。
 * - DB の for_students（手動）が true
 * - タイトルに student / 学生
 * - または賃貸で月額が上限以下（タイトルに依らない）
 */
export function matchesForStudentsCategory(
  property: Pick<Property, 'type' | 'title' | 'price'> & { forStudents?: boolean }
): boolean {
  if (property.forStudents === true) return true;
  const titleLower = (property.title ?? '').toLowerCase();
  if (titleLower.includes('student') || titleLower.includes('学生')) return true;
  if (property.type !== 'rent') return false;
  const price = Number(property.price);
  if (!Number.isFinite(price) || price <= 0) return false;
  return price <= FOR_STUDENTS_MAX_MONTHLY_RENT_YEN;
}
