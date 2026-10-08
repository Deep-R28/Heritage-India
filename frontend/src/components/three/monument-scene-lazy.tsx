"use client";

import dynamic from "next/dynamic";

/** Code-split entry point — only pages that render this pull in three.js/R3F. */
export const MonumentSceneLazy = dynamic(
  () => import("./monument-scene").then((m) => m.MonumentScene),
  { ssr: false },
);
