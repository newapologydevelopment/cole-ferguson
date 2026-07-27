'use client';

import Link from 'next/link';

export function IndexLink() {
  return (
    <Link
      href="/gallery"
      className="relative z-[1] hidden cursor-pointer pointer-events-auto transition-colors duration-300 hover:text-[#717171] focus-visible:outline-2 focus-visible:outline-offset-2 xl:block"
      data-hide-cursor="true"
      data-index-link
      onClick={() => window.dispatchEvent(new Event('infoshell:close'))}
    >
      Index
    </Link>
  );
}
