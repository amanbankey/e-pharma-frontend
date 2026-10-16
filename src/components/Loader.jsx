// Themed CSS spinner used in place of plain "Loading…" text across the storefront.
export default function Loader({ label, size = 32, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-10 ${className}`}>
      <span
        style={{ width: size, height: size }}
        className="animate-spin rounded-full border-3 border-teal-100 border-t-teal-900"
      />
      {label && <p className="text-sm font-medium text-ink-soft">{label}</p>}
    </div>
  );
}
