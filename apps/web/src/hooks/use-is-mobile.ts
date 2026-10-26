"use client";

import { useEffect, useState } from "react";

/** Por debajo de lg la app muestra el drawer lateral (hamburguesa). */
const MOBILE_QUERY = "(max-width: 1023px)";

/**
 * true cuando el viewport está por debajo de lg (drawer visible).
 * SSR-safe: false en servidor, se ajusta en cliente.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isMobile;
}
