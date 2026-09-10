import { useEffect, useState } from "react";
import { requestPhotoOrientation } from "../lib/screenOrientation";

export default function usePhotoOrientation(photoOpen) {
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    requestPhotoOrientation(photoOpen).then((result) => {
      if (active && !result.obsolete) setError(result.error);
    });
    return () => {
      active = false;
      void requestPhotoOrientation(false);
    };
  }, [photoOpen, attempt]);
  return { error, retry: () => setAttempt((value) => value + 1) };
}
