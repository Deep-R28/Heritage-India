"use client";

import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

function MapLoading() {
  const { t } = useTranslation();
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface font-label text-xs uppercase tracking-widest text-foreground-muted">
      {t("common.loading")}…
    </div>
  );
}

export const SiteMapLazy = dynamic(() => import("./site-map").then((m) => m.SiteMap), {
  ssr: false,
  loading: () => <MapLoading />,
});
