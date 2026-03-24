"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import GradientText from "@/app/components/GradientText";

interface ProjectData {
  id: string;
  name: string;
  desc: string;
  hours: number;
  hackatime_name: string;
  userid: string;
}

function ShipDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const shouldShowSnoozefestCheckbox = () => {
    const start = new Date("2026-03-28T00:00:00Z"); // 8pm est march 27th in utc
    const end = new Date("2026-03-30T00:30:00Z") // 8:30pm est march 29th in utc
    const now = new Date()
    return now >= start && now <= end;
  };

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [step1Confirmed, setStep1Confirmed] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [playableUrl, setPlayableUrl] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [submittedToYSWS, setSubmittedToYSWS] = useState(false);
  const [isMonthlyChallenge, setIsMonthlyChallenge] = useState(false);
  const [isForSnoozefest, setIsForSnoozefest] = useState(false);
  const [repoUrlError, setRepoUrlError] = useState<string | null>(null);
  const [playableUrlError, setPlayableUrlError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!projectId) {
      router.push("/portal");
      return;
    }

    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Failed to fetch project:", data.error);
          router.push("/portal");
        } else {
          setProject(data.project);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch project:", err);
        setLoading(false);
        router.push("/portal");
      });
  }, [projectId, router]);

  const handleStep1Yeah = () => {
    setStep1Confirmed(true);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setScreenshotError("Screenshot must be 5MB or less");
        setScreenshot(null);
        setScreenshotPreview(null);
        e.target.value = ""; // Clear the input
        return;
      }

      setScreenshotError(null);
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const checkUrlValidity = async (url: string): Promise<boolean> => {
    try {
      const parsed = new URL(url);
      // Only allow http/https protocols
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleNext = async () => {
    // Reset errors
    setRepoUrlError(null);
    setPlayableUrlError(null);

    if (!step1Confirmed) {
      alert("Please confirm the project information before proceeding");
      return;
    }
    if (!githubUsername || !repoUrl || !playableUrl || !screenshot) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate URLs
    setIsValidating(true);
    let hasErrors = false;

    // Validate both URLs concurrently
    const [isRepoValid, isPlayableValid] = await Promise.all([
      checkUrlValidity(repoUrl),
      checkUrlValidity(playableUrl)
    ]);

    if (!isRepoValid) {
      setRepoUrlError("Please enter a valid and accessible URL");
      hasErrors = true;
    }

    if (!isPlayableValid) {
      setPlayableUrlError("Please enter a valid and accessible URL");
      hasErrors = true;
    }

    setIsValidating(false);

    if (hasErrors) {
      return;
    }

    sessionStorage.setItem("shipData", JSON.stringify({
      githubUsername,
      repoUrl,
      playableUrl,
      screenshot: screenshot ? screenshot.name : null,
      submittedToYSWS,
      isMonthlyChallenge,
      isForSnoozefest
    }));

    if (screenshot) {
      const reader = new FileReader();
      reader.onloadend = () => {
        sessionStorage.setItem("shipScreenshot", reader.result as string);
        router.push(`/portal/forms/ship/info?projectId=${projectId}`);
      };
      reader.readAsDataURL(screenshot);
    } else {
      router.push(`/portal/forms/ship/info?projectId=${projectId}`);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div
      className="min-h-screen relative font-sans pb-12"
      style={{
        background: "#C0DEFE",
      }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none z-0"
        style={{
          backgroundImage: "url('/background/bunny-tile.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "213px 210px",
        }}
      />

      {/* Ship Title */}
      <div className="flex justify-center pt-8 relative z-10">
        <h1 className="text-[64px] md:text-[96px] text-center">
          <GradientText
            gradient="#89A8EF"
            strokeWidth="10px"
            className="text-[64px] md:text-[96px]"
          >
            Ship
          </GradientText>
        </h1>
      </div>

      {/* Main Card */}
      <div className="relative z-10 mx-auto mt-8 max-w-[1200px] px-4">
        <div
          className="relative rounded-[24px] p-6 md:p-10"
          style={{
            background: "linear-gradient(180deg, #FFF2D4 42%, #FFE8B2 100%)",
            border: "8px solid white",
            boxShadow: "0px 8px 8px rgba(116,114,160,0.56)",
          }}
        >
          {/* Project Details Title */}
          <h2 className="text-[32px] md:text-[40px] font-bold mb-6">
            <GradientText
              gradient="#D48890"
              strokeWidth="6px"
              className="text-[32px] md:text-[40px]"
            >
              Project Details
            </GradientText>
          </h2>

          {/* Step 1 */}
          <p className="text-[24px] md:text-[32px] font-bold mb-4">
            <GradientText
              gradient="#A8AAEB"
              strokeWidth="4px"
              className="text-[24px] md:text-[32px]"
            >
              1. Verify current information:
            </GradientText>
          </p>

          {/* Project Info Box */}
          {loading ? (
            <div className="text-center py-8">
              <p
                className="text-[20px]"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  color: "#7472A0",
                }}
              >
                Loading project details...
              </p>
            </div>
          ) : project ? (
            <div
              className="rounded-[24px] p-6 mb-6"
              style={{
                background: "linear-gradient(to top, #FFF2D4 42%, #FFE8B2 100%)",
                boxShadow: "0px 4px 4px rgba(116,114,160,0.29)",
              }}
            >
              <div>
                <h3 className="text-[36px] md:text-[48px] font-bold">
                  <GradientText
                    gradient="linear-gradient(180deg, #7791E6 0%, #7472A0 100%)"
                    strokeWidth="4px"
                    className="text-[36px] md:text-[48px]"
                  >
                    {project.name}
                  </GradientText>
                </h3>
                <div className="flex items-center gap-2 mb-5">
                  {project.desc ? (
                    <span
                      className="text-[20px] md:text-[24px] font-bold underline"
                      style={{
                        fontFamily: "'MADE Tommy Soft', sans-serif",
                        background: "linear-gradient(180deg, #93B4F2 0%, #6988E0 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {project.desc}
                    </span>
                  ) : (
                    <p
                      className="text-[16px] md:text-[18px] font-bold"
                      style={{
                        fontFamily: "'MADE Tommy Soft', sans-serif",
                        color: "#D84855",
                      }}
                    >
                      No description yet — go back to your project and add one before shipping!
                    </p>
                  )}
                </div>

                <label
                className="block text-[24px] md:text-[28px] font-medium mb-2"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  color: "#7472A0",
                }}
              >
                Hackatime Data:
              </label>
                {/* Hours */}
                <div className="flex items-center gap-2 mt-2">
                  <Image
                    src="/icons/star.svg"
                    alt="star"
                    width={28}
                    height={25}
                  />
                  <span
                    className="text-[20px] md:text-[24px] font-bold underline"
                    style={{
                      fontFamily: "'MADE Tommy Soft', sans-serif",
                      background: "linear-gradient(180deg, #93B4F2 0%, #6988E0 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {project.hours.toFixed(1)} hours tracked
                  </span>
                </div>

                {/* Hackatime */}
                <div className="flex items-center gap-2 mt-2">
                  <Image
                    src="/icons/star.svg"
                    alt="star"
                    width={28}
                    height={25}
                  />
                  <span
                    className="text-[20px] md:text-[24px] font-bold underline"
                    style={{
                      fontFamily: "'MADE Tommy Soft', sans-serif",
                      background: "linear-gradient(180deg, #93B4F2 0%, #6988E0 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {(() => {
                      if (!project.hackatime_name) {
                        return "GirlsWhoCode Project";
                      }
                      try {
                        const projects = JSON.parse(project.hackatime_name);
                        if (Array.isArray(projects) && projects.length > 0) {
                          return projects.join(", ");
                        }
                      } catch {
                        // Not JSON, display as-is for backward compatibility
                      }
                      return project.hackatime_name;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* "this look good?" text and Step 1 buttons */}
          <div className="text-center mb-8">
            <p
              className="text-[20px] md:text-[24px] font-bold mb-4 underline"
              style={{
                fontFamily: "'MADE Tommy Soft', sans-serif",
                background: "linear-gradient(180deg, #7791E6 0%, #7472A0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              this look good?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleStep1Yeah}
                disabled={!project?.desc}
                className={`relative rounded-[16px] px-6 py-2 transition-transform ${!project?.desc ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                style={{
                  background: "linear-gradient(180deg, #869BE7 0%, #B2BDF1 100%)",
                  border: "4px solid white",
                  boxShadow: "0px 4px 0px #C6C7E4, 0px 6px 8px rgba(116,114,160,0.69)",
                }}
              >
                <div
                  className="absolute inset-[4px] rounded-[12px] pointer-events-none"
                  style={{
                    background: "linear-gradient(to top, #849AE7 0%, #B2BDF1 68%)",
                    boxShadow: "0px 2px 2px rgba(116,114,160,0.33)",
                  }}
                />
                <span
                  className="relative z-10 text-[18px] md:text-[24px] font-bold flex items-center gap-2"
                  style={{
                    fontFamily: "'MADE Tommy Soft', sans-serif",
                    color: "#4E5DA9",
                  }}
                >
                  YEAH!
                  {step1Confirmed && (
                    <span className="text-green-600 text-[24px] md:text-[28px]">✓</span>
                  )}
                </span>
              </button>
              <button
                onClick={handleGoBack}
                className="relative rounded-[16px] px-4 py-2 transition-transform hover:scale-105"
                style={{
                  background: "linear-gradient(180deg, #6078C4 0%, #6F96DD 100%)",
                  border: "4px solid white",
                  boxShadow: "0px 4px 0px #C6C7E4, 0px 6px 8px rgba(116,114,160,0.69)",
                }}
              >
                <div
                  className="absolute inset-[4px] rounded-[12px] pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, #96B5E4 0%, #5790FA 100%)",
                    boxShadow: "0px 2px 2px rgba(23,20,88,0.33)",
                  }}
                />
                <div
                  className="relative z-10 text-center"
                  style={{
                    fontFamily: "'MADE Tommy Soft', sans-serif",
                    color: "#4E5DA9",
                  }}
                >
                  <p className="text-[16px] md:text-[20px] font-bold">wait...</p>
                  <p className="text-[10px] md:text-[14px] font-bold">(go back)</p>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <p className="text-[24px] md:text-[32px] font-bold mb-4">
            <GradientText
              gradient="#A8AAEB"
              strokeWidth="4px"
              className="text-[24px] md:text-[32px]"
            >
              2. Add more information:
            </GradientText>
          </p>

          {/* Step 2 form box */}
          <div
            className="rounded-[24px] p-6 mb-6"
            style={{
              background: "linear-gradient(to top, #FFF2D4 42%, #FFE8B2 100%)",
              boxShadow: "0px 4px 4px rgba(116,114,160,0.29)",
            }}
          >
            {/* Screenshot */}
            <div className="mb-6">
              <label
                className="block text-[24px] md:text-[28px] font-medium mb-2"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  color: "#7472A0",
                }}
              >
                Screenshot <span style={{ color: "#D84855" }}>*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotChange}
                id="screenshot-upload"
                className="hidden"
              />
              <label
                htmlFor="screenshot-upload"
                className="block w-[200px] h-[130px] rounded-[12px] flex items-center justify-center cursor-pointer overflow-hidden"
                style={{
                  background: screenshotPreview ? "transparent" : "#E7AAB2",
                  opacity: screenshotPreview ? 1 : 0.5,
                  boxShadow: "0px 4px 8px #6C6EA0",
                }}
              >
                {screenshotPreview ? (
                  <Image
                    src={screenshotPreview}
                    alt="Screenshot preview"
                    width={200}
                    height={130}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span
                    className="text-[16px] md:text-[20px] font-medium"
                    style={{
                      fontFamily: "'MADE Tommy Soft', sans-serif",
                      color: "#D48890",
                    }}
                  >
                    upload image here
                  </span>
                )}
              </label>
              {screenshotError && (
                <p
                  className="mt-2 text-[16px] md:text-[18px] font-bold"
                  style={{
                    fontFamily: "'MADE Tommy Soft', sans-serif",
                    color: "#D84855",
                  }}
                >
                  ⚠️ {screenshotError}
                </p>
              )}
            </div>

            {/* GitHub Username */}
            <div className="mb-4">
              <label
                className="block text-[24px] md:text-[28px] font-medium mb-2"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  color: "#7472A0",
                }}
              >
                GitHub Username
              </label>
              <input
                type="text"
                id="github"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="username"
                className="w-full rounded-[12px] px-4 py-3 text-[#6C6EA0] text-lg outline-none"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  background: "white",
                  boxShadow: "0px 4px 4px rgba(116,114,160,0.62), inset 2px 4px 8px rgba(116,114,160,0.29)",
                }}
              />
            </div>

            {/* Repo URL */}
            <div className="mb-4">
              <label
                className="block text-[24px] md:text-[28px] font-medium mb-2"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  color: "#7472A0",
                }}
              >
                Repository URL
              </label>
              <input
                type="url"
                id="code"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full rounded-[12px] px-4 py-3 text-[#6C6EA0] text-lg outline-none"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  background: "white",
                  boxShadow: "0px 4px 4px rgba(116,114,160,0.62), inset 2px 4px 8px rgba(116,114,160,0.29)",
                }}
              />
              {repoUrlError && (
                <p
                  className="mt-2 text-[16px] md:text-[18px] font-bold"
                  style={{
                    fontFamily: "'MADE Tommy Soft', sans-serif",
                    color: "#D84855",
                  }}
                >
                  ⚠️ {repoUrlError}
                </p>
              )}
            </div>

            {/* Playable Project Link */}
            <div className="mb-4">
              <label
                className="block text-[24px] md:text-[28px] font-medium mb-2"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  color: "#7472A0",
                }}
              >
                Link to Playable/Live Project
              </label>
              <input
                type="url"
                value={playableUrl}
                onChange={(e) => setPlayableUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-[12px] px-4 py-3 text-[#6C6EA0] text-lg outline-none"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  background: "white",
                  boxShadow: "0px 4px 4px rgba(116,114,160,0.62), inset 2px 4px 8px rgba(116,114,160,0.29)",
                }}
              />
              {playableUrlError && (
                <p
                  className="mt-2 text-[16px] md:text-[18px] font-bold"
                  style={{
                    fontFamily: "'MADE Tommy Soft', sans-serif",
                    color: "#D84855",
                  }}
                >
                  ⚠️ {playableUrlError}
                </p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="mt-6 mb-4">
              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  id="ysws"
                  type="checkbox"
                  checked={submittedToYSWS}
                  onChange={(e) => setSubmittedToYSWS(e.target.checked)}
                  className="w-6 h-6 rounded-[6px] accent-[#869BE7] cursor-pointer"
                  style={{
                    boxShadow: "0px 2px 4px rgba(116,114,160,0.4)",
                  }}
                />
                <GradientText
                  gradient="#7472A0"
                  strokeWidth="3px"
                  className="text-[20px] md:text-[24px]"
                >
                  Was this project submitted to another You Ship We Ship?
                </GradientText>
              </label>
            </div>

            <div className="mt-4 mb-4">
              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  id="challenge"
                  type="checkbox"
                  checked={isMonthlyChallenge}
                  onChange={(e) => setIsMonthlyChallenge(e.target.checked)}
                  className="w-6 h-6 rounded-[6px] accent-[#869BE7] cursor-pointer"
                  style={{
                    boxShadow: "0px 2px 4px rgba(116,114,160,0.4)",
                  }}
                />
                <GradientText
                  gradient="#7472A0"
                  strokeWidth="3px"
                  className="text-[20px] md:text-[24px]"
                >
                  Was this for a monthly challenge?
                </GradientText>
              </label>
            </div>
            
            {shouldShowSnoozefestCheckbox() && (
              <div className="mt-4 mb-4">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input
                    id="challenge"
                    type="checkbox"
                    checked={isForSnoozefest}
                    onChange={(e) => setIsForSnoozefest(e.target.checked)}
                    className="w-6 h-6 rounded-[6px] accent-[#869BE7] cursor-pointer"
                    style={{
                      boxShadow: "0px 2px 4px rgba(116,114,160,0.4)",
                    }}
                  />
                  <GradientText
                    gradient="#7472A0"
                    strokeWidth="3px"
                    className="text-[20px] md:text-[24px]"
                  >
                    Was this for snoozefest?
                  </GradientText>
                </label>
              </div>
            )}
          </div>


          {/* NEXT buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleNext}
              disabled={isValidating}
              className="relative rounded-[16px] px-6 py-2 transition-transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(180deg, #869BE7 0%, #B2BDF1 100%)",
                border: "4px solid white",
                boxShadow: "0px 4px 0px #C6C7E4, 0px 6px 8px rgba(116,114,160,0.69)",
              }}
            >
              <div
                className="absolute inset-[4px] rounded-[12px] pointer-events-none"
                style={{
                  background: "linear-gradient(to top, #849AE7 0%, #B2BDF1 68%)",
                  boxShadow: "0px 2px 2px rgba(116,114,160,0.33)",
                }}
              />
              <span
                className="relative z-10 text-[18px] md:text-[24px] font-bold"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  color: "#4E5DA9",
                }}
              >
                {isValidating ? "Validating..." : "NEXT!"}
              </span>
            </button>
            <button
              onClick={handleGoBack}
              className="relative rounded-[16px] px-4 py-2 transition-transform hover:scale-105"
              style={{
                background: "linear-gradient(180deg, #6078C4 0%, #6F96DD 100%)",
                border: "4px solid white",
                boxShadow: "0px 4px 0px #C6C7E4, 0px 6px 8px rgba(116,114,160,0.69)",
              }}
            >
              <div
                className="absolute inset-[4px] rounded-[12px] pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, #96B5E4 0%, #5790FA 100%)",
                  boxShadow: "0px 2px 2px rgba(23,20,88,0.33)",
                }}
              />
              <div
                className="relative z-10 text-center"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  color: "#4E5DA9",
                }}
              >
                <p className="text-[16px] md:text-[20px] font-bold">wait...</p>
                <p className="text-[10px] md:text-[14px] font-bold">(go back)</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShipDetailsPage() {
  return (
    <Suspense fallback={
      <div
        className="min-h-screen relative font-sans pb-12 flex items-center justify-center"
        style={{
          background: "#C0DEFE",
        }}
      >
        <p
          className="text-[24px] font-bold"
          style={{
            fontFamily: "'MADE Tommy Soft', sans-serif",
            color: "#7472A0",
          }}
        >
          Loading...
        </p>
      </div>
    }>
      <ShipDetailsContent />
    </Suspense>
  );
}
