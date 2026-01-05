import { useState, useEffect } from "react";

/**
 * Hook para detectar media queries e renderizar responsivamente
 * @param query - String da media query (ex: '(max-width: 768px)')
 * @returns boolean indicando se a media query é verdadeira
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
 *
 * if (isMobile) {
 *   return <MobileView />;
 * }
 * return <DesktopView />;
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Define valor inicial
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Listener para mudanças
    const listener = () => setMatches(media.matches);

    // Usar addEventListener se disponível, senha usar método antigo
    if (media.addEventListener) {
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    } else {
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [matches, query]);

  return matches;
}
