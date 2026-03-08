"use client";

import { useState, useEffect } from "react";
import PortalSidebar from "../../components/PortalSidebar";
import GradientText from "../../components/GradientText";

export default function FebChallengePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const contentOffset = isMobile
    ? "0px"
    : sidebarOpen
      ? "clamp(320px, 25vw, 520px)"
      : "96px";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#C0DEFE" }}>
      <PortalSidebar onStateChange={setSidebarOpen} />

      <main
        className="relative z-10 transition-all duration-300 p-4 md:p-8 lg:p-12 pt-16 md:pt-8 flex items-center justify-center min-h-screen"
        style={{
          marginLeft: contentOffset,
          marginRight: isMobile ? "0px" : "32px",
        }}
      >
        <div className="text-center">
          <h1 className="text-[48px] md:text-[72px] leading-[60px] md:leading-[90px]">
            <GradientText
              gradient="linear-gradient(180deg, #B7C1F2 0%, #89A8EF 100%)"
              strokeWidth="10px"
            >
              Coming Soon!
            </GradientText>
          </h1>
        </div>
      </main>
    </div>
  );
}
