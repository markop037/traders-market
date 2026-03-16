"use client";

import { useEffect, useRef } from 'react';
import { trackBlogPostViewed } from '@/lib/posthog';

export default function BlogViewTracker({ title, slug, category }: { title: string; slug: string; category?: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      trackBlogPostViewed(title, slug, category);
    }
  }, [title, slug, category]);

  return null;
}
