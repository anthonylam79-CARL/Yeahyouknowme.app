'use client';
import { useEffect } from 'react';
import { trackGrowth } from '@/lib/growth';
export default function GrowthVisit() {
  useEffect(() => { trackGrowth('visit'); }, []);
  return null;
}
