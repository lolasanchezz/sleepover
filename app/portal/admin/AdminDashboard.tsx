"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type EventType = "huddle" | "challenge" | "social" | "deadline";

interface Submission {
  id: string;
  project: string;
  description: string;
  displayname: string;
  email: string;
  hours: number;
  playableUrl: string;
  codeUrl: string;
  screenshot: unknown;
  status: string;
  ysws: string;
  challenge: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  description: string;
  type: EventType;
  joinUrl?: string;
}

const TYPE_STYLES: Record<EventType, { bg: string; border: string; label: string; dot: string }> = {
  huddle: { bg: "#ddeeff", border: "#9AC6F6", label: "Huddle", dot: "#6D90E3" },
  challenge: { bg: "#fce8ed", border: "#DFA1AA", label: "Challenge", dot: "#DFA1AA" },
  social: { bg: "#fff8e6", border: "#FFE8B2", label: "Social", dot: "#f0c060" },
  deadline: { bg: "#f5dde3", border: "#c47a8a", label: "Deadline", dot: "#c47a8a" },
};

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Approved: { bg: "#e6f9ee", color: "#2d8a55", border: "#86d8a8" },
  Rejected: { bg: "#fde8e8", color: "#c03535", border: "#f0a0a0" },
  Pending: { bg: "#fff8e1", color: "#9a7a10", border: "#f0d070" },
};

const FONT = "'MADE Tommy Soft', sans-serif";

function parseDate(dateStr: string | undefined | null): Date {
  if (!dateStr) return new Date(NaN);
  const datePart = dateStr.split("T")[0];
  return new Date(datePart + "T00:00:00");
}

