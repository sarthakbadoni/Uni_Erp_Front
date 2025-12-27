import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import "../../styles/globals.css";

const API_BASE = "http://ec2-65-2-8-148.ap-south-1.compute.amazonaws.com:3000";

const facilities = [
  { icon: "📶", name: "Wi-Fi", status: "Available" },
  { icon: "🍽️", name: "Mess", status: "Available" },
  { icon: "🚗", name: "Parking", status: "Available" },
  { icon: "🛡️", name: "24/7 Security", status: "Available" }
];

function StatusPill({ status }) {
  if (status === "Paid") return <span className="bg-slate-100 px-4 py-1 rounded-full text-gray-900 text-xs font-semibold whitespace-nowrap">Paid</span>;
  if (status === "Pending") return <span className="bg-red-700 px-4 py-1 rounded-full text-white text-xs font-semibold whitespace-nowrap">Pending</span>;
  if (status === "In Progress") return <span className="bg-slate-700 px-3 py-1 rounded-full text-gray-100 text-xs font-semibold whitespace-nowrap">In Progress</span>;
  if (status === "Resolved") return <span className="bg-white px-3 py-1 rounded-full text-gray-900 text-xs font-semibold whitespace-nowrap">Resolved</span>;
  return <span className="bg-slate-700 px-3 py-1 rounded-full text-white text-xs font-semibold whitespace-nowrap">{status}</span>;
}

function PriorityBadge({ priority }) {
  if (priority === "High") return <span className="bg-red-900 text-red-100 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">High</span>;
  if (priority === "Medium") return <span className="bg-slate-600 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">Medium</span>;
  return <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">Low</span>;
}

const FacilityCard = ({ icon, name, status }) => (
  <div className="bg-slate-800 flex flex-col items-start justify-center px-5 py-6 rounded-xl w-full min-h-[100px]">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-blue-300 text-2xl">{icon}</span>
      <span className="font-semibold text-white text-xl break-words">{name}</span>
    </div>
    <span className="bg-white text-gray-800 text-xs font-semibold rounded-full px-5 py-2 mt-2">{status}</span>
  </div>
);

const MobileFacilityCard = ({ icon, name, status }) => (
  <div className="bg-slate-800 flex items-center justify-between px-4 py-4 rounded-xl w-full">
    <div className="flex items-center gap-3">
      <span className="text-blue-300 text-xl">{icon}</span>
      <span className="font-semibold text-white">{name}</span>
    </div>
    <span className="bg-white text-gray-800 text-xs font-semibold rounded-full px-4 py-1">{status}</span>
  </div>
);

