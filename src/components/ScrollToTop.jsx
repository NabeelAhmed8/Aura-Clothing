import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  // 1. Route ya query change hone par top par le kar jaye
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  // 2. Page refresh hone par browser ke default scroll restoration ko manual top par fix kar de
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return null;
}