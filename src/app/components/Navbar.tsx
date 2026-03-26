"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Menu, X } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/app";
import { logout } from "../store/userSlice";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state?.user?.isAuthenticated);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch {
      // even if request fails, clear client state
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("profile");
      dispatch(logout());
      setOpen(false);
      router.push("/");
      router.refresh();
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16">

          
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold text-indigo-600 tracking-tight"
          >
            Social<span className="hidden sm:inline">Connect</span>
          </Link>

          {/* ✅ Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/home" className="text-sm text-gray-600 hover:text-indigo-600">
              Home
            </Link>

            {/* Profile */}
            <Link
              href="/profile"
              className="p-2 rounded-full bg-gray-100 hover:bg-indigo-50 transition"
            >
              <User size={20} />
            </Link>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-red-600"
              >
                {/* <LogOut size={18} /> */}
                Logout
              </button>
            ) : null}
          </div>

          {/* ✅ Mobile Right Side */}
          <div className="flex items-center gap-2 md:hidden">

            {/* Profile icon (small) */}
            <Link
              href="/profile"
              className="p-2 rounded-full bg-gray-100"
            >
              <User size={20} />
            </Link>

            {/* Menu button */}
            <button onClick={() => setOpen(!open)} className="p-2">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 Mobile Dropdown */}
      {open && (
        <div className="md:hidden px-4 pb-4 pt-2 space-y-2 border-t bg-white">
          <Link
            href="/home"
            className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-indigo-50"
          >
            Home
          </Link>

          <Link
            href="/profile"
            className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-indigo-50"
          >
            Profile
          </Link>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
            >
              Logout
            </button>
          ) : null}
        </div>
      )}
    </nav>
  );
}