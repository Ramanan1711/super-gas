import React from 'react';
import Image from 'next/image';

export default function BrandLogo({ className = 'h-8 w-auto' }: { className?: string }) {
  return (
    <Image
      src="/super-gas-logo.png"
      alt="Super Gas Logo"
      width={170}
      height={32}
      className={`${className} object-contain`}
      priority
      unoptimized
    />
  );
}

