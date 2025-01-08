"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { type ReactNode, useEffect } from "react";

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    MiniKit.install();
    console.log(MiniKit.isInstalled());
  }, []);

  return <>{children}</>;
}
