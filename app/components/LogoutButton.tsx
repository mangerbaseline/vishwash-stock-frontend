import { LogOut } from "lucide-react";
import { logout } from "../lib/api";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "@/store/authSlice"; // Import Redux logout action

interface LogoutButtonProps {
  onLogout?: () => void;
}

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        console.log("Attempting logout with token:", token.substring(0, 20) + "...");
        await logout(token);
      }

      // Clear Redux state
      dispatch(logoutAction());

      // Clear all storage (redundant but safe)
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();

      // Clear all cookies
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
      });

      // Call custom callback if provided
      if (onLogout) {
        onLogout();
      }

      // Redirect to login page
      console.log("Logout successful, redirecting to login...");
      router.push("/Authentication/signin");

      // Force a hard refresh to clear any cached state
      setTimeout(() => {
        window.location.href = "/Authentication/signin";
      }, 100);

    } catch (error) {
      console.error("Logout failed:", error);

      // Even if API fails, clear local state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(logoutAction());
      router.push("/Authentication/signin");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 w-full px-2.5 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md"
    >
      <LogOut size={18} />
      <span>Logout</span>
    </button>
  );
}