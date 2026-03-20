"use client";

export async function logout() {
  // Remove token from localStorage
  localStorage.removeItem("token");

  // Call API to clear HttpOnly cookie
  await fetch("/api/logout", { method: "GET" });
}
