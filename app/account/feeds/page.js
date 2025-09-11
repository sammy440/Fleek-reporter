'use client';

// app/account/feeds/page.js
import FeedsPageClient from "./FeedsPageClient";

export const dynamic = "force-dynamic"; // 👈 stops static prerendering

export default function Page() {
  return <FeedsPageClient />;
}

