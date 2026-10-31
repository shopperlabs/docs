import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={clsx('flex shrink-0 items-center', className)} aria-label="Shopper Docs home">
      <Image src="/logo/logo.svg" alt="" width={20} height={24} className="h-7 w-auto" priority />
    </Link>
  );
}
