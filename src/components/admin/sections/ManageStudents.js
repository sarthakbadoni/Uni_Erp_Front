import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Search, Plus, Edit, Trash2, Download, ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

const API_BASE = "http://ec2-65-2-8-148.ap-south-1.compute.amazonaws.com:3000";
const blankStudent = {
  StudentID: "",
  CourseID: "",
  Branch: "",
  ClassRollNo: "",
  CourseName: "",
  CurrentSem: "",
  EnrollmentNo: "",
  FatherName: "",
  GuardianPhoneNo: "",
  HighSchool: "",
  Intermediate: "",
  MotherName: "",
  Name: "",
  OfficialEmail: "",
  PersonalEmail: "",
  PhotoURL: "",
  Section: "",
  Specialization: "",
  StudentPhoneNo: "",
  UniRollNo: "",
  Status: "Active"
};

export default function ManageStudents({ onSectionChange }) {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({ ...blankStudent });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/students`)
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(() => setStudents([]));
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.StudentID?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse =
      filterCourse === "all" || student.CourseName === filterCourse;
    const matchesBranch =
      filterBranch === "all" || student.Branch === filterBranch;
    return matchesSearch && matchesCourse && matchesBranch;
  });

  // Handle file input (accepting only JPG)
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file && file.type === "image/jpeg") {
      setUploadedFile(file);
    } else {
      alert("Please upload a JPG image");
    }
  }

  // Add new student logic with photo upload
  const handleAddStudent = async () => {
    if (
      !newStudent.Name ||
      !newStudent.StudentID ||
      !newStudent.OfficialEmail ||
      !newStudent.CourseID ||
      !newStudent.CourseName ||
      !newStudent.Branch ||
      !newStudent.Specialization
    ) {
      alert("Fill all required fields marked *");
      return;
    }
    let photoUrl = "";
    if (uploadedFile) {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("photo", uploadedFile);
      // Backend renames as <StudentID>.jpg and puts to S3
      const res = await fetch(
        `${API_BASE}/upload-photo/${newStudent.StudentID}`,
        {
          method: "POST",
          body: formData,
        }
      );
      setUploadingImage(false);
      if (res.ok) {
        const data = await res.json();
        photoUrl = data.url;
      } else {
        alert("Image upload failed!");
        return;
      }
    }

    // Attach photo URL before POSTing student
    const studentData = { ...newStudent, PhotoURL: photoUrl };
    const res = await fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    });

    if (res.ok) {
      const data = await res.json();
      setStudents([...students, data]);
      setNewStudent({ ...blankStudent });
      setUploadedFile(null);
      setIsAddDialogOpen(false);
      alert("Student added successfully!");
    } else {
      alert("Error adding student");
    }
  };

  const handleEditStudent = async () => {
    const id = editingStudent.StudentID;
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingStudent),
    });
    if (res.ok) {
      const updated = await res.json();
      setStudents(
        students.map(s =>
          s.StudentID === id ? updated : s
        )
      );
      setIsEditDialogOpen(false);
      setEditingStudent(null);
      alert("Student updated!");
    } else {
      alert("Error updating student");
    }
  };

  const handleDeleteStudent = async () => {
    const id = deleteStudentId;
    const res = await fetch(`${API_BASE}/students/${id}`, { method: "DELETE" });
    if (res.ok) {
      setStudents(students.filter(s => s.StudentID !== id));
      setDeleteStudentId(null);
      alert("Student deleted!");
    } else {
      alert("Error deleting student");
    }
  };

  const openEditDialog = student => {
    setEditingStudent({ ...student });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {onSectionChange && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSectionChange("overview")}
                  className="text-slate-400 hover:text-slate-100 hover:bg-slate-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <CardTitle className="text-blue-400">Manage Students</CardTitle>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">Add New Student</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      ["Name", "Full Name *", "Enter student name"],
                      ["StudentID", "Student ID *", "S101"],
                      ["CourseID", "Course ID *", "CS101"],
                      ["CourseName", "Course Name *", "B.Tech"],
                      ["Branch", "Branch *", "CSE"],
                      ["Specialization", "Specialization *", "Cyber Security"],
                      ["Section", "Section *", "CS1"],
                      ["ClassRollNo", "Class Roll Number", "1"],
                      ["CurrentSem", "Semester *", "3"],
                      ["EnrollmentNo", "Enrollment No", "GEU2025AMANKUMAR"],
                      ["UniRollNo", "University Roll Number", "GEU2025CSE001"],
                      ["OfficialEmail", "Official Email *", "raghav.mishra@gehu.ac.in"],
                      ["PersonalEmail", "Personal Email", "raghavmishragandghisra@gmail.com"],
                      ["StudentPhoneNo", "Student Phone No", "9027847204"],
                      ["GuardianPhoneNo", "Guardian Phone No", "9876543210"],
                      ["FatherName", "Father Name", "Sahil Singh Gandi"],
                      ["MotherName", "Mother Name", "Tony"],
                      ["HighSchool", "High School %", "89.5"],
                      ["Intermediate", "Intermediate %", "90.2"],
                      ["Status", "Status", "Active"]
                    ].map(([field, label, placeholder]) => (
                      <div key={field}>
                        <Label className="text-slate-300">{label}</Label>
                        <Input
                          placeholder={placeholder}
                          value={newStudent[field]}
                          onChange={e =>
                            setNewStudent({ ...newStudent, [field]: e.target.value })
                          }
                          className="bg-slate-700 border-slate-600 text-slate-100 mt-1"
                        />
                      </div>
                    ))}
                    <div>
                      <Label className="text-slate-300">Photo (JPG only, auto-renamed by StudentID)</Label>
                      <Input type="file" accept="image/jpeg" onChange={handleImageUpload} />
                      {uploadingImage && (
                        <div className="text-blue-500 text-xs mt-1">Uploading image...</div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleAddStudent}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Add Student
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="B.Tech">B.Tech</SelectItem>
                <SelectItem value="M.Tech">M.Tech</SelectItem>
                <SelectItem value="BCA">BCA</SelectItem>
                <SelectItem value="MCA">MCA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBranch} onValueChange={setFilterBranch}>
              <SelectTrigger className="w-full md:w-48 bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="CSE">CSE</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="ECE">ECE</SelectItem>
                <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="hidden md:flex bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-lg border border-slate-700 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/50">
                  <TableHead className="text-slate-300">Student ID</TableHead>
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Official Email</TableHead>
                  <TableHead className="text-slate-300">Course</TableHead>
                  <TableHead className="text-slate-300">Branch</TableHead>
                  <TableHead className="text-slate-300">Semester</TableHead>
                  <TableHead className="text-slate-300">Specialization</TableHead>
                  <TableHead className="text-slate-300">Section</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Photo</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map(student => (
                  <TableRow
                    key={student.StudentID}
                    className="border-slate-700 hover:bg-slate-700/30"
                  >
                    <TableCell className="text-slate-200">{student.StudentID}</TableCell>
                    <TableCell className="text-slate-200">{student.Name}</TableCell>
                    <TableCell className="text-slate-400">{student.OfficialEmail}</TableCell>
                    <TableCell className="text-slate-200">{student.CourseName}</TableCell>
                    <TableCell className="text-slate-200">{student.Branch}</TableCell>
                    <TableCell className="text-slate-200">{student.CurrentSem}</TableCell>
                    <TableCell className="text-slate-200">{student.Specialization}</TableCell>
                    <TableCell className="text-slate-200">{student.Section}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.Status === "Active"
                            ? "default"
                            : student.Status === "Graduated"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {student.Status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <img
                        src={student.PhotoURL || "/default-student.jpg"}
                        alt={student.Name}
                        style={{
                          width: 45,
                          height: 45,
                          borderRadius: "50%"
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                          onClick={() => openEditDialog(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-slate-700"
                          onClick={() => setDeleteStudentId(student.StudentID)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredStudents.map(student => (
              <div
                key={student.StudentID}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="text-slate-300 text-sm mb-1">Student ID</div>
                    <div className="text-slate-100 font-medium">{student.StudentID}</div>
                  </div>
                  <Badge
                    variant={
                      student.Status === "Active"
                        ? "default"
                        : student.Status === "Graduated"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {student.Status}
                  </Badge>
                </div>
                <div className="mb-2">
                  <div className="text-slate-300 text-sm mb-1">Name</div>
                  <div className="text-slate-100">{student.Name}</div>
                </div>
                <div className="mb-3">
                  <div className="text-slate-300 text-sm mb-1">Email</div>
                  <div className="text-slate-400 text-sm break-all">{student.OfficialEmail}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <div className="text-slate-300 mb-1">Course</div>
                    <div className="text-slate-100">{student.CourseName}</div>
                  </div>
                  <div>
                    <div className="text-slate-300 mb-1">Semester</div>
                    <div className="text-slate-100">{student.CurrentSem}</div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="text-slate-300 text-sm mb-1">Branch</div>
                  <div className="text-slate-100 text-sm">{student.Branch}</div>
                </div>
                <div className="mb-3">
                  <div className="text-slate-300 text-sm mb-1">Photo</div>
                  <img
                    src={student.PhotoURL || "/default-student.jpg"}
                    alt={student.Name}
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: "50%"
                    }}
                  />
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-600">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                    onClick={() => openEditDialog(student)}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 text-red-400 hover:text-red-300 hover:bg-slate-700"
                    onClick={() => setDeleteStudentId(student.StudentID)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-slate-400">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingStudent && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-slate-100">Edit Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(blankStudent).map(field => (
                  <div key={field}>
                    <Label className="text-slate-300">{field}</Label>
                    <Input
                      value={editingStudent[field] || ""}
                      onChange={e =>
                        setEditingStudent({ ...editingStudent, [field]: e.target.value })
                      }
                      className="bg-slate-700 border-slate-600 text-slate-100 mt-1"
                    />
                  </div>
                ))}
              </div>
              <Button
                onClick={handleEditStudent}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Update Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteStudentId !== null}
        onOpenChange={() => setDeleteStudentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this student? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
