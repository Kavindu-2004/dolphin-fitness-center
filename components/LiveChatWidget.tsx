"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>;
    Tawk_LoadStart?: Date;
  }
}

export default function LiveChatWidget() {
  useEffect(() => {
    if (document.getElementById("tawk-live-chat-script")) {
      return;
    }

    const originalConsoleError = console.error;

    console.error = (...args: unknown[]) => {
      const firstArg = args[0];

      const isTawkTrueError =
        firstArg === true ||
        args.some(
          (arg) =>
            typeof arg === "string" &&
            (arg.includes("embed.tawk.to") || arg.includes("twk-chunk"))
        );

      if (isTawkTrueError) {
        return;
      }

      originalConsoleError(...args);
    };

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = "tawk-live-chat-script";
    script.async = true;
    script.src = "https://embed.tawk.to/69f4e42a3b2aa31c32ffcf07/1jnia25fh";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    document.body.appendChild(script);

    return () => {
      console.error = originalConsoleError;

      const existingScript = document.getElementById("tawk-live-chat-script");

      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
}