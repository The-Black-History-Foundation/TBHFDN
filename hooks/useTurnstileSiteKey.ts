"use client";

import { useEffect, useState } from "react";

export function useTurnstileSiteKey() {
  const [siteKey, setSiteKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/turnstile-config")
      .then((res) => res.json())
      .then((data: { siteKey?: string }) => {
        if (!cancelled) {
          setSiteKey(typeof data.siteKey === "string" ? data.siteKey.trim() : "");
        }
      })
      .catch(() => {
        if (!cancelled) setSiteKey("");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { siteKey, loading };
}
