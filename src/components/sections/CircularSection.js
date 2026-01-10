import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Calendar, Download } from "lucide-react";

const API_BASE = "http://ec2-65-2-8-148.ap-south-1.compute.amazonaws.com:3000";

const priorityColor = {
  High: "bg-red-700 text-white",
  Medium: "bg-yellow-600 text-white",
  Low: "bg-gray-500 text-white",
};

const typeColor = {
  Academic: "bg-blue-100 text-blue-800",
  Placement: "bg-orange-200 text-orange-700",
  General: "bg-slate-200 text-slate-800",
  Events: "bg-purple-200 text-purple-700",
  Finance: "bg-green-100 text-green-700",
};

export default function CircularSection() {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircular, setSelectedCircular] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/circulars/CS101`)
      .then((res) => res.json())
      .then((data) => {
        setCirculars(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching circulars", err);
        setLoading(false);
      });
  }, []);

  // 🔑 SMART FILE HANDLING (ONLY ADDITION)
  const getLinkProps = (attachment) => {
    if (!attachment) return {};
    if (attachment.FileType === "application/pdf") {
      return { target: "_blank", rel: "noopener noreferrer" };
    }
    return { download: true };
  };

  // ---- METRICS ----
  const totalCirculars = circulars.length;
  const highPriority = circulars.filter(c => c.Priority === "High").length;

  const thisWeek = circulars.filter(c => {
    const publishDate = new Date(c.PublishDate);
    const now = new Date();
    return (now - publishDate) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  const metrics = [
    { label: "Total Circulars", value: totalCirculars },
    { label: "High Priority", value: highPriority },
    { label: "This Week", value: thisWeek },
    { label: "Unread", value: 0, color: "text-orange-400" },
  ];

  if (loading) {
    return <div className="text-white text-center mt-10">Loading circulars...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8">
      <h1 className="text-3xl font-bold text-white mb-2">
        Circulars & Notices
      </h1>
      <div className="text-blue-200 mb-6">
        Welcome back, Arjun Sharma
      </div>

      {/* METRICS (UNCHANGED) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
        {metrics.map((m) => (
          <div key={m.label} className="bg-slate-800 shadow rounded-2xl p-5 text-center">
            <div className="text-lg font-medium text-gray-300">{m.label}</div>
            <div className={`text-4xl font-bold mt-2 ${m.color || "text-purple-400"}`}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* CIRCULAR LIST (UNCHANGED UI) */}
      <div className="bg-slate-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-lg font-semibold text-white mb-5">
          Recent Circulars
        </h2>

        {circulars.map((c) => {
          const attachment = c.Attachments?.[0];

          return (
            <div key={c.CircularID} className="mb-6">
              <div className="bg-slate-900 rounded-xl p-6 flex flex-col gap-2 hover:shadow-lg transition-shadow">
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-lg font-bold text-white">{c.Title}</span>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded font-semibold ${priorityColor[c.Priority]}`}>
                      {c.Priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColor[c.Category]}`}>
                      {c.Category}
                    </span>
                  </div>
                </div>

                <div className="text-gray-300">{c.Description}</div>

                <div className="flex justify-between items-center flex-wrap mt-2 gap-3">
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {c.PublishDate}
                    </span>
                    {c.AttachmentCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Download size={16} />
                        {c.AttachmentCount} attachment
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-slate-800 text-gray-200 hover:bg-slate-700"
                      onClick={() => setSelectedCircular(c)}
                    >
                      View Details
                    </Button>

                    {attachment && (
                      <a
                        href={attachment.PublicUrl}
                        {...getLinkProps(attachment)}
                        className="inline-flex"
                      >
                        <Button
                          size="sm"
                          className="flex gap-1 items-center bg-slate-900 text-white border border-slate-700 hover:bg-slate-700"
                        >
                          <Download size={16} />
                          {attachment.FileType === "application/pdf" ? "Open" : "Download"}
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* VIEW DETAILS MODAL (UNCHANGED UI) */}
      {selectedCircular && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 max-w-lg w-full relative">
            <button
              onClick={() => setSelectedCircular(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-white mb-2">
              {selectedCircular.Title}
            </h2>

            <p className="text-gray-300 mb-4">
              {selectedCircular.Description}
            </p>

            {selectedCircular.Attachments?.[0] && (
              <a
                href={selectedCircular.Attachments[0].PublicUrl}
                {...getLinkProps(selectedCircular.Attachments[0])}
                className="inline-flex"
              >
                <Button className="flex gap-1 items-center">
                  <Download size={16} />
                  {selectedCircular.Attachments[0].FileType === "application/pdf"
                    ? "Open Attachment"
                    : "Download Attachment"}
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
