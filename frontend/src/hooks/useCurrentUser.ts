"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Usuario } from "@/types";

export function useCurrentUser(): Usuario | null {
  const [user, setUser] = useState<Usuario | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("infnet_user");
    if (!stored) { router.push("/login"); return; }
    setUser(JSON.parse(stored));
  }, [router]);

  return user;
}

export function signOut(router: ReturnType<typeof useRouter>) {
  localStorage.removeItem("infnet_user");
  router.push("/login");
}
