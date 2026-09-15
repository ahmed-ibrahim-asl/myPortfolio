"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function LegacyWorkLinks({ destinations }: { destinations: Record<string, string> }) {
 const router = useRouter();
 useEffect(() => {
   const follow = () => { const destination = destinations[window.location.hash.slice(1)]; if (destination) router.replace(destination); };
   follow();
   window.addEventListener("hashchange", follow);
   return () => window.removeEventListener("hashchange", follow);
 }, [destinations, router]);
 return null;
}
