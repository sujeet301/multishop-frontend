export const formatPrice = (price) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price || 0);

export const formatDate = (date) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));

export const formatRelativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const truncate = (str, n = 60) => str?.length > n ? str.slice(0, n) + "..." : str;

export const getStatusColor = (status) => ({
  pending: "status-pending",
  processing: "status-processing",
  shipped: "status-shipped",
  out_for_delivery: "status-processing",
  delivered: "status-delivered",
  cancelled: "status-cancelled",
}[status] || "badge-primary");

export const getDiscountPercent = (price, discountPrice) => {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

export const buildQueryString = (params) => {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined));
  return new URLSearchParams(clean).toString();
};
