"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GradientText from "./GradientText";

const iconSize=44

const navItems = [
  {
    label: "Create",
    href: "/portal",
    color: "#9AC6F6",
    icon: "/background/laptop icon.png",
  },
  {
    label: "Explore",
    href: "/portal/explore",
    color: "#93B4F2",
    icon: "/background/explore icon.png",
  },
  {
    label: "Shop",
    href: "/portal/shop",
    color: "#8FA8F0",
    icon: "/background/shop icon.png",
  },
  {
    label: "Calendar",
    href: "/portal/calendar",
    color: "#82A4EC",
    icon: "/background/calendar icon.svg",
  },
  {
    label: "FAQ",
    href: "/faq",
    color: "#869EEC",
    icon: "/background/faq icon.png",
  },
];

interface UserData {
  email: string;
  name: string;
  slack_display_name?: string;
  slack_avatar_url?: string;
  slack_id?: string;
}

type PortalSidebarProps = {
  onStateChange?: (isOpen: boolean) => void;
  initialOpen?: boolean;
};

export default function PortalSidebar({ onStateChange, initialOpen = true }: PortalSidebarProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && isOpen) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Check if user data is already in sessionStorage
    const cachedUserData = sessionStorage.getItem("portalUserData");
    if (cachedUserData) {
      try {
        setUserData(JSON.parse(cachedUserData));
      } catch (err) {
        console.error("Failed to parse cached user data:", err);
      }
    }

    // Fetch user data from API
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setUserData(data);
          // Cache the user data in sessionStorage
          sessionStorage.setItem("portalUserData", JSON.stringify(data));
        }
      })
      .catch((err) => console.error("Failed to fetch user data:", err));
  }, []);

  useEffect(() => {
    onStateChange?.(isMobile ? false : isOpen);
  }, [isOpen, isMobile, onStateChange]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Clear cached user data from sessionStorage
      sessionStorage.removeItem("portalUserData");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          onClick={handleToggle}
          className="fixed top-4 left-4 z-[70] p-3 rounded-full transition-all duration-300 hover:scale-110"
          style={{
            background: "linear-gradient(180deg, #D9DAF8 0%, #FFF0FD 100%)",
            boxShadow: "0px 4px 8px rgba(108, 110, 160, 0.5)",
          }}
        >
          <span
            className="text-[24px] font-bold"
            style={{
              fontFamily: "'MADE Tommy Soft', sans-serif",
              color: "#7472A0",
            }}
          >
            {isOpen ? "✕" : "☰"}
          </span>
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop Toggle Button */}
      {!isMobile && (
        <button
          onClick={handleToggle}
          className="fixed bottom-8 z-[60] p-3 rounded-full transition-all duration-300 hover:scale-110"
          style={{
            left: isOpen ? "calc(clamp(320px, 25vw, 520px) - 40px)" : "80px",
            background: "linear-gradient(180deg, #D9DAF8 0%, #FFF0FD 100%)",
            boxShadow: "0px 4px 8px rgba(108, 110, 160, 0.5)",
          }}
        >
          <span
            className="text-[24px] font-bold"
            style={{
              fontFamily: "'MADE Tommy Soft', sans-serif",
              color: "#7472A0",
            }}
          >
            {isOpen ? "←" : "☰"}
          </span>
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 min-h-screen z-50 ${
          isMobile ? "w-[280px]" : ""
        }`}
        style={{
          width: isMobile ? "280px" : "clamp(320px, 25vw, 520px)",
          transform: isMobile
            ? isOpen
              ? "translateX(0)"
              : "translateX(-100%)"
            : isOpen
            ? "translateX(0)"
            : "translateX(calc(-100% + 96px))",
          transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Sidebar background image */}
        <div
          className="absolute inset-0 h-full"
          style={{
            backgroundImage: "url('/background/Sidebar.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%",
            backgroundPosition: "top left",
          }}
        />

        {/* Content overlay */}
        <div className={`relative z-10 p-6 md:p-8 flex flex-col min-h-screen ${isMobile ? "pt-16" : ""}`}>
          {/* Logo */}
          <Link href="/portal" className="mt-8 ml-2 md:ml-4 block">
            <Image
              src="/background/sleepover_logo.PNG"
              alt="Sleepover Logo"
              width={301}
              height={193}
              className="w-[180px] md:w-[250px] h-auto hover:scale-105 hover:-rotate-2 transition-transform duration-300"
            />
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-col flex-1">
          <nav className={`flex flex-col gap-8 md:gap-10 mt-12 md:mt-16 ${isOpen ? "ml-2 md:ml-4" : "items-center"}`}>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={handleNavClick}
                className="relative flex items-center gap-3 md:gap-4 font-bold leading-[1.1] hover:opacity-90 transition-transform hover:translate-x-[1px]"
                style={{ fontSize: isMobile ? "28px" : "clamp(30px, 2.3vw, 50px)" }}
              >
                {/* Icon */}
                <Image
                  src={item.icon}
                  alt={`${item.label} icon`}
                  width={44}
                  height={44}
                  className="w-[32px] h-[32px] md:w-[44px] md:h-[44px]"
                />
                {/* Text container */}
                <span style={{ display: isOpen ? "inline-block" : "none" }}>
                  <GradientText
                    gradient="linear-gradient(180deg, #8FB1F0 0%, #7EA0EA 45%, #6D90E3 100%)"
                    strokeWidth={isMobile ? "5px" : "7px"}
                  >
                    {item.label}
                  </GradientText>
                </span>
              </Link>
            ))}
          </nav>

          {/* User Profile Section */}
          {userData && (
            <div className={`mt-auto mb-8 ${isOpen ? "ml-2 md:ml-4" : "flex justify-center"}`}>
              {isOpen ? (
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {userData.slack_avatar_url ? (
                      <Image
                        src={userData.slack_avatar_url}
                        alt="User avatar"
                        width={60}
                        height={60}
                        className="rounded-full w-[50px] h-[50px] md:w-[60px] md:h-[60px]"
                      />
                    ) : (
                      <div
                        className="rounded-full w-[50px] h-[50px] md:w-[60px] md:h-[60px] flex items-center justify-center text-white font-bold text-xl"
                        style={{
                          background: "linear-gradient(135deg, #8FB1F0 0%, #7EA0EA 100%)",
                        }}
                      >
                        {(userData.slack_display_name || userData.name || "U")[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* User Info and Buttons */}
                  <div className="flex-1 min-w-0">
                    {/* Username */}
                    <p
                      className="text-[16px] md:text-[18px] font-bold truncate"
                      style={{
                        fontFamily: "'MADE Tommy Soft', sans-serif",
                        color: "#5A5C8A",
                      }}
                    >
                      {userData.slack_display_name || userData.name}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-1">
                      <Link href="https://app.slack.com/client/E09V59WQY1E/C06T17NQB0B" onClick={handleNavClick}>
                        <Image src="/icons/slack2.png" alt="slack" width={iconSize} height={iconSize}/>
                      </Link>
                      <Link href="/" onClick={handleLogout}>
                        <Image src="/icons/logout2.png" alt="logout" width={iconSize+5} style={{paddingTop: 5, paddingLeft: 5}} height={iconSize+5}/>
                      </Link>
                      <Link href="/portal/settings" onClick={handleNavClick}>
                        <Image src="/icons/setting2.png" alt="settings" width={iconSize-6} style={{paddingTop: 2}} height={iconSize-6}/>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* Collapsed view - just avatar */
                <div className="flex-shrink-0 cursor-pointer hover:scale-110 transition-transform" onClick={handleToggle}>
                  {userData.slack_avatar_url ? (
                    <Image
                      src={userData.slack_avatar_url}
                      alt="User avatar"
                      width={44}
                      height={44}
                      className="rounded-full w-[44px] h-[44px]"
                    />
                  ) : (
                    <div
                      className="rounded-full w-[44px] h-[44px] flex items-center justify-center text-white font-bold text-lg"
                      style={{
                        background: "linear-gradient(135deg, #8FB1F0 0%, #7EA0EA 100%)",
                      }}
                    >
                      {(userData.slack_display_name || userData.name || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </aside>
    </>
  );
}
