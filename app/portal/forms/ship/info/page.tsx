"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GradientText from "@/app/components/GradientText";
import { shipProject } from "@/app/forms/actions/shipProject";

function ShipInfoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthdate: "",
    ysws: "",
    challenge: "",
  });
  const [address, setAddress] = useState({
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  useEffect(() => {
    fetch("/api/user/info")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            birthdate: data.birthday || "",
            ysws: data.ysws || "",
            challenge: data.challenge || "",
          });
          setAddress({
            address1: data.address1 || "",
            address2: data.address2 || "",
            city: data.city || "",
            state: data.state || "",
            zip: data.zip || "",
            country: data.country || "",
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch address:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!projectId) {
      alert("Project ID is missing");
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.birthdate) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate that user has an address
    if (!address.address1 || !address.city || !address.state || !address.zip || !address.country) {
      alert("Please add a primary address on Hack Club Auth before shipping your project. Click 'Manage Addresses' to add one.");
      return;
    }

    setSubmitting(true);

    try {
      // Get ship data from sessionStorage
      const shipDataStr = sessionStorage.getItem("shipData");
      const screenshotDataUrl = sessionStorage.getItem("shipScreenshot");

      if (!shipDataStr) {
        alert("Shipping details are missing. Please go back and fill in the details.");
        setSubmitting(false);
        return;
      }

      const shipData = JSON.parse(shipDataStr);

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append("playable", shipData.playableUrl);
      formDataToSend.append("code", shipData.repoUrl);
      formDataToSend.append("github", shipData.githubUsername);

      // Add address information
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("birthdate", formData.birthdate);
      // Convert boolean values from shipData to string booleans for Airtable checkbox fields
      formDataToSend.append("ysws", String(shipData.submittedToYSWS));
      formDataToSend.append("challenge", String(shipData.isMonthlyChallenge));
      formDataToSend.append("isForSnoozefest", String(shipData.isForSnoozefest))
      // Convert base64 screenshot to File if exists
      if (screenshotDataUrl) {
        const [header, base64Data] = screenshotDataUrl.split(",");
        const mimeMatch = header.match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
        const byteString = atob(base64Data);
        const arrayBuffer = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
          arrayBuffer[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: mimeType });
        const file = new File([blob], shipData.screenshot || "screenshot.png", { type: mimeType });
        formDataToSend.append("screenshot", file);
      }

      // Call the server action
      const result = await shipProject(formDataToSend, projectId);

      if (result.success) {
        // Clean up sessionStorage
        sessionStorage.removeItem("shipData");
        sessionStorage.removeItem("shipScreenshot");

        // Redirect to portal
        router.push("/portal");
      }
    } catch (error) {
      console.error("Error shipping project:", error);
      alert(`Failed to ship project. Please try again. ${error}`);
      setSubmitting(false);
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
          {/* Your Info Title */}
          <h2 className="text-[32px] md:text-[40px] font-bold mb-8">
            <GradientText
              gradient="#D48890"
              strokeWidth="6px"
              className="text-[32px] md:text-[40px]"
            >
              Your Info
            </GradientText>
          </h2>

          {loading ? (
            <p
              className="text-center text-[20px] py-8"
              style={{
                fontFamily: "'MADE Tommy Soft', sans-serif",
                color: "#7472A0",
              }}
            >
              Loading your info...
            </p>
          ) : (
          <>
          {/* Form Fields */}
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label
                className="block text-[24px] md:text-[28px] font-medium mb-2"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  color: "#7472A0",
                }}
              >
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full rounded-[12px] px-4 py-3 text-[#6C6EA0] text-lg outline-none"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  background: "white",
                  boxShadow: "0px 4px 4px rgba(116,114,160,0.62), inset 2px 4px 8px rgba(116,114,160,0.29)",
                }}
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                className="block text-[24px] md:text-[28px] font-medium mb-2"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  color: "#7472A0",
                }}
              >
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full rounded-[12px] px-4 py-3 text-[#6C6EA0] text-lg outline-none"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  background: "white",
                  boxShadow: "0px 4px 4px rgba(116,114,160,0.62), inset 2px 4px 8px rgba(116,114,160,0.29)",
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-[24px] md:text-[28px] font-medium mb-2"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  color: "#7472A0",
                }}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-[12px] px-4 py-3 text-[#6C6EA0] text-lg outline-none"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  background: "white",
                  boxShadow: "0px 4px 4px rgba(116,114,160,0.62), inset 2px 4px 8px rgba(116,114,160,0.29)",
                }}
              />
            </div>

            {/* Birthdate */}
            <div>
              <label
                className="block text-[24px] md:text-[28px] font-medium mb-2"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  color: "#7472A0",
                }}
              >
                Birthdate
              </label>
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                className="w-full rounded-[12px] px-4 py-3 text-[#6C6EA0] text-lg outline-none"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  background: "white",
                  boxShadow: "0px 4px 4px rgba(116,114,160,0.62), inset 2px 4px 8px rgba(116,114,160,0.29)",
                }}
              />
            </div>

            {/* Shipping Address Display */}
            <div className="mt-6">
              <label
                className="block text-[24px] md:text-[28px] font-medium mb-2"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  color: "#7472A0",
                }}
              >
                Shipping Address (Primary on Hack Club Auth)
              </label>
              <div
                className="w-full rounded-[12px] px-4 py-3 text-[#6C6EA0] text-lg"
                style={{
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  background: "#F5F0FF",
                  border: "2px solid #E8E4F3",
                }}
              >
                {address.address1 || address.city || address.state || address.zip || address.country ? (
                  <>
                    {address.address1 && <p>{address.address1}</p>}
                    {address.address2 && <p>{address.address2}</p>}
                    <p>
                      {[address.city, address.state, address.zip].filter(Boolean).join(", ")}
                    </p>
                    {address.country && <p>{address.country}</p>}
                  </>
                ) : (
                  <p className="text-[#9B9DB8]">No address on file</p>
                )}
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => window.open("https://auth.hackclub.com/addresses", "_blank")}
                  className="bg-gradient-to-t from-[#d9daf8] to-[#b5aae7] border-4 border-white rounded-2xl px-6 py-2 shadow-[0px_4px_0px_0px_#c6c7e4,0px_6px_8px_0px_rgba(116,114,160,0.69)] hover:scale-105 transition-transform"
                >
                  <span
                    className="bg-gradient-to-b from-[#7684c9] to-[#7472a0] bg-clip-text text-transparent text-lg font-bold"
                    style={{ fontFamily: "'MADE Tommy Soft', sans-serif" }}
                  >
                    Manage Addresses ↗
                  </span>
                </button>
              </div>
            </div>
          </div>
          </>
          )}
        </div>

        {/* Time to Ship!! */}
        <h3 className="text-center text-[36px] md:text-[48px] font-bold mt-8">
          <GradientText
            gradient="#7791E6"
            strokeWidth="6px"
            className="text-[36px] md:text-[48px]"
          >
            <u>time to ship!!</u>
          </GradientText>
        </h3>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          {/* OK! Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || loading}
            className={`relative rounded-[16px] px-8 py-3 transition-transform ${
              submitting || loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
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
              className="relative z-10 text-[24px] md:text-[32px] font-bold"
              style={{
                fontFamily: "'MADE Tommy Soft', sans-serif",
                color: "#4E5DA9",
              }}
            >
              {submitting ? "Shipping..." : "OK!"}
            </span>
          </button>

          {/* Go Back Button */}
          <button
            onClick={handleGoBack}
            className="relative rounded-[16px] px-6 py-3 transition-transform hover:scale-105"
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
              <p className="text-[12px] md:text-[14px] font-bold">(go back)</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShipInfoPage() {
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
      <ShipInfoContent />
    </Suspense>
  );
}
