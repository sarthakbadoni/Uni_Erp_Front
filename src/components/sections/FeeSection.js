import React, { useEffect, useState } from "react";
import { Download, CreditCard } from "lucide-react";
import { Button } from "../ui/button";

const API_BASE = "http://ec2-65-2-8-148.ap-south-1.compute.amazonaws.com:3000";

function StatusBadge({ status }) {
  return status === "Paid" ? (
    <span className="bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 rounded-xl text-white text-xs font-semibold shadow-md">Paid</span>
  ) : (
    <span className="bg-gradient-to-r from-red-500 to-pink-600 px-3 py-1 rounded-xl text-white text-xs font-semibold shadow-md">Pending</span>
  );
}

function ActionButton({ status, semester, remaining }) {
  if (status === "Paid") {
    return (
      <Button className="flex gap-1 items-center bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg text-white text-xs font-medium transition-all shadow-md">
        <Download size={14} />
        Receipt
      </Button>
    );
  }
  // For Pending, call pay handler (show alert or integrate payment)
  return (
    <Button
      className="flex gap-1 items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-3 py-2 rounded-lg text-white text-xs font-semibold transition-all shadow-lg shadow-blue-500/50"
      onClick={() => alert(`Pay for Sem ${semester}\nPending: ₹${remaining.toLocaleString()}`)}
    >
      <CreditCard size={14} />
      Pay Now
    </Button>
  );
}

