/**
 * Định dạng số tiền sang chuẩn VNĐ (Paper & Ink Style):
 * - Nếu giá bằng 0 hoặc rỗng -> "Miễn phí"
 * - Nếu giá > 0 -> "500.000₫"
 */
export function formatCurrency(price) {
  const num = Number(price) || 0;
  if (num <= 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN').format(num) + '₫';
}