export default function HostelSection({ student }) {
  const [hostelInfo, setHostelInfo] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [feeDetails, setFeeDetails] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", type: "Maintenance", priority: "Medium" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!student?.studentId && !student?.StudentID) return;
      setLoading(true);
      const id = student.StudentID || student.studentId;

      // Hostel info (assignment + meta merged)
      const resHostel = await fetch(`${API_BASE}/api/hostel-assigned/${id}`);
      const hostelData = resHostel.ok ? await resHostel.json() : null;
      setHostelInfo(hostelData);

      // Complaints
      const resComplaints = await fetch(`${API_BASE}/api/hostel-complaint/${id}`);
      const comps = resComplaints.ok ? await resComplaints.json() : [];
      setComplaints(comps.map(c => ({
        id: c.ComplaintID,
        title: c.Title,
        type: c.Category,
        date: c.Date,
        priority: c.Priority,
        status: c.Status
      })));

      // Fees
      const resFees = await fetch(`${API_BASE}/api/hostel-fee/${id}`);
      const fd = resFees.ok ? await resFees.json() : { Fees: [] };
      setFeeDetails((fd.Fees || []).map(f => ({
        item: f.Item,
        amount: f.Amount,
        dueDate: f.DueDate,
        status: f.Status
      })));

      setLoading(false);
    }
    fetchData();
  }, [student]);

  async function handleComplaintSubmit(e) {
    e.preventDefault();
    if (!student?.studentId && !student?.StudentID) return;
    const id = student.StudentID || student.studentId;
    const newComplaint = {
      StudentID: id,
      ComplaintID: "H" + Date.now(),
      Title: form.title,
      Category: form.type,
      Date: new Date().toISOString().slice(0, 10),
      Priority: form.priority,
      Status: "Pending"
    };
    await fetch(`${API_BASE}/api/hostel-complaint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComplaint)
    });
    const resComplaints = await fetch(`${API_BASE}/api/hostel-complaint/${id}`);
    const comps = resComplaints.ok ? await resComplaints.json() : [];
    setComplaints(comps.map(c => ({
      id: c.ComplaintID,
      title: c.Title,
      type: c.Category,
      date: c.Date,
      priority: c.Priority,
      status: c.Status
    })));
    setShowForm(false);
    setForm({ title: "", type: "Maintenance", priority: "Medium" });
  }

  async function handlePay(idx) {
    const studentId = student.StudentID || student.studentId;
    const feeItem = feeDetails[idx].item;
    await fetch(`${API_BASE}/api/hostel-fee/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, item: feeItem })
    });
    setFeeDetails(feeDetails.map((f, i) =>
      i === idx ? { ...f, status: "Paid" } : f
    ));
  }

  if (loading) {
    return <div className="text-white text-center py-10 text-lg">Loading hostel information...</div>;
  }

  return (
    <div className="w-full bg-slate-900 min-h-screen py-6">
      {/* Desktop */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:block hidden">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Hostel Management</h1>
        <div className="text-blue-200 mb-6 text-center">Welcome back, {student?.name || ""}</div>
        <div className="flex flex-col lg:flex-row gap-8 mb-8 w-full">
          <div className="flex-1 min-w-[320px] w-full">
            <div className="text-lg font-bold mb-5 text-white flex items-center gap-2">🏡 Room Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-4 mb-2">
              {hostelInfo && Object.entries({
                "Hostel Name": hostelInfo.HostelName,
                "Room Number": hostelInfo.RoomNumber || hostelInfo.RoomNo,
                "Room Type": hostelInfo.RoomType,
                "Floor": hostelInfo.Floor,
                "Monthly Fee": hostelInfo.MonthlyFee && `₹${hostelInfo.MonthlyFee}`,
                "Check-in Date": hostelInfo.CheckInDate,
              }).map(([label, val]) => val && (
                <div key={label}>
                  <div className="font-medium text-white mb-1">{label}</div>
                  <div className="bg-slate-800 rounded px-4 py-2 text-white">{val}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 font-medium text-white">
              Warden: <span className="text-blue-200">{hostelInfo.WardenName} ({hostelInfo.WardenPhone})</span>
            </div>
            <div className="mt-2 font-medium text-white">Roommates:</div>
            {roommates.length === 0
              ? <span className="text-gray-300 text-sm">No roommate assigned</span>
              : <ul className="list-disc ml-6 text-gray-200 text-sm">
                  {roommates.map(r => (
                    <li key={r.studentId}>{r.name}, {r.course}, {r.contact} [{r.studentId}]</li>
                  ))}
                </ul>}
          </div>
          <div className="flex flex-col items-start min-w-[300px] w-full">
            <div className="text-lg font-bold mb-5 text-white">Facilities Available</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {facilities.map(f => (
                <FacilityCard key={f.name} {...f} />
              ))}
            </div>
          </div>
        </div>
        {/* Complaints */}
        <div className="mb-8 p-6 rounded-2xl bg-[#181d2a] w-full">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
            <div className="text-lg font-bold text-white">My Complaints</div>
            <Button className="bg-white px-6 py-2 rounded-md text-gray-900 font-semibold border border-slate-200 hover:bg-slate-200"
              onClick={() => setShowForm(true)}>
              Register New Complaint
            </Button>
          </div>
          {showForm &&
            <form onSubmit={handleComplaintSubmit} className="mb-4 bg-slate-800 rounded-xl px-4 py-4 flex flex-col gap-3">
              <input
                className="bg-slate-700 px-3 py-2 rounded text-white outline-none"
                type="text" required maxLength={70}
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Complaint Title"
              />
              <div className="flex flex-col md:flex-row gap-3">
                <select className="bg-slate-700 px-3 py-2 rounded text-white" value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option>Maintenance</option>
                  <option>Cleanliness</option>
                  <option>Food</option>
                  <option>Other</option>
                </select>
                <select className="bg-slate-700 px-3 py-2 rounded text-white" value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <div className="flex gap-2">
                  <Button className="bg-blue-500 text-white px-6 py-2 rounded font-semibold" type="submit">Submit</Button>
                  <Button className="bg-slate-700 text-white px-6 py-2 rounded font-semibold" onClick={() => setShowForm(false)} type="button">Cancel</Button>
                </div>
              </div>
            </form>
          }
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-white text-base border-b border-slate-700">
                  <th className="px-4 py-3 font-semibold">Complaint ID</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c, idx) => (
                  <tr key={c.id} className={`text-gray-100 text-base ${idx % 2 === 0 ? "bg-slate-800/60" : "bg-[#232842]/70"} hover:bg-slate-800 transition`}>
                    <td className="px-4 py-3 font-medium">{c.id}</td>
                    <td className="px-4 py-3 break-words whitespace-normal">{c.title}</td>
                    <td className="px-4 py-3">{c.type}</td>
                    <td className="px-4 py-3">{c.date}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                    <td className="px-4 py-3"><StatusPill status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Fee Details */}
        <div className="mb-8 p-6 rounded-2xl bg-[#181d2a] w-full">
          <div className="text-lg font-bold text-white mb-4">Fee Details</div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-white text-base border-b border-slate-700">
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Due Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {feeDetails.map((fee, idx) => (
                  <tr key={idx} className={`text-gray-100 text-base ${idx % 2 === 0 ? "bg-slate-800/60" : "bg-[#232842]/70"} hover:bg-slate-800 transition`}>
                    <td className="px-4 py-3 font-medium">{fee.item}</td>
                    <td className="px-4 py-3 text-white">₹{fee.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-white">{fee.dueDate}</td>
                    <td className="px-4 py-3">
                      {(fee.status === "Pending" || fee.status === "Pay Now")
                        ? (
                          <Button
                            className="bg-red-600 text-white px-4 py-2 rounded font-semibold"
                            onClick={() => handlePay(idx)}
                          >
                            Pay Now
                          </Button>
                        )
                        : <StatusPill status={fee.status} />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
