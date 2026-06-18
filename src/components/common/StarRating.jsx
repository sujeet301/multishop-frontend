export default function StarRating({ rating = 0, size = "sm", interactive = false, onChange }) {
  const sizes = { xs: "text-xs", sm: "text-sm", md: "text-base", lg: "text-xl" };
  return (
    <div className={`flex items-center gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onClick={() => interactive && onChange?.(s)}
          className={`${s <= Math.round(rating) ? "star-filled" : "star-empty"} ${interactive ? "cursor-pointer hover:scale-110 transition-transform select-none" : ""}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
