"use client";

import { useEffect } from "react";
import { logBlogView } from "@/lib/analytics";

export default function BlogViewTracker({ title, slug }: { title: string; slug: string }) {
  useEffect(() => {
    logBlogView(title, slug);
  }, [title, slug]);

  return null;
}
