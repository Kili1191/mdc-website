"use client";

import { useEffect } from "react";
import { nudgeHorizontal } from "@/lib/scroll";

const WHEEL_SENSITIVITY = 0.012;
const TOUCH_SENSITIVITY = 0.03;

// Captures horizontal-dominant wheel/touch gestures and feeds them into
// the horizontal exploration smoother. Uses capture-phase + stopImmediate
// to intercept the event before Lenis sees it — that way a horizontal
// swipe never accidentally descends a level.
export function HorizontalScroll() {
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        nudgeHorizontal(e.deltaX * WHEEL_SENSITIVITY);
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    let touchX = 0;
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dx = touchX - e.touches[0].clientX;
      const dy = touchY - e.touches[0].clientY;
      if (Math.abs(dx) > Math.abs(dy)) {
        nudgeHorizontal(dx * TOUCH_SENSITIVITY);
        e.preventDefault();
        e.stopImmediatePropagation();
      }
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    };

    window.addEventListener("wheel", onWheel, {
      passive: false,
      capture: true,
    });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, {
      passive: false,
      capture: true,
    });

    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
    };
  }, []);

  return null;
}
