"use client";

import { useState, useEffect } from "react";
import PortalSidebar from "../../components/PortalSidebar";
import GradientText from "@/app/components/GradientText";

interface Event {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  description: string;
  type: "huddle" | "challenge" | "social" | "deadline";
  joinUrl?: string;
}

const FALLBACK_EVENTS: Event[] = [
  {
    id: "1",
    title: "Lock In Huddle",
    date: "2026-03-10",
    time: "7:00 PM ET",
    description: "Weekly lock-in session — bring your project and code alongside the community!",
    type: "huddle",
  },
  {
    id: "2",
    title: "Lock In Huddle",
    date: "2026-03-17",
    time: "7:00 PM ET",
    description: "Weekly lock-in session — bring your project and code alongside the community!",
    type: "huddle",
  },
  {
    id: "3",
    title: "March Challenge Deadline",
    date: "2026-03-31",
    description: "Last day to submit your March challenge project for feathers!",
    type: "deadline",
  },
  {
    id: "4",
    title: "Lock In Huddle",
    date: "2026-03-24",
    time: "7:00 PM ET",
    description: "Weekly lock-in session — bring your project and code alongside the community!",
    type: "huddle",
  },
  {
    id: "5",
    title: "Show & Tell",
    date: "2026-03-28",
    time: "7:00 PM ET",
    description: "Share what you've been building! Show off your project to the Sleepover community.",
    type: "social",
  },
  {
    id: "6",
    title: "Lock In Huddle",
    date: "2026-04-07",
    time: "7:00 PM ET",
    description: "Weekly lock-in session — bring your project and code alongside the community!",
    type: "huddle",
  },
  {
    id: "7",
    title: "Lock In Huddle",
    date: "2026-04-14",
    time: "7:00 PM ET",
    description: "Weekly lock-in session — bring your project and code alongside the community!",
    type: "huddle",
  },
  {
    id: "8",
    title: "April Challenge Drop",
    date: "2026-04-01",
    description: "New monthly challenge goes live — check the portal for details!",
    type: "challenge",
  },
];

const TYPE_STYLES: Record<Event["type"], { bg: string; border: string; label: string; dot: string }> = {
  huddle: {
    bg: "#ddeeff",
    border: "#9AC6F6",
    label: "Huddle",
    dot: "#6D90E3",
  },
  challenge: {
    bg: "#fce8ed",
    border: "#DFA1AA",
    label: "Challenge",
    dot: "#DFA1AA",
  },
  social: {
    bg: "#fff8e6",
    border: "#FFE8B2",
    label: "Social",
    dot: "#f0c060",
  },
  deadline: {
    bg: "#f5dde3",
    border: "#c47a8a",
    label: "Deadline",
    dot: "#c47a8a",
  },
};


function parseDate(dateStr: string): Date {
  const datePart = dateStr?.split("T")[0] ?? "";
  return new Date(datePart + "T00:00:00");
}

function isUpcoming(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseDate(dateStr) >= today;
}

function groupByMonth(events: Event[]): { monthLabel: string; monthKey: string; events: Event[] }[] {
  const map = new Map<string, Event[]>();
  for (const e of events) {
    const d = parseDate(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, evts]) => ({
      monthKey: key,
      monthLabel: new Date(key + "-01T00:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      events: evts.sort((a, b) => a.date.localeCompare(b.date)),
    }));
}

