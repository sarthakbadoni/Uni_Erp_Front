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
  console.log("== /api/auth/login called ==");
  console.log("Received body: userId = " + userId);
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
      console.log("User not found:", userId);
      return res.status(401).json({ message: "User not found" });
    }
    const student = data.Items[0];
    console.log("Student object:", student);
    res.json({
      user: { type: "student", id: student.StudentID },
      studentData: student,
      success: true
    });
  } catch (err) {
    console.error("Error in /api/auth/login:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// === FEE STRUCTURE ENDPOINT ===
app.get('/api/feestructure', async (req, res) => {
  const { courseId } = req.query;
  console.log("== /api/feestructure called ==");
  console.log("Received query: courseId = " + courseId);
  if (!courseId) {
    console.log("Error: missing courseId");
    return res.status(400).json({ error: "courseId required" });
  }

  const params = {
    TableName: "FeesStructure",
    KeyConditionExpression: "CourseID = :cid",
    ExpressionAttributeValues: { ":cid": courseId }
  };
  try {
    const data = await dynamo.query(params).promise();
    console.log("DynamoDB response for feestructure:");
    console.dir(data.Items, { depth: null });
    res.json((data.Items || []).sort((a, b) => Number(a.Sem) - Number(b.Sem)));
  } catch (err) {
    console.error("Error in /api/feestructure", err);
    res.status(500).json({ error: "Error querying FeesStructure", details: err.message });
  }
});

// === FEES PAID ENDPOINT ===
app.get('/api/feepaid', async (req, res) => {
  const { studentId } = req.query;
  console.log("== /api/feepaid called ==");
  console.log("Received query: studentId = " + studentId);
  if (!studentId) {
    console.log("Error: missing studentId");
    return res.status(400).json({ error: "studentId required" });
  }

  const params = {
    TableName: "FeesPaid",
    KeyConditionExpression: "StudentID = :sid",
    ExpressionAttributeValues: { ":sid": studentId }
  };
  try {
    const data = await dynamo.query(params).promise();
    console.log("DynamoDB response for feepaid:");
    console.dir(data.Items, { depth: null });
    res.json((data.Items || []).sort((a, b) => Number(a.Sem) - Number(b.Sem)));
  } catch (err) {
    console.error("Error in /api/feepaid", err);
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
    TableName: "Subjects", // change if your table is named differently
    KeyConditionExpression: "CourseID = :cid",
    ExpressionAttributeValues: { ":cid": courseId }
  };

  try {
    const data = await dynamo.query(params).promise();
    let subjects = data.Items || [];

    // Filter by optional branch, specialization, semester
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
    console.error("Error querying Subjects:", err);
    res.status(500).json({ error: "Error querying Subjects", details: err.message });
  }
});




app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on http://0.0.0.0:${port}`);
});
