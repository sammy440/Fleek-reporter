'use client';

// app/account/feeds/page.js
import { Suspense } from 'react';
import FeedsPageClient from "./FeedsPageClient";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Loading your feed...</p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FeedsPageClient />
    </Suspense>
  );
}
