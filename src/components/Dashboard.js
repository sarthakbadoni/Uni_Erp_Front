import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import BottomNavigation from "./BottomNavigation";
import StudentCard from "./StudentCard";
import AcademicSection from "./sections/AcademicSection";
import CircularSection from "./sections/CircularSection";
import ExamSection from "./sections/ExamSection";
import FeeSection from "./sections/FeeSection";
import HostelSection from "./sections/HostelSection";
import PlacementSection from "./sections/PlacementSection";
import GrievanceSection from "./sections/GrievanceSection";
import FeedbackSection from "./sections/FeedbackSection";
import ResourceSection from "./sections/ResourceSection";
import PopupCircular from "./PopupCircular";

// Map backend studentData to UI student object
function mapStudentData(raw = {}) {
  return {
    photo: raw.PhotoURL || raw.photo || "/default-student.jpg",
    name: raw.Name,
    studentId: raw.StudentID,
    universityRollNo: raw.UniRollNo,
    classRollNo: raw.ClassRollNo,
    email: raw.OfficialEmail,
    enrollmentNumber: raw.EnrollmentNo,
    course: raw.CourseName || raw.CourseName,
    // --- These are critical ---
    CourseID: raw.CourseID,                    // <--- FOR SUBJECT API
    Branch: raw.Branch === "None" ? "" : raw.Branch, // <--- FOR SUBJECT API
    Semester: raw.CurrentSem,                  // <--- FOR SUBJECT API (should be raw.CurrentSem, not semester/lowercase)
    Specialization: raw.Specialization,        // <--- FOR SUBJECT API
    // --- End required ---
    highschoolPercentage: raw.HighSchool,
    branch: raw.Branch === "None" ? "" : raw.Branch,
    semester: raw.CurrentSem,
    section: raw.Section,
    intermediatePercentage: raw.Intermediate,
    fatherName: raw.FatherName,
    motherName: raw.MotherName
  };
}

export default function Dashboard({ studentData, onLogout }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const mappedStudent = mapStudentData(studentData);

  const handleMenuToggle = () => setIsSidebarOpen((prev) => !prev);
  const handleSidebarClose = () => setIsSidebarOpen(false);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <StudentCard student={mappedStudent} />;
      case "academic":
        return <AcademicSection student={mappedStudent}/>;
      case "fee":
        return <FeeSection student={mappedStudent} />;
      case "circular":
        return <CircularSection />;
      case "exam":
        return <ExamSection student={mappedStudent}/>;
      case "placement":
        return <PlacementSection />;
      case "hostel":
        return <HostelSection student={mappedStudent}/>;
      case "grievance":
        return <GrievanceSection />;
      case "feedback":
        return <FeedbackSection />;
      case "resources":
        return <ResourceSection />;
      default:
        return <div>Section not found.</div>;
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen flex flex-col">
      <PopupCircular userType="student" />
      <Header
        studentName={mappedStudent?.name}
        studentPhoto={mappedStudent?.photo}
        onLogout={onLogout}
        onMenuClick={handleMenuToggle}
      />
      <div className="flex flex-1 w-full relative">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={(id) => {
            setActiveSection(id);
            setIsSidebarOpen(false);
          }}
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
        />
        {/* Center content horizontally in all remaining space */}
        <main className="flex-1 flex justify-center items-start pt-8 pb-24 px-2 md:px-0">
          <div className="w-full max-w-3xl mx-auto">
            {renderContent()}
          </div>
        </main>
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={handleSidebarClose}
            aria-hidden="true"
          />
        )}
      </div>
      <BottomNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
    </div>
  );
}
