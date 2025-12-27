import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select";
import { Search, Mail, Phone, Filter } from "lucide-react";

const API_BASE = "http://ec2-65-2-8-148.ap-south-1.compute.amazonaws.com:3000";

export default function FacultyStudentListSection() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [courseDetails, setCourseDetails] = React.useState([]);
  const [selectedCourseID, setSelectedCourseID] = React.useState("all");
  const [selectedBranch, setSelectedBranch] = React.useState("all");
  const [selectedSemester, setSelectedSemester] = React.useState("all");
  const [typedSection, setTypedSection] = React.useState("");
  const [students, setStudents] = React.useState([]);
  const [attendanceMap, setAttendanceMap] = React.useState({});

  // Fetch courses (CourseDetails)
  React.useEffect(() => {
    fetch(`${API_BASE}/api/coursedetails`)
      .then((res) => res.json())
      .then((data) => setCourseDetails(Array.isArray(data) ? data : []))
      .catch(() => setCourseDetails([]));
  }, []);

  // Get current course object (for branches/semesters)
  const selectedCourseObj =
    selectedCourseID === "all"
      ? null
      : courseDetails.find((c) => c.CourseID === selectedCourseID);
  const branches = selectedCourseObj ? selectedCourseObj.Branch : [];
  const semesters = selectedCourseObj
    ? Array.from(
        { length: (selectedCourseObj.Duration || 0) * 2 },
        (_, i) => String(i + 1)
      )
    : [];

  // Fetch students for given filters
  React.useEffect(() => {
    // If All Courses, fetch all students (no filters)
    if (selectedCourseID === "all") {
      fetch(`${API_BASE}/api/students`)
        .then((res) => res.json())
        .then((data) => setStudents(Array.isArray(data) ? data : []))
        .catch(() => setStudents([]));
      return;
    }
    // Otherwise, fetch with filters
    const params = [
      `courseId=${encodeURIComponent(selectedCourseID)}`,
      ...(selectedBranch !== "all" ? [`branch=${encodeURIComponent(selectedBranch)}`] : []),
      ...(selectedSemester !== "all" ? [`semester=${encodeURIComponent(selectedSemester)}`] : []),
      ...(typedSection.trim() ? [`section=${typedSection.trim()}`] : [])
    ].join("&");
    fetch(`${API_BASE}/api/students?${params}`)
      .then((res) => res.json())
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]));
  }, [selectedCourseID, selectedBranch, selectedSemester, typedSection]);

  // Fetch overall attendance for visible students
  React.useEffect(() => {
    if (!students || !students.length) {
      setAttendanceMap({});
      return;
    }
    const fetchAttendance = async () => {
      let atMap = {};
      await Promise.all(
        students.map(async (student) => {
          try {
            const resp = await fetch(`${API_BASE}/api/attendance-overall/${student.StudentID}`);
            if (resp.ok) {
              const data = await resp.json();
              atMap[student.StudentID] = data.overall || "--";
            } else atMap[student.StudentID] = "--";
          } catch {
            atMap[student.StudentID] = "--";
          }
        })
      );
      setAttendanceMap(atMap);
    };
    fetchAttendance();
  }, [students]);

  // Local search: by name or roll (client side)
  const filteredStudents =
    Array.isArray(students)
      ? students.filter((student) => {
          const matchesSearch =
            (student.Name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (student.UniRollNo?.toLowerCase() || "").includes(searchTerm.toLowerCase());
          return matchesSearch;
        })
      : [];

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl text-slate-100">Student List</h2>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Filter className="h-4 w-4" />
              <span>
                {filteredStudents.length} student
                {filteredStudents.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-slate-100"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Course Dropdown */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Course</label>
              <Select
                value={selectedCourseID}
                onValueChange={(v) => {
                  setSelectedCourseID(v);
                  setSelectedBranch("all");
                  setSelectedSemester("all");
                  setTypedSection("");
                }}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courseDetails.map((c) => (
                    <SelectItem key={c.CourseID} value={c.CourseID}>
                      {c.CourseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Branch Dropdown */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Branch</label>
              <Select
                value={selectedBranch}
                onValueChange={setSelectedBranch}
                disabled={!selectedCourseObj}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches &&
                    branches.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {/* Semester Dropdown */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Semester</label>
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
                disabled={!selectedCourseObj}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Free-text section (case-insensitive) */}
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Section</label>
              <Input
                className="bg-slate-700 border-slate-600 text-slate-100"
                type="text"
                value={typedSection}
                onChange={(e) => setTypedSection(e.target.value)}
                placeholder="Type section"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <Card key={student.StudentID} className="bg-slate-700 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-slate-100 mb-1 break-words">{student.Name}</h3>
                      <p className="text-sm text-slate-400">Roll No: {student.UniRollNo}</p>
                    </div>
                    <Badge
                      className={`shrink-0 ${
                        parseInt(attendanceMap[student.StudentID] || "0") >= 90
                          ? "bg-green-600"
                          : parseInt(attendanceMap[student.StudentID] || "0") >= 75
                          ? "bg-yellow-600"
                          : "bg-red-600"
                      }`}
                    >
                      {attendanceMap[student.StudentID] || "--"}% Attendance
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-300 min-w-0">
                      <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="break-all">{student.OfficialEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      {student.StudentPhoneNo}
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-4 text-sm text-slate-400 mt-2">
                      <span>Course: {student.CourseName}</span>
                      <span>Branch: {student.Branch}</span>
                      <span>Sem: {student.CurrentSem}</span>
                      <span>Sec: {student.Section}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No students found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
