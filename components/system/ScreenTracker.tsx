import { useEffect, useRef } from 'react';

import { usePathname } from 'expo-router';

import { getRouteMeta, normalizePathname } from '@/constants/routeMeta';

import { trackScreenViewed } from '@/lib/analytics';



export default function ScreenTracker() {

  const pathname = usePathname();

  const lastTracked = useRef<string | null>(null);



  useEffect(() => {

    const normalized = normalizePathname(pathname);

    if (!normalized || normalized === lastTracked.current) return;



    trackScreenViewed(getRouteMeta(normalized));

    lastTracked.current = normalized;

  }, [pathname]);



  return null;

}

