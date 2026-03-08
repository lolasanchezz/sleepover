"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import PortalSidebar from "../components/PortalSidebar";
import BunnyTile from "../components/BunnyTile";
import CountdownProgressBar from "../components/CountdownProgressBar";
import OnboardingNovel from "../components/OnboardingNovel";
import ProjectList from "../components/ProjectList";
import NewProjectModal from "../components/NewProjectModal";
import GradientText from "../components/GradientText";
import SmallBox from "../components/SmallBox";
import Link from "next/link";
import { updatePronouns } from "../forms/actions/updatePronouns";

export default function PortalPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [userProjects, setProjects] = useState<any[] | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboardingV2");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }

    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.name) {
          const firstName = data.name.split(" ")[0];
          setUserName(firstName);
        }
      })
      .catch(() => {});

    // Send stored utm_source to server after auth
    const utmSource = localStorage.getItem("utm_source");
    if (utmSource) {
      fetch("/api/user/utm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utm_source: utmSource }),
      }).then(() => {
        localStorage.removeItem("utm_source");
      }).catch(() => {});
    }

    // Send stored referral code to server after auth
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };
    const referralCode = getCookie("referral_code");
    if (referralCode) {
      fetch("/api/user/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referral_code: decodeURIComponent(referralCode) }),
      }).then(() => {
        // Delete cookie after successful save
        document.cookie = "referral_code=; path=/; max-age=0";
      }).catch(() => {});
    }
  }, []);

  const handleOnboardingComplete = async (pronouns?: string) => {
    localStorage.setItem("hasSeenOnboardingV2", "true");
    setShowOnboarding(false);

    // Save pronouns to Airtable if provided
    if (pronouns) {
      try {
        await updatePronouns(pronouns);
      } catch (error) {
        console.error("Failed to save pronouns:", error);
      }
    }
  };
  
  const contentOffset = isMobile ? "0px" : isSidebarOpen ? "clamp(360px, 28vw, 600px)" : "140px";

  return (
    <div
      className="font-sans min-h-screen relative"
      style={{ backgroundColor: "#C0DEFE" }}
    >
      {/* Load Fillout SDK */}
      <Script
        src="https://server.fillout.com/embed/v1/"
        strategy="afterInteractive"
        onLoad={() => console.log("Fillout SDK loaded")}
        onError={(e) => console.error("Fillout SDK failed to load", e)}
      />

      {/* Disable interactions when onboarding is showing */}
      <div className={showOnboarding ? "pointer-events-none" : ""}>
        <BunnyTile />
        <PortalSidebar onStateChange={setIsSidebarOpen} />
      </div>

      {showOnboarding && (
        <OnboardingNovel onComplete={handleOnboardingComplete} userName={userName} />
      )}

      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
      />

      <main
        className={`relative z-10 transition-[margin-left] duration-300 p-4 md:p-8 lg:p-12 pt-16 md:pt-8 flex flex-col items-center ${showOnboarding ? "pointer-events-none" : ""}`}
        style={{ 
          marginLeft: contentOffset, 
          marginRight: isMobile ? "0px" : "32px" 
        }}
      >
        {/* Create Heading */}
        <div
          className="flex justify-center mb-6 md:mb-8 w-full transition-all duration-300"
          style={{ maxWidth: isSidebarOpen ? "960px" : "1120px" }}
        >
          <h1 className="text-[48px] md:text-[72px] leading-[60px] md:leading-[90px] text-center">
            <GradientText
              gradient="linear-gradient(180deg, #B7C1F2 0%, #89A8EF 100%)"
              strokeWidth="10px"
            >
              Create
            </GradientText>
          </h1>
        </div>

        <CountdownProgressBar isSidebarOpen={isSidebarOpen} />

        {/* Figma 3-box layout: two small left, one large right */}
        <section
          className="w-full flex justify-center mt-6"
          style={{ maxWidth: isSidebarOpen ? "1060px" : "1220px" }}
        >
          <div className="flex flex-col md:flex-row w-full gap-4 md:gap-8">
            {/* Left column with two small boxes */}
            <div
              className="flex flex-col gap-4 md:gap-8 w-full md:w-auto"
              style={{ width: isMobile ? "100%" : "clamp(240px, 28%, 300px)" }}
            >
              {/* Small box #1 */}
              <SmallBox
                header="HackDash"
                
                body=""
                isMobile={isMobile}
                childrenPosition="above"
              >
              
                <img src="/background/more_bunny.png" alt="bunny" className="w-12 h-12 md:w-20 md:h-20 mx-auto" />
                          <span className="text-sm md:text-lg block">
                            <GradientText
                              gradient="linear-gradient(180deg, #7791E6 0%, #7472A0 100%)"
                              strokeWidth={isMobile ? "4px" : "6px"}
                            >
                              Hacking with friends?
                            </GradientText>
                          </span>
                          <div className="mt-3 md:mt-4" />
                          <Link
                          href="https://forms.hackclub.com/t/pZsjjXn4yAus"
                          target="_blank"
                  className="relative flex items-center justify-center rounded-2xl transition-transform hover:scale-105 cursor-pointer mx-auto"
                  style={{
                    width: isMobile ? "140px" : "160px",
                    height: isMobile ? "44px" : "50px",
                    background: "linear-gradient(180deg, #FFF6E0 0%, #FFE8B2 100%)",
                    border: "4px solid white",
                    boxShadow:
                      "0px 4px 0px 0px #C6C7E4, 0px 6px 8px 0px rgba(116,114,160,0.69)",
                    borderRadius: "16px",
                  }}
                >
                  <div
                    className="absolute inset-[4px] rounded-xl"
                    style={{
                      background: "linear-gradient(0deg, #FFF2D4 12%, #FFE8B2 100%)",
                      boxShadow: "0px 2px 2px 0px rgba(116,114,160,0.33)",
                      borderRadius: "12px",
                    }}
                  />
                  <span className="relative z-10 text-lg md:text-xl">
                    <GradientText
                      gradient="linear-gradient(180deg, #7684C9 0%, #7472A0 100%)"
                      strokeWidth="2px"
                    >
                      Get food!
                    </GradientText>
                  </span>
                </Link>
              </SmallBox>

            {/* Small box #2 */}
              <SmallBox
                header="March Challenge"
                body="Spend 10 hours building a Printed Circuit Board, get 3 bonus feathers!!"
                isMobile={isMobile}
              >
                <Link
                  href="/portal/march"
                  className="relative flex items-center justify-center rounded-2xl transition-transform hover:scale-105 cursor-pointer mx-auto"
                  style={{
                    width: isMobile ? "140px" : "160px",
                    height: isMobile ? "44px" : "50px",
                    background: "linear-gradient(180deg, #FFF6E0 0%, #FFE8B2 100%)",
                    border: "4px solid white",
                    boxShadow:
                      "0px 4px 0px 0px #C6C7E4, 0px 6px 8px 0px rgba(116,114,160,0.69)",
                    borderRadius: "16px",
                  }}
                >
                  <div
                    className="absolute inset-[4px] rounded-xl"
                    style={{
                      background: "linear-gradient(0deg, #FFF2D4 12%, #FFE8B2 100%)",
                      boxShadow: "0px 2px 2px 0px rgba(116,114,160,0.33)",
                      borderRadius: "12px",
                    }}
                  />
                  <span className="relative z-10 text-lg md:text-xl">
                    <GradientText
                      gradient="linear-gradient(180deg, #7684C9 0%, #7472A0 100%)"
                      strokeWidth="2px"
                    >
                      Learn more!
                    </GradientText>
                  </span>
                </Link>
              </SmallBox>
            </div>

            {/* Right large box */}
            <div className="flex-1 w-full" style={{ minWidth: 0 }}>
              <div
                className="rounded-[24px] md:rounded-[30px] overflow-hidden"
                style={{
                  minHeight: isMobile ? "400px" : "588px",
                  background: "linear-gradient(180deg, #D9DAF8 0%, #FFF0FD 100%)",
                  boxShadow: "0px 4px 4px rgba(116,114,160,0.62)",
                }}
              >
                <div
                  className="flex items-center justify-between px-4 md:px-6"
                  style={{
                    height: isMobile ? "70px" : "96px",
                    background: "linear-gradient(180deg, #FFE5E8 0%, #EBC0CC 100%)",
                    boxShadow: "0px 2px 0px #c1c3e891",
                  }}
                >
                  {/* Left: Label "Your Projects" */}
                  <h2
                    style={{
                      fontSize: isMobile ? "18px" : "24px",
                      margin: 0,
                    }}
                  >
                    <GradientText
                      gradient="linear-gradient(180deg, #9A9EF7 0%, #6C6EA0 100%)"
                      strokeWidth="4px"
                    >
                      Your Projects
                    </GradientText>
                  </h2>

                  {/* Right: "new project +" group */}
                  <button
                    onClick={() => setShowNewProjectModal(true)}
                    className="flex items-center gap-1 md:gap-2 select-none cursor-pointer"
                  >
                    {/* "new project" text */}
                    <span style={{ fontSize: isMobile ? "16px" : "24px" }}>
                      <GradientText
                        gradient="linear-gradient(180deg, #93B4F2 0%, #8FA8F0 100%)"
                        strokeWidth="4px"
                      >
                        new project
                      </GradientText>
                    </span>
                    {/* "+" text */}
                    <span
                      style={{
                        fontSize: isMobile ? "32px" : "48px",
                        lineHeight: "32px",
                      }}
                    >
                      <GradientText
                        gradient="linear-gradient(180deg, #93B4F2 0%, #8FA8F0 100%)"
                        strokeWidth="6px"
                      >
                        +
                      </GradientText>
                    </span>
                  </button>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: isMobile ? "calc(100% - 70px)" : "calc(100% - 96px)" }}>
                  {userProjects === null ? (
                    <div className="flex items-center justify-center py-8">
                      <span style={{ fontFamily: "'MADE Tommy Soft', sans-serif", color: "#6C6EA0" }}>
                        Loading...
                      </span>
                    </div>
                  ) : (
                    <ProjectList projects={userProjects}/>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}