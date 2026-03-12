
"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LunarCalendarPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/calendar");
  }, [router]);

  return null;
}
