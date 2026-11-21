import { PageNotFound } from '@/components/layout/page-not-found';
import { versionHome, versions } from '@/components/layout/tree';
import { getDocsTree } from '@/lib/source';

export default function NotFound() {
  const homes = versions(getDocsTree()).map((version) => ({ id: version.$id ?? '', href: versionHome(version) }));

  return <PageNotFound homes={homes} />;
}
