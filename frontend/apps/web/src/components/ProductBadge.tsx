'use client';

import { type Product } from '@/lib/articles';

export function ProductBadge({ 
  product, 
  small = false, 
  dark = false 
}: { 
  product: Product; 
  small?: boolean; 
  dark?: boolean 
}) {
  return (
    <span
      className={`font-semibold tracking-widest uppercase [font-family:var(--ff-sans)] ${
        small ? "text-[10px]" : "text-[11px]"
      } ${dark ? "text-[#C9A84C]" : "text-[#C9A84C]"}`}
    >
      {product}
    </span>
  );
}