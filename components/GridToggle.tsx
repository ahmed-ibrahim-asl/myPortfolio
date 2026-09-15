"use client";

import React, { useEffect, useState } from "react";

export function GridToggle() {
  const [gridOn, setGridOn] = useState(true);

  useEffect(() => {
    // Read initial state on mount to avoid hydration mismatch
    const stored = localStorage.getItem("asl-grid-pref");
    const shouldShow = stored !== "off";
    setGridOn(shouldShow);
    document.documentElement.classList.toggle("show-grid", shouldShow);
  }, []);

  const toggleGrid = () => {
    setGridOn((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("show-grid");
        localStorage.setItem("asl-grid-pref", "on");
      } else {
        document.documentElement.classList.remove("show-grid");
        localStorage.setItem("asl-grid-pref", "off");
      }
      return next;
    });
  };

  return (
    <button
      className="grid-toggle-button mono"
      type="button"
      aria-pressed={gridOn}
      onClick={toggleGrid}
    >
      GRID {gridOn ? "ON" : "OFF"}
    </button>
  );
}
