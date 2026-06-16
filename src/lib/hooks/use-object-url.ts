"use client";

import { useEffect, useState } from "react";

/** Create an object URL for a Blob, revoking it when the blob changes/unmounts. */
export function useObjectUrl(blob?: Blob | null): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) {
      setUrl(undefined);
      return;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url;
}
