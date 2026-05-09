import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { resetScrollInstantly } from "@/lib/scroll";

const RouteScrollReset = () => {
  const { hash, pathname } = useLocation();

  useLayoutEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);

  useLayoutEffect(() => {
    if (hash) return;

    resetScrollInstantly();
  }, [hash, pathname]);

  return null;
};

export default RouteScrollReset;
