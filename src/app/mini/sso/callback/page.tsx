'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function CallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const sso = searchParams.get('sso');
    if (sso) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const url = `${origin}/api/sso/consume?sso=${encodeURIComponent(sso)}&next=/mini`;
      window.location.href = url;
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#f6f9ff]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 text-center">
        <h1 className="text-xl font-semibold text-[#1b1b1b]">Đang xử lý đăng nhập SSO...</h1>
        <p className="text-sm text-gray-600 mt-2">
          Nếu không tự chuyển trang, hãy bấm
          <a href="/mini" className="text-blue-600 ml-1">về Mini</a>
        </p>
      </div>
    </main>
  );
}

export default function MiniSsoCallback() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}

