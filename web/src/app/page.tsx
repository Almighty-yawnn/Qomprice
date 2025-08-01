import { Suspense } from 'react';
import HomeClient from '@/components/HomeClient';
import AppLoader from '@/components/ui/AppLoader';

export default function Home() {
  return (
    <Suspense fallback={<AppLoader />}>
      <HomeClient />
    </Suspense>
  );
}