export default function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<Event["type"]>>(new Set());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetch("/api/calendar")
      .then((res) => res.json())
      .then((data) => {
        // Use Airtable data if available, fall back to hardcoded only on error
        setEvents(Array.isArray(data) ? data : FALLBACK_EVENTS);
      })
      .catch(() => {
        setEvents(FALLBACK_EVENTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleFilter = (type: Event["type"]) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const filteredEvents = activeFilters.size === 0
    ? events
    : events.filter((e: Event) => activeFilters.has(e.type));

  const months = groupByMonth(filteredEvents);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('/background/tile.png')",
        backgroundRepeat: "repeat",
      }}
    >
      <PortalSidebar onStateChange={setSidebarOpen} />

      <main
        className="flex-1 p-4 md:p-8 lg:p-12 pt-16 md:pt-8 transition-all duration-300"
        style={{
          marginLeft: isMobile ? "0px" : sidebarOpen ? "clamp(320px, 25vw, 520px)" : "96px",
          marginRight: isMobile ? "0px" : "32px",
        }}
      >
        {/* Page title */}
        <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold text-center mb-2 relative">
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              fontFamily: "'MADE Tommy Soft', sans-serif",
              WebkitTextStroke: isMobile ? "5px white" : "8px white",
              color: "transparent",
              filter: "drop-shadow(0px 4px 0px #c6c7e4)",
            }}
          >
            Events
          </span>
          <span
            className="relative bg-gradient-to-b from-[#b7c1f2] to-[#89a8ef] bg-clip-text"
            style={{
              fontFamily: "'MADE Tommy Soft', sans-serif",
              WebkitTextFillColor: "transparent",
            }}
          >
            Events
          </span>
        </h1>

        <p className="text-center mb-10 md:mb-14 text-base md:text-lg lg:text-2xl px-2">
          <GradientText gradient="#6c6ea0" strokeWidth={isMobile ? "2px" : "4px"}>
            lock in huddles, challenges, and more — see what&apos;s coming up!
          </GradientText>
        </p>

        {/* Legend / filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {(Object.entries(TYPE_STYLES) as [Event["type"], typeof TYPE_STYLES[Event["type"]]][]).map(([type, style]) => {
            const active = activeFilters.has(type);
            const dimmed = activeFilters.size > 0 && !active;
            return (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 hover:scale-105"
                style={{
                  background: active ? style.dot : style.bg,
                  border: `2px solid ${active ? style.dot : style.border}`,
                  fontFamily: "'MADE Tommy Soft', sans-serif",
                  color: active ? "white" : "#5A5C8A",
                  opacity: dimmed ? 0.45 : 1,
                  cursor: "pointer",
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: active ? "white" : style.dot }} />
                {style.label}
              </button>
            );
          })}
          {activeFilters.size > 0 && (
            <button
              onClick={() => setActiveFilters(new Set())}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 hover:scale-105"
              style={{
                background: "#eeeef6",
                border: "2px solid #c8c8e0",
                fontFamily: "'MADE Tommy Soft', sans-serif",
                color: "#7472A0",
                cursor: "pointer",
              }}
            >
              clear filters ✕
            </button>
          )}
        </div>

        {/* Month sections */}
        {loading ? (
          <p className="text-center py-16" style={{ fontFamily: "'MADE Tommy Soft', sans-serif", color: "#9a9cca" }}>
            Loading events...
          </p>
        ) : months.length === 0 ? (
          <p className="text-center py-16" style={{ fontFamily: "'MADE Tommy Soft', sans-serif", color: "#9a9cca" }}>
            No events yet — check back soon!
          </p>
        ) : null}
        <div className="flex flex-col gap-14 mb-16">
          {months.map(({ monthKey, monthLabel, events }) => {
            const isPast = events.every((e) => !isUpcoming(e.date));
            return (
              <section key={monthKey} className={isPast ? "opacity-60" : ""}>
                {/* Month heading */}
                <h2
                  className="text-3xl md:text-4xl font-bold mb-6"
                  style={{
                    fontFamily: "'MADE Tommy Soft', sans-serif",
                    color: isPast ? "#9a9cca" : "#5A5C8A",
                  }}
                >
                  {monthLabel}
                </h2>

                {/* Event grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((event) => {
                    const style = TYPE_STYLES[event.type];
                    const past = !isUpcoming(event.date);
                    return (
                      <div
                        key={event.id}
                        className="rounded-2xl p-4 md:p-5 flex flex-col gap-3"
                        style={{
                          background: past ? "#eeeef6" : style.bg,
                          border: `2px solid ${past ? "#c8c8e0" : style.border}`,
                        }}
                      >
                        {/* Top row: date + type badge */}
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className="rounded-xl px-3 py-1.5 text-center"
                            style={{
                              background: "white",
                              border: `1.5px solid ${past ? "#c8c8e0" : style.border}`,
                              minWidth: "60px",
                            }}
                          >
                            <p
                              className="text-[11px] font-bold uppercase tracking-wide leading-none"
                              style={{
                                fontFamily: "'MADE Tommy Soft', sans-serif",
                                color: past ? "#aaaacc" : style.dot,
                              }}
                            >
                              {parseDate(event.date).toLocaleDateString("en-US", { weekday: "short" })}
                            </p>
                            <p
                              className="text-2xl font-bold leading-tight"
                              style={{
                                fontFamily: "'MADE Tommy Soft', sans-serif",
                                color: past ? "#8a8cba" : "#4a4c78",
                              }}
                            >
                              {String(parseDate(event.date).getDate())}
                            </p>
                          </div>

                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{
                              background: past ? "#e0e0f0" : style.bg,
                              color: past ? "#9a9cca" : style.dot,
                              fontFamily: "'MADE Tommy Soft', sans-serif",
                              border: `1.5px solid ${past ? "#c8c8e0" : style.border}`,
                            }}
                          >
                            {style.label}
                          </span>
                        </div>

                        {/* Title + time */}
                        <div>
                          <h3
                            className="text-lg font-bold leading-tight"
                            style={{
                              fontFamily: "'MADE Tommy Soft', sans-serif",
                              color: past ? "#8a8cba" : "#4a4c78",
                            }}
                          >
                            {event.title}
                          </h3>
                          {event.time && (
                            <p
                              className="text-sm mt-0.5"
                              style={{
                                fontFamily: "'MADE Tommy Soft', sans-serif",
                                color: past ? "#aaaacc" : "#7472A0",
                              }}
                            >
                              {event.time}
                            </p>
                          )}
                        </div>

                        {/* Description */}
                        <p
                          className="text-sm"
                          style={{
                            fontFamily: "'MADE Tommy Soft', sans-serif",
                            color: past ? "#aaaacc" : "#6c6ea0",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {event.description}
                        </p>

                        {event.joinUrl && (
                          <a
                            href={event.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-sm font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
                            style={{
                              background: past ? "#e0e0f0" : style.bg,
                              color: past ? "#9a9cca" : style.dot,
                              border: `1.5px solid ${past ? "#c8c8e0" : style.border}`,
                              fontFamily: "'MADE Tommy Soft', sans-serif",
                            }}
                          >
                            Join ↗
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
