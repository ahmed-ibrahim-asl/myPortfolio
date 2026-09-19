"use client";

import { useEffect } from "react";

export function LegacyToolRedirect({ destination }: { destination: string }) {
  useEffect(() => {
    window.location.replace(`${destination}${window.location.search}${window.location.hash}`);
  }, [destination]);

  return (
    <main className="section shell">
      <p>Moving this saved calculation to its current tool address…</p>
      <a href={destination}>Continue to the tool</a>
    </main>
  );
}
