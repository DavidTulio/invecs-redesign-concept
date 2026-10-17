"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False in the server-rendered HTML, true once React has taken over the page.
 * Admin controls stay disabled until then, so a tap on a slow connection can't
 * look like it worked when nothing was listening yet.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
