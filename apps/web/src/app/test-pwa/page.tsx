"use client";

import dynamic from "next/dynamic";

const PWATester = dynamic(
  () =>
    import("@/components/shared/pwa-tester.component").then((mod) => ({
      default: mod.PWATester,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        Loading PWA tester...
      </div>
    ),
  }
);

export default function TestPWAPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">PWA Features Test</h1>
        <PWATester />
      </div>
    </div>
  );
}
