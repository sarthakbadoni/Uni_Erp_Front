import React from "react";

export default function StudentCard({ student }) {
  return (
    <section className="w-full bg-slate-800 rounded-xl shadow-lg px-3 py-6 md:px-10 md:py-8 mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-t-xl pt-6 pb-3 mb-8 text-center w-full">
        <h2 className="text-2xl md:text-3xl font-bold">Student Identity Card</h2>
        <div className="text-base font-medium opacity-80">
          Institute of Technology and Engineering
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 mb-6 items-center justify-center w-full">
        <div className="flex flex-col items-center w-full max-w-[180px]">
          <img
            src={student.photo}
            alt={student.name}
            className="border-4 border-blue-500 rounded-lg w-32 h-40 md:w-40 md:h-52 object-cover"
          />
          <span className="px-4 py-1 mt-3 bg-white rounded font-semibold text-blue-600 shadow text-sm">
            Active
          </span>
        </div>
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-8 gap-y-4">
          <div>
            <label className="block text-blue-200 font-medium mb-1">Name</label>
            <div className="bg-slate-700 text-white rounded px-4 py-2 text-base">
              {student.name}
            </div>
          </div>
          <div>
            <label className="block text-blue-200 font-medium mb-1">Student ID</label>
            <div className="bg-slate-700 text-white rounded px-4 py-2 text-base">
              {student.studentId}
            </div>
          </div>
          <div>
            <label className="block text-blue-200 font-medium mb-1">University Roll No</label>
            <div className="bg-slate-700 text-white rounded px-4 py-2 text-base">
              {student.universityRollNo}
            </div>
          </div>
          <div>
            <label className="block text-blue-200 font-medium mb-1">Class Roll No</label>
            <div className="bg-slate-700 text-white rounded px-4 py-2 text-base">
              {student.classRollNo}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-blue-200 font-medium mb-1">Official Email</label>
            <div className="bg-slate-700 text-white rounded px-4 py-2 text-base break-all">
              {student.email}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-blue-200 font-medium mb-1">Enrollment Number</label>
            <div className="bg-slate-700 text-white rounded px-4 py-2 text-base">
              {student.enrollmentNumber}
            </div>
          </div>
        </div>
      </div>
      <hr className="border-blue-900 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
        <div>
          <h3 className="text-lg font-bold text-blue-300 mb-2">Academic Information</h3>
          <label className="block text-blue-200 font-medium mb-1">Course</label>
          <div className="bg-slate-700 text-white rounded px-4 py-2 mb-2">
            {student.course}
          </div>
          <label className="block text-blue-200 font-medium mb-1">Specialization</label>
          <div className="bg-slate-700 text-white rounded px-4 py-2 mb-2">
            {student.Specialization}
          </div>
          <label className="block text-blue-200 font-medium mb-1">High School %</label>
          <div className="bg-slate-700 text-white rounded px-4 py-2">
            {student.highschoolPercentage}
          </div>
        </div>
        <div>
          <label className="block text-blue-200 font-medium mb-1 mt-10 md:mt-0">Branch</label>
          <div className="bg-slate-700 text-white rounded px-4 py-2 mb-2">
            {student.branch}
          </div>
          <label className="block text-blue-200 font-medium mb-1">Current Semester</label>
          <div className="bg-slate-700 text-white rounded px-4 py-2 mb-2">
            {student.semester}
          </div>
          <label className="block text-blue-200 font-medium mb-1">Section</label>
          <div className="bg-slate-700 text-white rounded px-4 py-2 mb-2">
            {student.section}
          </div>
          <label className="block text-blue-200 font-medium mb-1">Intermediate %</label>
          <div className="bg-slate-700 text-white rounded px-4 py-2">
            {student.intermediatePercentage}
          </div>
        </div>
      </div>
      <hr className="border-blue-900 my-5" />
      <div>
        <h3 className="text-lg font-bold text-blue-300 mb-2">Family Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-blue-200 font-medium mb-1">Father's Name</label>
            <div className="bg-slate-700 text-white rounded px-4 py-2">
              {student.fatherName}
            </div>
          </div>
          <div>
            <label className="block text-blue-200 font-medium mb-1">Mother's Name</label>
            <div className="bg-slate-700 text-white rounded px-4 py-2">
              {student.motherName}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
