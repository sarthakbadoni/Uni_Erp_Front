const express = require("express");
const AWS = require("aws-sdk");
const cors = require("cors");

const app = express();
const port = 3000;

AWS.config.update({ region: "ap-south-1" });
const dynamo = new AWS.DynamoDB.DocumentClient();

app.use(cors());
app.use(express.json());

// === LOGIN API ===
app.post("/api/auth/login", async (req, res) => {
  const { userId } = req.body;
  if (!userId)
    return res.status(400).json({ message: "UserID required" });

  const params = {
    TableName: "Student",
    KeyConditionExpression: "StudentID = :sid",
    ExpressionAttributeValues: { ":sid": userId }
  };
  try {
    const data = await dynamo.query(params).promise();
    if (!data.Items || data.Items.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }
    const student = data.Items[0];
    res.json({
      user: { type: "student", id: student.StudentID },
      studentData: student,
      success: true
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// === FEE STRUCTURE ENDPOINT ===
app.get('/api/feestructure', async (req, res) => {
  const { courseId } = req.query;
  if (!courseId) {
    return res.status(400).json({ error: "courseId required" });
  }

  const params = {
    TableName: "FeesStructure",
    KeyConditionExpression: "CourseID = :cid",
    ExpressionAttributeValues: { ":cid": courseId }
  };
  try {
    const data = await dynamo.query(params).promise();
    res.json((data.Items || []).sort((a, b) => Number(a.Sem) - Number(b.Sem)));
  } catch (err) {
    res.status(500).json({ error: "Error querying FeesStructure", details: err.message });
  }
});

// === FEES PAID ENDPOINT ===
app.get('/api/feepaid', async (req, res) => {
  const { studentId } = req.query;
  if (!studentId)
    return res.status(400).json({ error: "studentId required" });

  const params = {
    TableName: "FeesPaid",
    KeyConditionExpression: "StudentID = :sid",
    ExpressionAttributeValues: { ":sid": studentId }
  };
  try {
    const data = await dynamo.query(params).promise();
    res.json((data.Items || []).sort((a, b) => Number(a.Sem) - Number(b.Sem)));
  } catch (err) {
    res.status(500).json({ error: "Error querying FeesPaid", details: err.message });
  }
});

// === ATTENDANCE ENDPOINT (with debugging) ===
app.get('/api/attendance', async (req, res) => {
  const studentId = req.query.studentId;
  const params = {
    TableName: "Attendance",
    KeyConditionExpression: "StudentID = :sid",
    ExpressionAttributeValues: { ":sid": studentId }
  };
  const result = await dynamo.query(params).promise();
  res.json(result.Items || []);
});

// === SUBJECTS ENDPOINT ===
app.get('/api/subjects', async (req, res) => {
  const { courseId, branch, specialization, semester } = req.query;
  if (!courseId) {
    return res.status(400).json({ error: "courseId required" });
  }

  const params = {
    TableName: "Subjects",
    KeyConditionExpression: "CourseID = :cid",
    ExpressionAttributeValues: { ":cid": courseId }
  };

  try {
    const data = await dynamo.query(params).promise();
    let subjects = data.Items || [];
    if (branch) {
      subjects = subjects.filter(s => (s.Branch || "").toLowerCase() === branch.toLowerCase());
    }
    if (specialization) {
      subjects = subjects.filter(s => (s.Specialization || "").toLowerCase() === specialization.toLowerCase());
    }
    if (semester) {
      subjects = subjects.filter(s => String(s.Semester) === String(semester));
    }
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: "Error querying Subjects", details: err.message });
  }
});

// === HOSTEL ASSIGNED ENDPOINT (MERGED) ===
app.get('/api/hostel-assigned/:studentId', async (req, res) => {
  const studentId = req.params.studentId;
  if (!studentId) return res.status(400).json({ error: "studentId required" });

  try {
    // 1. Get student's hostel assignment
    const assignedParams = {
      TableName: "HostelAssigned",
      KeyConditionExpression: "StudentID = :sid",
      ExpressionAttributeValues: { ":sid": studentId }
    };
    const assignedData = await dynamo.query(assignedParams).promise();
    if (!assignedData.Items || assignedData.Items.length === 0)
      return res.status(404).json({ error: "Not found" });
    const assignedInfo = assignedData.Items[0];

    // 2. Fetch hostel meta from Hostel table via HostelID
    let hostelMeta = {};
    if (assignedInfo.HostelID) {
      const hostelParams = {
        TableName: "Hostel",
        Key: { HostelID: assignedInfo.HostelID }
      };
      const hostelResult = await dynamo.get(hostelParams).promise();
      hostelMeta = hostelResult.Item || {};
    }

    // 3. Merge for UI
    res.json({
      HostelName: hostelMeta.HostelName || assignedInfo.HostelID || "-",
      RoomNumber: assignedInfo.RoomNo || "-",
      MonthlyFee: hostelMeta.MonthlyFee || "-",
      CheckInDate: assignedInfo.CheckInDate || "-",
      WardenName: hostelMeta.WardenName || "",
      WardenPhone: hostelMeta.WardenPhone || "",
      Floor: assignedInfo.Floor || hostelMeta.Floor || "",
      RoomType: assignedInfo.RoomType || hostelMeta.RoomType || ""
    });
  } catch (err) {
    res.status(500).json({ error: "DB error", details: err.message });
  }
});

// === HOSTEL FEE ENDPOINT ===
app.get('/api/hostel-fee/:studentId', async (req, res) => {
  const studentId = req.params.studentId;
  if (!studentId) return res.status(400).json({ error: "studentId required" });
  const params = {
    TableName: "HostelFee",
    KeyConditionExpression: "StudentID = :sid",
    ExpressionAttributeValues: { ":sid": studentId }
  };
  try {
    const data = await dynamo.query(params).promise();
    if (!data.Items || data.Items.length === 0)
      return res.status(404).json({ Fees: [] });
    res.json(data.Items[0]);
  } catch (err) {
    res.status(500).json({ error: "DB error", details: err.message });
  }
});

// === PAY HOSTEL FEE ===
app.post('/api/hostel-fee/pay', async (req, res) => {
  const { studentId, item } = req.body;
  if (!studentId || !item)
    return res.status(400).json({ error: "studentId and item required" });
  try {
    // Fetch the record
    const getParams = {
      TableName: "HostelFee",
      Key: { StudentID: studentId }
    };
    const rec = await dynamo.get(getParams).promise();
    if (!rec.Item) return res.status(404).json({ error: "No record found" });

    // Change the target item's status to Paid
    const updatedFees = rec.Item.Fees.map(f => 
      f.Item === item ? { ...f, Status: "Paid" } : f);
    // Write back
    const updateParams = {
      TableName: "HostelFee",
      Key: { StudentID: studentId },
      UpdateExpression: "SET Fees = :fees",
      ExpressionAttributeValues: { ":fees": updatedFees }
    };
    await dynamo.update(updateParams).promise();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "DB error", details: err.message });
  }
});

// === GET HOSTEL COMPLAINTS FOR A STUDENT ===
app.get('/api/hostel-complaint/:studentId', async (req, res) => {
  const studentId = req.params.studentId;
  if (!studentId) return res.status(400).json({ error: "studentId required" });
  const params = {
    TableName: "HostelComplaint",
    KeyConditionExpression: "StudentID = :sid",
    ExpressionAttributeValues: { ":sid": studentId }
  };
  try {
    const data = await dynamo.query(params).promise();
    res.json(data.Items || []);
  } catch (err) {
    res.status(500).json({ error: "DB error", details: err.message });
  }
});

// === REGISTER NEW HOSTEL COMPLAINT ===
app.post('/api/hostel-complaint', async (req, res) => {
  const comp = req.body;
  if (!comp.StudentID || !comp.ComplaintID) {
    return res.status(400).json({ error: "StudentID and ComplaintID required" });
  }
  const params = {
    TableName: "HostelComplaint",
    Item: comp
  };
  try {
    await dynamo.put(params).promise();
    res.status(201).json({ success: true, complaint: comp });
  } catch (err) {
    res.status(500).json({ error: "DB error", details: err.message });
  }
});



// === GET FACULTY BY ID ===
app.get('/faculty/:facultyId', async (req, res) => {
  const facultyId = req.params.facultyId;
  if (!facultyId) return res.status(400).json({ error: "facultyId required" });

  const params = {
    TableName: "Faculty",
    KeyConditionExpression: "FacultyID = :fid",
    ExpressionAttributeValues: { ":fid": facultyId }
  };

  try {
    const data = await dynamo.query(params).promise();
    if (!data.Items || data.Items.length === 0)
      return res.status(404).json({ error: "Faculty not found" });
    res.json(data.Items[0]);
  } catch (err) {
    res.status(500).json({ error: "Error querying Faculty", details: err.message });
  }
});



// Query students by courseId, branch, semester, section (case-insensitive for section)
app.get('/api/students', async (req, res) => {
  const { courseId, branch, semester, section } = req.query;
  const params = { TableName: "Student" };
  try {
    // Always scan (get ALL students)
    const result = await dynamo.scan(params).promise();
    let students = result.Items || [];

    // Only filter by courseId if NOT "all"
    if (courseId && courseId !== "all")
      students = students.filter(s => s.CourseID === courseId);

    if (branch && branch !== "all")
      students = students.filter(s => s.Branch === branch);

    if (semester && semester !== "all")
      students = students.filter(s => String(s.CurrentSem) === String(semester));

    if (section && section.trim())
      students = students.filter(s => (s.Section || "").toLowerCase() === section.trim().toLowerCase());

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "DB error", details: err.message });
  }
});




// All CourseDetails
app.get('/api/coursedetails', async (req, res) => {
  const params = { TableName: "CourseDetails" };
  try {
    const data = await dynamo.scan(params).promise();
    res.json(data.Items || []);
  } catch (err) {
    res.status(500).json({ error: "Error querying CourseDetails", details: err.message });
  }
});



// Calculate overall attendance percentage for a StudentID
app.get('/api/attendance-overall/:studentId', async (req, res) => {
  const studentId = req.params.studentId;
  if (!studentId) return res.status(400).json({ error: "studentId required" });

  const params = {
    TableName: "Attendance",
    KeyConditionExpression: "StudentID = :sid",
    ExpressionAttributeValues: { ":sid": studentId }
  };
  try {
    const data = await dynamo.query(params).promise();
    const attRecords = data.Items || [];
    // Calculate attendance based on Status field
    const total = attRecords.length;
    const present = attRecords.filter(r =>
      (r.Status || "").toLowerCase() === "present"
    ).length;
    const overall = (total > 0) ? Math.round((present / total) * 100) : "--";
    res.json({ overall });
  } catch (err) {
    res.status(500).json({ error: "Error querying Attendance", details: err.message });
  }
});








app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on http://0.0.0.0:${port}`);
});
