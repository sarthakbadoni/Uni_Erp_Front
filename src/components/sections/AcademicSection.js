import React, { useState, useEffect } from "react";
import { Progress } from "../ui/progress";

const tabs = [
  { id: "subjects", label: "Subjects" },
  { id: "attendance", label: "Attendance" },
  { id: "timetable", label: "Timetable" },
];

const API_BASE = "http://ec2-65-2-8-148.ap-south-1.compute.amazonaws.com:3000";

export default function AcademicSection({ student }) {
  const [activeTab, setActiveTab] = useState("subjects");
  const [subjectAttendance, setSubjectAttendance] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [error, setError] = useState("");
  const [subjectsError, setSubjectsError] = useState("");

  // Fetch subjects for the student from the Subjects table
  useEffect(() => {
    setSubjectsList([]);
    if (!student || (!student.CourseID && !student.courseId)) {
      setSubjectsError("No course ID in student record");
      setSubjectsLoading(false);
      return;
    }
    setSubjectsLoading(true);
    setSubjectsError("");
    const courseId = student.CourseID || student.courseId;
    let query = `courseId=${encodeURIComponent(courseId)}`;
    if (student.Branch) query += `&branch=${encodeURIComponent(student.Branch)}`;
    if (student.Specialization) query += `&specialization=${encodeURIComponent(student.Specialization)}`;
    if (student.Semester) query += `&semester=${encodeURIComponent(student.Semester)}`;

    fetch(`${API_BASE}/api/subjects?${query}`)
      .then(res => {
        if (!res.ok) throw new Error("Subject fetch failed, status " + res.status);
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          setSubjectsError("No subjects found for this course.");
          setSubjectsList([]);
          return;
        }
        setSubjectsList(data);
      })
      .catch(err => {
        setSubjectsError(err.toString());
        setSubjectsList([]);
      })
      .finally(() => setSubjectsLoading(false));
  }, [student]);

  // Fetch attendance details
  useEffect(() => {
    setSubjectAttendance([]);
    if (!student) { setError("No student record"); setLoading(false); return; }
    async function fetchAttendance() {
      setLoading(true); setError("");
      try {
        const id = student.studentId || student.StudentID;
        if (!id) throw new Error("Student ID missing");
        const res = await fetch(`${API_BASE}/api/attendance?studentId=${id}`);
        if (!res.ok) throw new Error("Failed to fetch attendance");
        const records = (await res.json()) || [];
        const filtered = records.filter(
          (r) => r.SubjectCode && r.Status
        );
        const grouped = {};
        filtered.forEach((rec) => {
          const code = rec.SubjectCode;
          if (!grouped[code]) {
            grouped[code] = {
              name: rec.SubjectName || code,
              code,
              teacher: rec.Faculty || "",
              totalClasses: 0,
              attended: 0,
            };
          }
          grouped[code].teacher = rec.Faculty || "";
          grouped[code].totalClasses += 1;
          if ((rec.Status || "").toLowerCase() === "present") {
            grouped[code].attended += 1;
          }
        });
        setSubjectAttendance(Object.values(grouped));
      } catch (err) {
        setError(err.message);
        setSubjectAttendance([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, [student]);

  const totalHeld = subjectAttendance.reduce((a, s) => a + (s.totalClasses || 0), 0);
  const totalAttended = subjectAttendance.reduce((a, s) => a + (s.attended || 0), 0);
  const overallAttendance = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;

  return (
    <div className="w-full bg-slate-900 min-h-screen">
      {/* Desktop View */}
      <section className="hidden lg:block w-full max-w-3xl mx-auto px-4 pb-10">
        <h1 className="text-3xl font-extrabold text-white mb-1 mt-2 text-center">
          Academic Records
        </h1>
        <p className="text-blue-300 mb-6 text-center text-base">
          Welcome back, {student?.name || ""}
        </p>
        <div className="flex flex-col gap-4 mb-7 w-full">
          <div className="bg-slate-800 rounded-2xl shadow p-5 text-center w-full">
            <div className="text-md text-gray-300 font-medium mb-1">Attendance</div>
            <div className="text-3xl font-black text-white">{overallAttendance}%</div>
            <Progress value={overallAttendance} className="w-full mt-2 h-2" />
          </div>
        </div>
        <div className="w-full flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-5 py-2 rounded-lg font-semibold text-base transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-700 text-white shadow"
                  : "bg-slate-800 text-blue-300 hover:bg-blue-800 hover:text-white border border-blue-800"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="w-full">
          {activeTab === "subjects" &&
            (subjectsLoading ? (
              <div className="text-white">Loading subjects...</div>
            ) : subjectsError ? (
              <div className="text-red-400">{subjectsError}</div>
            ) : (
              <div className="bg-slate-800 rounded-2xl shadow-lg p-8 w-full">
                <div className="text-lg font-semibold text-white mb-4">
                  Subjects List
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-blue-200 text-left text-base">
                        <th className="pb-3">Subject Name</th>
                        <th className="pb-3">Subject Code</th>
                        <th className="pb-3">Branch</th>
                        <th className="pb-3">Specialization</th>
                        <th className="pb-3">Semester</th>
                        <th className="pb-3">Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectsList.map((subj) => (
                        <tr
                          key={subj.SubjectCode}
                          className="bg-slate-700/70 hover:bg-slate-700 text-gray-100"
                        >
                          <td className="py-3 px-4 font-medium">{subj.SubjectName}</td>
                          <td className="py-3 px-4">{subj.SubjectCode}</td>
                          <td className="py-3 px-4">{subj.Branch || "-"}</td>
                          <td className="py-3 px-4">{subj.Specialization || "-"}</td>
                          <td className="py-3 px-4">{subj.Semester || "-"}</td>
                          <td className="py-3 px-4">{subj.Credits || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          {activeTab === "attendance" && (
            <div className="bg-slate-800 rounded-2xl shadow-lg p-8 text-white w-full">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-3">
                <div className="text-lg font-semibold">Detailed Attendance</div>
                <div className="flex flex-col items-center sm:items-end">
                  <span className="text-base font-medium">Overall Attendance</span>
                  <span className="text-xl font-bold">{overallAttendance}%</span>
                  <Progress value={overallAttendance} className="w-44 mt-1 h-2" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-blue-200 text-left text-base">
                      <th className="pb-3">Subject</th>
                      <th className="pb-3">Code</th>
                      <th className="pb-3">Faculty</th>
                      <th className="pb-3">Classes Held</th>
                      <th className="pb-3">Attended</th>
                      <th className="pb-3">% Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectAttendance.map((subject) => {
                      const att =
                        subject.totalClasses > 0
                          ? Math.round((subject.attended / subject.totalClasses) * 100)
                          : 0;
                      return (
                        <tr
                          key={subject.code}
                          className="bg-slate-700/70 hover:bg-slate-700 text-gray-100"
                        >
                          <td className="py-3 px-4 font-medium">{subject.name}</td>
                          <td className="py-3 px-4">{subject.code}</td>
                          <td className="py-3 px-4">{subject.teacher}</td>
                          <td className="py-3 px-4">{subject.totalClasses}</td>
                          <td className="py-3 px-4">{subject.attended}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-xl font-semibold text-xs ${
                                att >= 75
                                  ? "bg-green-200 text-green-800"
                                  : att >= 60
                                  ? "bg-yellow-200 text-yellow-800"
                                  : "bg-red-200 text-red-800"
                              }`}
                            >
                              {att}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === "timetable" && (
            <div className="bg-slate-800 rounded-2xl shadow-lg p-8 text-white text-center w-full">
              <div className="text-lg font-semibold mb-4">Timetable</div>
              <div>Your timetable will be displayed here.</div>
            </div>
          )}
        </div>
      </section>
      {/* Mobile View */}
      <section className="block lg:hidden w-full px-4 pb-10">
        <h1 className="text-2xl font-extrabold text-white mb-1 mt-6 text-center">
          Academic Records
        </h1>
        <p className="text-blue-300 mb-6 text-center">Welcome back, {student?.name || ""}</p>
        <div className="flex flex-col gap-4 mb-6">
          <div className="bg-slate-800 rounded-2xl shadow p-5 text-center">
            <div className="font-medium text-gray-300 mb-1">Attendance</div>
            <div className="text-3xl font-black text-white">{overallAttendance}%</div>
            <Progress value={overallAttendance} className="w-full mt-2 h-2" />
          </div>
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-5 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-700 text-white shadow"
                  : "bg-slate-800 text-blue-300 hover:bg-blue-800 hover:text-white border border-blue-800"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="w-full">
          {activeTab === "subjects" &&
            (subjectsLoading ? (
              <div className="text-white">Loading subjects...</div>
            ) : subjectsError ? (
              <div className="text-red-400">{subjectsError}</div>
            ) : (
              <div className="bg-slate-800 rounded-2xl shadow-lg p-4">
                <div className="font-semibold text-white mb-4">Subjects List</div>
                <div className="flex flex-col gap-3">
                  {subjectsList.map((subj) => (
                    <div key={subj.SubjectCode} className="bg-slate-700/70 rounded-lg p-4">
                      <div className="font-semibold text-white mb-2">{subj.SubjectName}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-gray-400">Code</div>
                          <div className="text-blue-200">{subj.SubjectCode}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Branch</div>
                          <div className="text-blue-200">{subj.Branch || "-"}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Specialization</div>
                          <div className="text-blue-200">{subj.Specialization || "-"}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Semester</div>
                          <div className="text-blue-200">{subj.Semester || "-"}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Credits</div>
                          <div className="text-blue-200">{subj.Credits || "-"}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {activeTab === "attendance" && (
            <div className="bg-slate-800 rounded-2xl shadow-lg p-4 text-white">
              <div className="flex flex-col items-center mb-5">
                <div className="font-semibold mb-3">Detailed Attendance</div>
                <div className="flex flex-col items-center bg-slate-700 rounded-lg p-4 w-full">
                  <span className="font-medium mb-1">Overall Attendance</span>
                  <span className="text-2xl font-bold mb-2">{overallAttendance}%</span>
                  <Progress value={overallAttendance} className="w-full h-2" />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {subjectAttendance.map((subject) => {
                  const att =
                    subject.totalClasses > 0
                      ? Math.round((subject.attended / subject.totalClasses) * 100)
                      : 0;
                  return (
                    <div key={subject.code} className="bg-slate-700/70 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-semibold text-white flex-1">{subject.name}</div>
                        <span
                          className={`px-3 py-1 rounded-xl font-semibold text-xs ml-2 ${
                            att >= 75
                              ? "bg-green-200 text-green-800"
                              : att >= 60
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {att}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <div className="text-gray-400">Code</div>
                          <div className="text-blue-200">{subject.code}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Teacher</div>
                          <div className="text-blue-200">{subject.teacher}</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm bg-slate-800 rounded-lg p-3">
                        <div>
                          <div className="text-gray-400">Classes Held</div>
                          <div className="text-blue-200 font-semibold">{subject.totalClasses}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Attended</div>
                          <div className="text-blue-200 font-semibold">{subject.attended}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Missed</div>
                          <div className="text-red-300 font-semibold">
                            {subject.totalClasses - subject.attended}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {activeTab === "timetable" && (
            <div className="bg-slate-800 rounded-2xl shadow-lg p-4 text-white text-center">
              <div className="font-semibold mb-4">Timetable</div>
              <div>Your timetable will be displayed here.</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