export default function FeeSection({ student }) {
  const [feeRows, setFeeRows] = useState([]);
  const [metrics, setMetrics] = useState({ paid: 0, pending: 0, total: 0 });

  useEffect(() => {
    if (!student) return;

    const courseId =
      student.CourseID ||
      student.courseId ||
      student.courseID ||
      student.course;

    if (!courseId) {
      console.error("No CourseID available in student prop, cannot load fee structure!");
      return;
    }

    async function fetchDynamicFees() {
      try {
        const feestructureRes = await fetch(
          `${API_BASE}/api/feestructure?courseId=${courseId}`
        );
        const feestructure = await feestructureRes.json();

        const feepaidRes = await fetch(
          `${API_BASE}/api/feepaid?studentId=${student.studentId || student.StudentID}`
        );
        const feepaid = await feepaidRes.json();

        const feeData = feestructure.map(row => {
          const paidRow = feepaid.find(pay => String(pay.Sem) === String(row.Sem));
          const paidAmount = paidRow?.PaidAmount ? Number(paidRow.PaidAmount) : 0;
          const status = paidRow?.Status || "Pending";
          const remaining = Math.max((Number(row.TotalFee) || 0) - paidAmount, 0);

          return {
            semester: row.Sem,
            tuition: Number(row.TutionFee) || 0,
            other: Number(row.OtherFee) || 0,
            exam: Number(row.ExamFee) || 0,
            total: Number(row.TotalFee) || 0,
            due: row.DueDate || "-",
            paidAmount,
            remaining,
            status,
            paymentDate: paidRow?.PaymentDate,
            mode: paidRow?.Mode || "-",
          };
        });

        let paid = 0, pending = 0, total = 0;
        feeData.forEach(item => {
        total += item.total || 0;
        paid += item.paidAmount || 0;
        // Pending = sum of all remaining amounts that aren't fully paid
        if ((item.total || 0) > (item.paidAmount || 0)) {
          pending += item.remaining;
      }
      });


        setFeeRows(feeData);
        setMetrics({ paid, pending, total });
      } catch (err) {
        console.error("Error fetching fee data:", err);
      }
    }

    fetchDynamicFees();
  }, [student]);

  const studentName = student?.name || "Student";

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: "rgb(15 23 42 / var(--tw-bg-opacity, 1))" }}>
      {/* Desktop View */}
      <section className="hidden lg:block w-full max-w-5xl mx-auto px-4 pb-10">
        <h1 className="text-4xl font-extrabold text-white mb-2 mt-8 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Fee Management
        </h1>
        <p className="text-blue-300 mb-8 text-center">Welcome back, {studentName}</p>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-700/30 rounded-2xl shadow-xl p-6 text-center">
            <div className="text-sm font-medium text-emerald-200 mb-2">Total Paid</div>
            <div className="text-4xl font-black text-emerald-300">₹{metrics.paid.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/30 rounded-2xl shadow-xl p-6 text-center">
            <div className="text-sm font-medium text-red-200 mb-2">Pending Amount</div>
            <div className="text-4xl font-black text-red-300">₹{metrics.pending.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/30 rounded-2xl shadow-xl p-6 text-center">
            <div className="text-sm font-medium text-blue-200 mb-2">Total Course Fee</div>
            <div className="text-4xl font-black text-blue-300">₹{metrics.total.toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <div className="text-xl font-semibold text-white">Fee Structure & Payment History</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-blue-300 text-left">
                  <th className="pb-4 px-4">Sem</th>
                  <th className="pb-4 px-4">Tuition</th>
                  <th className="pb-4 px-4">Other</th>
                  <th className="pb-4 px-4">Exam</th>
                  <th className="pb-4 px-4">Total</th>
                  <th className="pb-4 px-4">Paid</th>
                  <th className="pb-4 px-4">Due Date</th>
                  <th className="pb-4 px-4">Status</th>
                  <th className="pb-4 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {feeRows.map((fee, idx) => (
                  <tr key={idx} className="bg-slate-700/40 hover:bg-slate-600/60 text-gray-100">
                    <td className="py-4 px-4 font-medium rounded-l-xl">
                      <span className="bg-purple-900/40 text-purple-200 px-3 py-1 rounded-lg">
                        {fee.semester}
                      </span>
                    </td>
                    <td className="py-4 px-4">₹{fee.tuition.toLocaleString()}</td>
                    <td className="py-4 px-4">₹{fee.other.toLocaleString()}</td>
                    <td className="py-4 px-4">₹{fee.exam.toLocaleString()}</td>
                    <td className="py-4 px-4 font-semibold">₹{fee.total.toLocaleString()}</td>
                    <td className="py-4 px-4 font-semibold">₹{fee.paidAmount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-gray-300">{fee.due}</td>
                    <td className="py-4 px-4"><StatusBadge status={fee.status} /></td>
                    <td className="py-4 px-4 rounded-r-xl"><ActionButton status={fee.status} semester={fee.semester} remaining={fee.remaining} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* Mobile View */}
      <section className="block lg:hidden w-full px-4 pb-10">
        <h1 className="text-3xl font-extrabold text-white mb-2 mt-6 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Fee Management
        </h1>
        <p className="text-blue-300 mb-6 text-center">Welcome back, {studentName}</p>
        <div className="flex flex-col gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-700/30 rounded-2xl shadow-xl p-5 text-center">
            <div className="font-medium text-emerald-200 mb-1">Total Paid</div>
            <div className="text-3xl font-black text-emerald-300">₹{metrics.paid.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-red-900/40 to-red-800/20 border border-red-700/30 rounded-2xl shadow-xl p-5 text-center">
            <div className="font-medium text-red-200 mb-1">Pending Amount</div>
            <div className="text-3xl font-black text-red-300">₹{metrics.pending.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/30 rounded-2xl shadow-xl p-5 text-center">
            <div className="font-medium text-blue-200 mb-1">Total Course Fee</div>
            <div className="text-3xl font-black text-blue-300">₹{metrics.total.toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-2xl shadow-2xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <div className="font-semibold text-white">Payment History</div>
          </div>
          <div className="flex flex-col gap-3">
            {feeRows.map((fee, idx) => (
              <div key={idx} className="bg-slate-700/40 hover:bg-slate-600/60 rounded-lg p-4 border border-slate-600/30 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-purple-900/40 text-purple-200 px-3 py-1 rounded-lg font-semibold">
                      {fee.semester}
                    </span>
                    <StatusBadge status={fee.status} />
                  </div>
                  <div className="text-xs text-slate-400">{fee.due}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <div className="text-gray-400 text-xs">Tuition</div>
                    <div className="text-blue-200">₹{fee.tuition.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Other</div>
                    <div className="text-blue-200">₹{fee.other.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Exam</div>
                    <div className="text-blue-200">₹{fee.exam.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Total</div>
                    <div className="text-white font-semibold">₹{fee.total.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Paid</div>
                    <div className="text-green-200 font-semibold">₹{fee.paidAmount.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-600/30">
                  <ActionButton status={fee.status} semester={fee.semester} remaining={fee.remaining} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
