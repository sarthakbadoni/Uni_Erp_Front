import React, { useEffect, useState } from "react";
import { Calendar, Clock, Download } from "lucide-react";
import { Button } from "../ui/button";

const API_BASE = "http://ec2-65-2-8-148.ap-south-1.compute.amazonaws.com:3000";

export default function ExamSection({ student }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [admitCards, setAdmitCards] = useState([]);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);

  const { CourseID, Semester, studentId, name } = student;

  /* ---------------- UPCOMING EXAMS ---------------- */
  useEffect(() => {
    if (!CourseID || !Semester) return;

    fetch(
      `${API_BASE}/api/exams/upcoming?courseId=${CourseID}&semester=${Semester}`
    )
      .then(res => res.json())
      .then(setUpcomingExams)
      .catch(console.error);
  }, [CourseID, Semester]);

  /* ---------------- ADMIT CARDS ---------------- */
  useEffect(() => {
    if (!studentId) return;

    fetch(`${API_BASE}/api/exams/admit-card/${studentId}`)
      .then(res => res.json())
      .then(setAdmitCards)
      .catch(console.error);
  }, [studentId]);

  /* ---------------- RESULTS ---------------- */
  useEffect(() => {
    if (!studentId || !Semester) return;

    fetch(`${API_BASE}/api/exams/results/${studentId}?semester=${Semester}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.subjects || []);
        setSummary(data.summary || null);
      })
      .catch(console.error);
  }, [studentId, Semester]);

  const nextExam = upcomingExams[0];

  return (
    <div className="w-full">

      {/* HEADER */}
      <h1 className="text-3xl font-bold text-white text-center mb-2">
        Examinations
      </h1>
      <div className="text-blue-200 text-center mb-8">
        Welcome back, {name}
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-slate-800 rounded-2xl p-6 text-center">
          <div className="text-gray-300">Upcoming Exams</div>
          <div className="text-4xl font-bold text-blue-400 mt-2">
            {upcomingExams.length}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 text-center">
          <div className="text-gray-300">Next Exam</div>
          {nextExam ? (
            <>
              <div className="text-xl font-bold text-white mt-2">
                {nextExam.SubjectName}
              </div>
              <div className="text-blue-400">
                {nextExam.Date}
              </div>
            </>
          ) : (
            <div className="text-gray-400 mt-2">No upcoming exams</div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div className="flex justify-center gap-3 mb-8">
        {["upcoming", "admit", "results"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-medium ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-gray-300"
            }`}
          >
            {tab === "upcoming" && "Upcoming Exams"}
            {tab === "admit" && "Admit Cards"}
            {tab === "results" && "Results"}
          </button>
        ))}
      </div>

      {/* ---------------- UPCOMING EXAMS TAB ---------------- */}
      {activeTab === "upcoming" && (
        <div className="space-y-4">
          {upcomingExams.map(exam => (
            <div
              key={exam.ExamDateTime}
              className="bg-slate-900 rounded-xl p-6 border border-slate-700"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {exam.SubjectName}
                  </h3>
                  <div className="text-sm text-blue-300">
                    {exam.SubjectCode}
                  </div>

                  <div className="flex gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {exam.Date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {exam.StartTime} - {exam.EndTime}
                    </span>
                  </div>

                  <div className="text-sm text-gray-400 mt-1">
                    Room: {exam.Room}
                  </div>
                </div>

                <span className="px-3 py-1 h-fit rounded-full text-xs bg-slate-700 text-white">
                  {exam.ExamType}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- ADMIT CARDS TAB ---------------- */}
      {activeTab === "admit" && (
        <div className="space-y-4">
          {admitCards.map(card => (
            <div
              key={card.Semester}
              className="bg-slate-900 rounded-xl p-6 flex justify-between items-center border border-slate-700"
            >
              <div>
                <div className="text-white font-semibold">
                  {card.ExamType} Exam
                </div>
                <div className="text-gray-400 text-sm">
                  Semester {card.Semester}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    card.Downloaded
                      ? "bg-yellow-600 text-white"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {card.Downloaded ? "Downloaded" : "Available"}
                </span>

                <a
                  href={card.PublicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm">
                    <Download size={16} />
                    Download
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- RESULTS TAB ---------------- */}
      {activeTab === "results" && (
        <>
          <div className="bg-slate-900 rounded-xl p-6 mb-6">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400">
                <tr>
                  <th>Subject</th>
                  <th>Code</th>
                  <th>Marks</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
  {results.map((r) => (
    <tr
      key={r.SubjectCode}
      className="border-t border-slate-700"
    >
      {/* Subject */}
      <td className="py-3 text-white font-medium">
        {r.SubjectName}
      </td>

      {/* Code */}
      <td className="text-white">
        {r.SubjectCode}
      </td>

      {/* Marks */}
      <td className="text-white">
        {r.Marks}
      </td>

      {/* Grade */}
      <td className="text-white font-semibold">
        {r.Grade}
      </td>

      {/* Status */}
      <td>
        <span className="px-3 py-1 rounded-full bg-green-600 text-white text-xs">
          {r.Status}
        </span>
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>

          {summary && (
            <div className="text-center text-sm">
              <span className="text-blue-400">
                Semester SGPA: {summary.SGPA}
              </span>{" "}
              <span className="text-green-400 ml-3">
                Passed: {summary.PassedCount}
              </span>{" "}
              <span className="text-red-400 ml-3">
                Failed: {summary.FailedCount}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
