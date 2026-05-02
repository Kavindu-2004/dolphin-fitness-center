"use client";

import { useEffect } from "react";

export default function AdminMobileMenuCloseListener() {
  useEffect(() => {
    function closeMenu() {
      const checkbox = document.getElementById(
        "admin-mobile-menu"
      ) as HTMLInputElement | null;

      if (checkbox) {
        checkbox.checked = false;
      }
    }

    window.addEventListener("close-admin-mobile-sidebar", closeMenu);

    return () => {
      window.removeEventListener("close-admin-mobile-sidebar", closeMenu);
    };
  }, []);

  return null;
}