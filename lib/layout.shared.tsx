import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { appName } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image src="/logo/logo.svg" alt="" width={20} height={24} />
          {appName}
        </>
      ),
    },
    githubUrl: 'https://github.com/shopperlabs/shopper',
    links: [
      { text: 'Discord', url: 'https://discord.gg/r4VUvHm34', external: true },
      { text: 'Blog', url: 'https://laravelshopper.dev/blog', external: true },
    ],
  };
}
