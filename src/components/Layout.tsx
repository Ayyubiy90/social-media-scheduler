import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { useLocation, Outlet } from "react-router-dom";
import { Footer } from "./Footer";

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Debug log for sidebar state
  useEffect(() => {
    console.log("Sidebar state:", isSidebarOpen);
  }, [isSidebarOpen]);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Handle body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Fixed TopNav */}
      <TopNav
        onSidebarToggle={() => {
          console.log("Toggle clicked, current state:", isSidebarOpen);
          setIsSidebarOpen(!isSidebarOpen);
        }}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Content */}
      <main className="pt-16 flex flex-col min-h-screen">
        <div className="flex-grow">
          <Outlet />
        </div>
        <Footer />
      </main>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[90] ${
          isSidebarOpen
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] sm:w-80 z-[100] transform transition-transform duration-300 ease-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        <Sidebar
          onClose={() => {
            console.log("Sidebar close clicked");
            setIsSidebarOpen(false);
          }}
        />
      </div>
    </div>
  );
}
