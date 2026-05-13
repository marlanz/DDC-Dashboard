"use client";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { redirect } from "next/navigation";

export default function Home() {
  const userInfo = useAuthStore((state) => state.user);

  if (!userInfo) return redirect("/login");
  else return redirect("/dashboard");
  return <></>;
}
