"use client";

import { ReactNode, useEffect, useState } from "react";
import { Signal, Wifi, BatteryMedium } from "lucide-react";

export function StatusBar() {
  const [time, setTime] = useState("9:41");
  useEffect(() => {
    const f = () =>
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).replace(/\s?[ap]m/i, "")
      );
    f();
    const id = setInterval(f, 10000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-7 pt-3.5 text-[13px] font-medium text-ink/90">
      <span className="tabular-nums">{time}</span>
      <div className="flex items-center gap-1.5">
        <Signal size={15} strokeWidth={2.2} />
        <Wifi size={15} strokeWidth={2.2} />
        <BatteryMedium size={18} strokeWidth={2.2} />
      </div>
    </div>
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative" style={{ width: 392, height: 852 }}>
      {/* bezel */}
      <div
        className="absolute inset-0 rounded-[3rem]"
        style={{
          background: "#050505",
          padding: 11,
          boxShadow:
            "0 40px 90px -30px rgba(0,0,0,0.8), 0 0 0 1px rgba(236,230,219,0.06), inset 0 0 0 2px #1c1c1c",
        }}
      >
        {/* screen */}
        <div
          className="relative h-full w-full overflow-hidden rounded-[2.3rem]"
          style={{ background: "var(--bg-0)" }}
        >
          {/* dynamic island */}
          <div className="absolute left-1/2 top-2 z-40 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
          {children}
        </div>
      </div>
    </div>
  );
}
