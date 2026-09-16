"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Logomark } from "./ui";

/**
 * The loading screen shown while a new screen opens. A damru (डमरू) "played" the
 * way it really is — twisted quickly on its axis so the beaded cords whip round
 * and strike each drumhead — rather than spun flat. Uses the artwork at
 * /loader/damru.png; until that is present it falls back to the Divasya mark.
 */
export function DamruLoader() {
  const [imgOk, setImgOk] = useState(true);
  return (
    <motion.div
      className="absolute inset-0 z-[90] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{ background: "radial-gradient(circle at 50% 44%, #FFF7E8 0%, #F7E6C6 100%)" }}
      aria-label="Loading"
      role="status"
    >
      <div className="flex flex-col items-center">
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <motion.img
            src="/loader/damru.png"
            alt=""
            onError={() => setImgOk(false)}
            className="h-44 w-44 object-contain"
            style={{ transformOrigin: "50% 50%" }}
            animate={{ rotate: [-8, 8, -8], scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
          />
        ) : (
          <>
            <Logomark size={52} className="animate-spinSlow text-[var(--bhagwa)]" />
            <div className="mt-5 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--bhagwa)" }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
