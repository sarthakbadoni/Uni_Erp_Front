import React, { useState } from "react";
import LoginPage from "./components/LoginPage";
import StudentDashboard from "./components/Dashboard";
import FacultyDashboard from "./components/faculty/FacultyDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import { Button } from "./components/ui/button";
import "./styles/appglobals.css";

const API_BASE = "http://ec2-65-2-8-148.ap-south-1.compute.amazonaws.com:3000";

export default function App() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const handleLogin = async (userData) => {
    let dashboardResult = null;
    if (userData.type === "student") {
      dashboardResult = userData.studentData ? userData.studentData : null;
    } else if (userData.type === "faculty") {
      try {
        const res = await fetch(`${API_BASE}/faculty/${userData.id}`);
        dashboardResult = res.ok ? await res.json() : null;
      } catch {
        dashboardResult = null;
      }
    } else if (userData.type === "admin") {
      dashboardResult = {};
    }
    setUser(userData);
    setDashboardData(dashboardResult);
  };

  const handleLogout = () => {
    setUser(null);
    setDashboardData(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.type === "student" && dashboardData && dashboardData.StudentID) {
    return (
      <StudentDashboard
        studentId={dashboardData.StudentID}
        branch={dashboardData.Branch}
        studentData={dashboardData}
        onLogout={handleLogout}
      />
    );
  }

  if (user.type === "faculty" && dashboardData) {
    return (
      <FacultyDashboard
        facultyData={dashboardData}
        onLogout={handleLogout}
      />
    );
  }

  if (user.type === "admin" && dashboardData) {
    return (
      <AdminDashboard dashboardData={dashboardData} onLogout={handleLogout} />
    );
  }
  // fallback
  return (
    <div className="text-center text-lg text-red-600 my-14">
      Error: No user details found, please retry login.
      <Button onClick={handleLogout} className="ml-2">Return to Login</Button>
    </div>
  );
}
