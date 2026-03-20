"use client";

// import { logout } from "@/lib/logout";
import { useRouter } from "next/navigation";
import { logout } from "../lib/api";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await logout();
        router.push("/Authentication/signin");
      }}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
  );
}
