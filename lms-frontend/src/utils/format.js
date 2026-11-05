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

/**
 * Định dạng thời gian tương đối dạng "5 phút trước", "1 giờ trước", "Vừa xong"
 */
export function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffInSeconds = Math.max(0, Math.floor((now - date) / 1000));

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`;
  }
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