function formatTime(time: string): string {
  // Handles both "HH:MM" (from type="time") and legacy free-text like "7:00 PM ET"
  if (!time) return "";
  if (time.includes("AM") || time.includes("PM")) return time;
  const [h, m] = time.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

const EMPTY_EVENT = { title: "", date: "", time: "", description: "", type: "huddle" as EventType, joinUrl: "" };

// Convert "7:00 PM" → "19:00" for <input type="time">
function timeToInput(time: string): string {
  if (!time) return "";
  if (!time.includes("AM") && !time.includes("PM")) return time;
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return "";
  let h = parseInt(match[1]);
  const m = match[2];
  const period = match[3].toUpperCase();
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${m}`;
}

export default function AdminDashboard({ userName }: { userName: string }) {
  const [tab, setTab] = useState<"projects" | "calendar">("projects");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [newEvent, setNewEvent] = useState(EMPTY_EVENT);
  const [adding, setAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EVENT);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/projects");
    const data = await res.json();
    setSubmissions(data);
    setLoading(false);
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/calendar");
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "projects") fetchSubmissions();
    else fetchEvents();
  }, [tab, fetchSubmissions, fetchEvents]);

  async function updateStatus(recordId: string, status: "Approved" | "Rejected" | "Pending") {
    setUpdatingId(recordId);
    await fetch("/api/admin/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordId, status }),
    });
    setSubmissions((prev) =>
      prev.map((s) => (s.id === recordId ? { ...s, status } : s))
    );
    setUpdatingId(null);
  }

  async function addEvent() {
    if (!newEvent.title || !newEvent.date || !newEvent.description) return;
    setAdding(true);
    const payload = {
      ...newEvent,
      time: newEvent.time ? formatTime(newEvent.time) : undefined,
      joinUrl: newEvent.joinUrl || undefined,
    };
    const res = await fetch("/api/admin/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const created = await res.json();
    if (created.error || !created.id) {
      console.error("Failed to create event:", created.error);
      setAdding(false);
      return;
    }
    setEvents((prev) => [...prev, created].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? "")));
    setNewEvent(EMPTY_EVENT);
    setAdding(false);
  }

  async function deleteEvent(eventId: string) {
    setUpdatingId(eventId);
    await fetch("/api/admin/calendar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setUpdatingId(null);
  }

  function startEdit(event: CalendarEvent) {
    setEditingId(event.id);
    setEditForm({
      title: event.title,
      date: event.date,
      time: timeToInput(event.time ?? ""),
      description: event.description,
      type: event.type,
      joinUrl: event.joinUrl ?? "",
    });
  }

  async function saveEdit(eventId: string) {
    if (!editForm.title || !editForm.date || !editForm.description) return;
    setUpdatingId(eventId);
    const payload = {
      eventId,
      ...editForm,
      time: editForm.time ? formatTime(editForm.time) : null,
      joinUrl: editForm.joinUrl || null,
    };
    const res = await fetch("/api/admin/calendar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const updated = await res.json();
    if (!updated.error) {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? updated : e)).sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
      );
    }
    setEditingId(null);
    setUpdatingId(null);
  }

  const filteredSubmissions =
    statusFilter === "All" ? submissions : submissions.filter((s) => s.status === statusFilter);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('/background/tile.png')",
        backgroundRepeat: "repeat",
        fontFamily: FONT,
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{
          background: "linear-gradient(180deg, rgba(217,218,248,0.97) 0%, rgba(255,240,253,0.97) 100%)",
          borderBottom: "2px solid #c8caf0",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/portal"
            className="text-sm font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-70"
            style={{ background: "#e8eaf8", color: "#5A5C8A", border: "1.5px solid #c0c2e8" }}
          >
            ← Portal
          </Link>
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ color: "#5A5C8A" }}
          >
            Admin Dashboard
          </h1>
        </div>
        <span
          className="text-sm font-semibold px-3 py-1.5 rounded-full"
          style={{ background: "#e8eaf8", color: "#7A7CA8", border: "1.5px solid #c0c2e8" }}
        >
          {userName}
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          {(["projects", "calendar"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-2.5 rounded-full font-bold text-base transition-all"
              style={{
                background:
                  tab === t
                    ? "linear-gradient(180deg, #8FB1F0 0%, #6D90E3 100%)"
                    : "#e8eaf8",
                color: tab === t ? "white" : "#5A5C8A",
                border: `2px solid ${tab === t ? "#6D90E3" : "#c0c2e8"}`,
                boxShadow: tab === t ? "0 2px 8px rgba(109,144,227,0.4)" : "none",
              }}
            >
              {t === "projects" ? "Project Review" : "Calendar"}
            </button>
          ))}
        </div>

        {/* PROJECT REVIEW TAB */}
        {tab === "projects" && (
          <div>
            {/* Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {["All", "Pending", "Approved", "Rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                  style={{
                    background: statusFilter === f ? "#5A5C8A" : "#e8eaf8",
                    color: statusFilter === f ? "white" : "#5A5C8A",
                    border: `1.5px solid ${statusFilter === f ? "#5A5C8A" : "#c0c2e8"}`,
                  }}
                >
                  {f}
                  {f !== "All" && (
                    <span
                      className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        background: statusFilter === f ? "rgba(255,255,255,0.25)" : "#d0d2f0",
                        color: statusFilter === f ? "white" : "#7A7CA8",
                      }}
                    >
                      {submissions.filter((s) => s.status === f).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <p style={{ color: "#7A7CA8" }} className="text-center py-16">
                Loading submissions...
              </p>
            ) : filteredSubmissions.length === 0 ? (
              <p style={{ color: "#7A7CA8" }} className="text-center py-16">
                No submissions found.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredSubmissions.map((s) => {
                  const statusStyle = STATUS_STYLES[s.status] ?? STATUS_STYLES.Pending;
                  const screenshots = Array.isArray(s.screenshot) ? s.screenshot : [];
                  const thumb = screenshots[0]?.thumbnails?.large?.url ?? screenshots[0]?.url;

                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl p-5 flex flex-col md:flex-row gap-4"
                      style={{
                        background: "rgba(255,255,255,0.85)",
                        border: "2px solid #dde0f8",
                        boxShadow: "0 2px 8px rgba(108,110,160,0.08)",
                      }}
                    >
                      {/* Screenshot thumbnail */}
                      {thumb && (
                        <img
                          src={thumb}
                          alt="screenshot"
                          className="w-full md:w-36 h-28 object-cover rounded-xl flex-shrink-0"
                          style={{ border: "1.5px solid #dde0f8" }}
                        />
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3
                            className="text-lg font-bold truncate"
                            style={{ color: "#4a4c78" }}
                          >
                            {s.project || "Untitled"}
                          </h3>
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{
                              background: statusStyle.bg,
                              color: statusStyle.color,
                              border: `1.5px solid ${statusStyle.border}`,
                            }}
                          >
                            {s.status}
                          </span>
                          {s.hours > 0 && (
                            <span
                              className="text-xs font-semibold px-2 py-1 rounded-full"
                              style={{ background: "#eef2ff", color: "#6D90E3", border: "1.5px solid #c0cef8" }}
                            >
                              {s.hours}h
                            </span>
                          )}
                        </div>

                        <p className="text-sm mb-1" style={{ color: "#7A7CA8" }}>
                          by {s.displayname || s.email}
                        </p>

                        {s.description && (
                          <p
                            className="text-sm mb-2 line-clamp-2"
                            style={{ color: "#6c6ea0" }}
                          >
                            {s.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-3">
                          {s.playableUrl && (
                            <a
                              href={s.playableUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-2.5 py-1 rounded-full font-semibold transition-opacity hover:opacity-70"
                              style={{ background: "#ddeeff", color: "#4a7ad8", border: "1.5px solid #9AC6F6" }}
                            >
                              Live Demo ↗
                            </a>
                          )}
                          {s.codeUrl && (
                            <a
                              href={s.codeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-2.5 py-1 rounded-full font-semibold transition-opacity hover:opacity-70"
                              style={{ background: "#e8eaf8", color: "#5A5C8A", border: "1.5px solid #c0c2e8" }}
                            >
                              Code ↗
                            </a>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2">
                          {(["Approved", "Rejected", "Pending"] as const).map((st) => (
                            <button
                              key={st}
                              disabled={s.status === st || updatingId === s.id}
                              onClick={() => updateStatus(s.id, st)}
                              className="text-xs px-3 py-1.5 rounded-full font-bold transition-all disabled:opacity-40"
                              style={{
                                background: s.status === st ? STATUS_STYLES[st].bg : "#f0f1fb",
                                color: s.status === st ? STATUS_STYLES[st].color : "#5A5C8A",
                                border: `1.5px solid ${s.status === st ? STATUS_STYLES[st].border : "#c0c2e8"}`,
                              }}
                            >
                              {updatingId === s.id ? "..." : st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CALENDAR TAB */}
        {tab === "calendar" && (
          <div>
            {/* Add event form */}
            <div
              className="rounded-2xl p-5 mb-8"
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "2px solid #dde0f8",
                boxShadow: "0 2px 8px rgba(108,110,160,0.08)",
              }}
            >
              <h2 className="text-lg font-bold mb-4" style={{ color: "#4a4c78" }}>
                Add Event
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input
                  placeholder="Title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent((p) => ({ ...p, title: e.target.value }))}
                  className="px-3 py-2 rounded-xl text-sm font-semibold outline-none"
                  style={{
                    background: "#f2f3fc",
                    border: "1.5px solid #c0c2e8",
                    color: "#4a4c78",
                    fontFamily: FONT,
                  }}
                />
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent((p) => ({ ...p, date: e.target.value }))}
                  className="px-3 py-2 rounded-xl text-sm font-semibold outline-none"
                  style={{
                    background: "#f2f3fc",
                    border: "1.5px solid #c0c2e8",
                    color: "#4a4c78",
                    fontFamily: FONT,
                  }}
                />
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent((p) => ({ ...p, time: e.target.value }))}
                  className="px-3 py-2 rounded-xl text-sm font-semibold outline-none"
                  style={{
                    background: "#f2f3fc",
                    border: "1.5px solid #c0c2e8",
                    color: newEvent.time ? "#4a4c78" : "#9a9cca",
                    fontFamily: FONT,
                  }}
                />
                <select
                  value={newEvent.type}
                  onChange={(e) =>
                    setNewEvent((p) => ({ ...p, type: e.target.value as EventType }))
                  }
                  className="px-3 py-2 rounded-xl text-sm font-semibold outline-none"
                  style={{
                    background: "#f2f3fc",
                    border: "1.5px solid #c0c2e8",
                    color: "#4a4c78",
                    fontFamily: FONT,
                  }}
                >
                  <option value="huddle">Huddle</option>
                  <option value="challenge">Challenge</option>
                  <option value="social">Social</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>
              <textarea
                placeholder="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent((p) => ({ ...p, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-xl text-sm font-semibold outline-none resize-none mb-3"
                style={{
                  background: "#f2f3fc",
                  border: "1.5px solid #c0c2e8",
                  color: "#4a4c78",
                  fontFamily: FONT,
                }}
              />
              <input
                placeholder="Join link (Zoom, Slack huddle, etc.) — optional"
                value={newEvent.joinUrl}
                onChange={(e) => setNewEvent((p) => ({ ...p, joinUrl: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-sm font-semibold outline-none mb-3"
                style={{
                  background: "#f2f3fc",
                  border: "1.5px solid #c0c2e8",
                  color: "#4a4c78",
                  fontFamily: FONT,
                }}
              />
              <button
                onClick={addEvent}
                disabled={adding || !newEvent.title || !newEvent.date || !newEvent.description}
                className="px-5 py-2 rounded-full font-bold text-sm transition-all disabled:opacity-40"
                style={{
                  background: "linear-gradient(180deg, #8FB1F0 0%, #6D90E3 100%)",
                  color: "white",
                  border: "2px solid #6D90E3",
                  boxShadow: "0 2px 8px rgba(109,144,227,0.4)",
                }}
              >
                {adding ? "Adding..." : "Add Event"}
              </button>
            </div>

            {/* Events list */}
            {loading ? (
              <p style={{ color: "#7A7CA8" }} className="text-center py-16">
                Loading events...
              </p>
            ) : events.length === 0 ? (
              <p style={{ color: "#7A7CA8" }} className="text-center py-16">
                No calendar events yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {events.map((event, i) => {
                  const style = TYPE_STYLES[event.type] ?? TYPE_STYLES.huddle;
                  const isEditing = editingId === event.id;

                  if (isEditing) {
                    return (
                      <div
                        key={event.id ?? `event-${i}`}
                        className="rounded-2xl p-5"
                        style={{ background: "rgba(255,255,255,0.95)", border: "2px solid #9AC6F6" }}
                      >
                        <p className="text-xs font-bold mb-3" style={{ color: "#6D90E3" }}>Editing event</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <input
                            placeholder="Title"
                            value={editForm.title}
                            onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                            className="px-3 py-2 rounded-xl text-sm font-semibold outline-none"
                            style={{ background: "#f2f3fc", border: "1.5px solid #c0c2e8", color: "#4a4c78", fontFamily: FONT }}
                          />
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                            className="px-3 py-2 rounded-xl text-sm font-semibold outline-none"
                            style={{ background: "#f2f3fc", border: "1.5px solid #c0c2e8", color: "#4a4c78", fontFamily: FONT }}
                          />
                          <input
                            type="time"
                            value={editForm.time}
                            onChange={(e) => setEditForm((p) => ({ ...p, time: e.target.value }))}
                            className="px-3 py-2 rounded-xl text-sm font-semibold outline-none"
                            style={{ background: "#f2f3fc", border: "1.5px solid #c0c2e8", color: editForm.time ? "#4a4c78" : "#9a9cca", fontFamily: FONT }}
                          />
                          <select
                            value={editForm.type}
                            onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value as EventType }))}
                            className="px-3 py-2 rounded-xl text-sm font-semibold outline-none"
                            style={{ background: "#f2f3fc", border: "1.5px solid #c0c2e8", color: "#4a4c78", fontFamily: FONT }}
                          >
                            <option value="huddle">Huddle</option>
                            <option value="challenge">Challenge</option>
                            <option value="social">Social</option>
                            <option value="deadline">Deadline</option>
                          </select>
                        </div>
                        <textarea
                          placeholder="Description"
                          value={editForm.description}
                          onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 rounded-xl text-sm font-semibold outline-none resize-y mb-3"
                          style={{ background: "#f2f3fc", border: "1.5px solid #c0c2e8", color: "#4a4c78", fontFamily: FONT }}
                        />
                        <input
                          placeholder="Join link — optional"
                          value={editForm.joinUrl}
                          onChange={(e) => setEditForm((p) => ({ ...p, joinUrl: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl text-sm font-semibold outline-none mb-3"
                          style={{ background: "#f2f3fc", border: "1.5px solid #c0c2e8", color: "#4a4c78", fontFamily: FONT }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(event.id)}
                            disabled={updatingId === event.id || !editForm.title || !editForm.date || !editForm.description}
                            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all disabled:opacity-40"
                            style={{ background: "linear-gradient(180deg, #8FB1F0 0%, #6D90E3 100%)", color: "white", border: "2px solid #6D90E3" }}
                          >
                            {updatingId === event.id ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                            style={{ background: "#e8eaf8", color: "#5A5C8A", border: "1.5px solid #c0c2e8" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={event.id ?? `event-${i}`}
                      className="rounded-2xl p-4 flex items-start gap-4"
                      style={{
                        background: style.bg,
                        border: `2px solid ${style.border}`,
                      }}
                    >
                      {/* Date chip */}
                      <div
                        className="rounded-xl px-3 py-1.5 text-center flex-shrink-0"
                        style={{
                          background: "white",
                          border: `1.5px solid ${style.border}`,
                          minWidth: "52px",
                        }}
                      >
                        <p
                          className="text-[10px] font-bold uppercase tracking-wide leading-none"
                          style={{ color: style.dot }}
                        >
                          {(() => { const d = parseDate(event.date); return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { month: "short" }); })()}
                        </p>
                        <p
                          className="text-xl font-bold leading-tight"
                          style={{ color: "#4a4c78" }}
                        >
                          {(() => { const d = parseDate(event.date); return isNaN(d.getTime()) ? "?" : String(d.getDate()); })()}
                        </p>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold" style={{ color: "#4a4c78" }}>
                            {event.title}
                          </h3>
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: "white",
                              color: style.dot,
                              border: `1.5px solid ${style.border}`,
                            }}
                          >
                            {style.label}
                          </span>
                        </div>
                        {event.time && (
                          <p className="text-xs mt-0.5" style={{ color: "#7472A0" }}>
                            {formatTime(event.time)}
                          </p>
                        )}
                        {event.joinUrl && (
                          <a
                            href={event.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold mt-1 inline-block transition-opacity hover:opacity-70"
                            style={{ color: "#6D90E3" }}
                          >
                            Join ↗
                          </a>
                        )}
                        <p className="text-sm mt-1" style={{ color: "#6c6ea0", whiteSpace: "pre-wrap" }}>
                          {event.description}
                        </p>
                      </div>

                      {/* Edit + Delete */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => startEdit(event)}
                          disabled={!!editingId || updatingId === event.id}
                          className="px-3 py-1.5 rounded-full text-xs font-bold transition-all disabled:opacity-40"
                          style={{
                            background: "#e8eaf8",
                            color: "#5A5C8A",
                            border: "1.5px solid #c0c2e8",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          disabled={updatingId === event.id}
                          className="px-3 py-1.5 rounded-full text-xs font-bold transition-all disabled:opacity-40"
                          style={{
                            background: "#fde8e8",
                            color: "#c03535",
                            border: "1.5px solid #f0a0a0",
                          }}
                        >
                          {updatingId === event.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
