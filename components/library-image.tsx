"use client";

/**
 * Library / article picture that never crops the subject. The whole image is
 * shown (object-contain), and a blurred, enlarged copy of it fills the rest of
 * the frame — so portrait deity art and landscape photos both sit in the same
 * card height without a face or figure being cut off, and without hard bars.
 */
export function LibraryImage({
  src,
  tint,
  className,
}: {
  src: string;
  tint?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{ background: tint ? `${tint}3a` : "var(--surface-2)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-xl"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading="lazy" className="relative h-full w-full object-contain" />
    </div>
  );
}
