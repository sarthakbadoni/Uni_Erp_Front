import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { User, Mail, Phone, MapPin, Award, BookOpen, Save, Calendar, Briefcase } from "lucide-react";
import { Separator } from "../ui/separator";

export default function FacultyProfileSection({ facultyData }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [profileData, setProfileData] = React.useState({
    name: facultyData?.Name || "",
    officialEmail: facultyData?.OfficialEmail || "",
    personalEmail: facultyData?.PersonalEmail || "",
    phone: facultyData?.PhoneNo || "",
    department: facultyData?.Department || "",
    designation: facultyData?.Designation || "",
    qualification: facultyData?.Qualification || "",
    specialization: facultyData?.Specialization || "",
    joiningDate: facultyData?.JoiningDate || "",
    dob: facultyData?.DOB || "",
    gender: facultyData?.Gender || "",
    address: facultyData?.Address || "",
    photoURL: facultyData?.PhotoURL || "",
  });

  // Parse specializations (assuming comma-separated or single string)
  const specializations = profileData.specialization
    ? profileData.specialization.split(",").map(s => s.trim())
    : [];

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://ec2-65-2-8-148.ap-south-1.compute.amazonaws.com:3000/api/faculty/${facultyData.FacultyID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Name: profileData.name,
            OfficialEmail: profileData.officialEmail,
            PersonalEmail: profileData.personalEmail,
            PhoneNo: profileData.phone,
            Designation: profileData.designation,
            Qualification: profileData.qualification,
            Specialization: profileData.specialization,
            JoiningDate: profileData.joiningDate,
            DOB: profileData.dob,
            Gender: profileData.gender,
            Address: profileData.address,
            PhotoURL: profileData.photoURL,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert("Profile updated successfully!");
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to update profile"}`);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Unable to save profile. Please try again.");
    }
  };

  const getInitials = (name) => {
    if (!name) return "FA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate experience from joining date
  const calculateExperience = (joiningDate) => {
    if (!joiningDate) return "N/A";
    const start = new Date(joiningDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    return `${years} year${years !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <User className="h-6 w-6" />
              Faculty Profile
            </CardTitle>
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                "Edit Profile"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-slate-700">
              {profileData.photoURL ? (
                <AvatarImage 
                  src={profileData.photoURL} 
                  alt={profileData.name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-blue-600 text-white text-2xl">
                {getInitials(profileData.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl text-slate-100 mb-1">
                {profileData.name}
              </h2>
              <p className="text-slate-400 mb-3">
                {profileData.designation}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {specializations.length > 0 ? (
                  specializations.map((spec) => (
                    <Badge key={spec} variant="secondary" className="bg-slate-600 text-slate-100">
                      {spec}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className="bg-slate-600 text-slate-100">
                    {profileData.department}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-slate-600" />

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-2 text-slate-300">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                ) : (
                  <p className="text-slate-300">{profileData.name}</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2 text-slate-300">
                  <Mail className="h-4 w-4" />
                  Official Email
                </Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={profileData.officialEmail}
                    onChange={(e) =>
                      setProfileData({ ...profileData, officialEmail: e.target.value })
                    }
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                ) : (
                  <p className="text-slate-300">{profileData.officialEmail}</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2 text-slate-300">
                  <Mail className="h-4 w-4" />
                  Personal Email
                </Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={profileData.personalEmail}
                    onChange={(e) =>
                      setProfileData({ ...profileData, personalEmail: e.target.value })
                    }
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                ) : (
                  <p className="text-slate-300">{profileData.personalEmail}</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2 text-slate-300">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                ) : (
                  <p className="text-slate-300">{profileData.phone}</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2 text-slate-300">
                  <BookOpen className="h-4 w-4" />
                  Department
                </Label>
                {isEditing ? (
                  <Input
                    value={profileData.department}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        department: e.target.value,
                      })
                    }
                    className="bg-slate-700 border-slate-600 text-slate-100"
                    disabled
                  />
                ) : (
                  <p className="text-slate-300">{profileData.department}</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2 text-slate-300">
                  <Briefcase className="h-4 w-4" />
                  Designation
                </Label>
                {isEditing ? (
                  <Input
                    value={profileData.designation}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        designation: e.target.value,
                      })
                    }
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                ) : (
                  <p className="text-slate-300">{profileData.designation}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2 mb-2 text-slate-300">
                  <Award className="h-4 w-4" />
                  Qualification
                </Label>
                {isEditing ? (
                  <Input
                    value={profileData.qualification}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        qualification: e.target.value,
                      })
                    }
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                ) : (
                  <p className="text-slate-300">{profileData.qualification}</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2 text-slate-300">
                  <Award className="h-4 w-4" />
                  Specialization
                </Label>
                {isEditing ? (
                  <Input
                    value={profileData.specialization}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        specialization: e.target.value,
                      })
                    }
                    placeholder="e.g., Artificial Intelligence, Machine Learning"
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                ) : (
                  <p className="text-slate-300">{profileData.specialization || "N/A"}</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2 text-slate-300">
                  <Calendar className="h-4 w-4" />
                  Experience
                </Label>
                <p className="text-slate-300">
                  {calculateExperience(profileData.joiningDate)}
                </p>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2 text-slate-300">
                  <Calendar className="h-4 w-4" />
                  Joining Date
                </Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={profileData.joiningDate}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        joiningDate: e.target.value,
                      })
                    }
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                ) : (
                  <p className="text-slate-300">{profileData.joiningDate || "N/A"}</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2 text-slate-300">
                  <Calendar className="h-4 w-4" />
                  Date of Birth
                </Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={profileData.dob}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        dob: e.target.value,
                      })
                    }
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                ) : (
                  <p className="text-slate-300">{profileData.dob || "N/A"}</p>
                )}
              </div>

              <div>
                <Label className="mb-2 text-slate-300">Gender</Label>
                {isEditing ? (
                  <Input
                    value={profileData.gender}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        gender: e.target.value,
                      })
                    }
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                ) : (
                  <p className="text-slate-300">{profileData.gender || "N/A"}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-2 text-slate-300">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            {isEditing ? (
              <Textarea
                rows={3}
                value={profileData.address}
                onChange={(e) =>
                  setProfileData({ ...profileData, address: e.target.value })
                }
                className="bg-slate-700 border-slate-600 text-slate-100"
              />
            ) : (
              <p className="text-slate-300">{profileData.address || "N/A"}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
