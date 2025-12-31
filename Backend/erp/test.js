const AWS = require("aws-sdk");

AWS.config.update({ region: "ap-south-1" });
// No credentials in code - uses IAM role or ~/.aws/credentials

const dynamo = new AWS.DynamoDB.DocumentClient();

async function testDynamoDB() {
  const params = {
    TableName: "Student",
    Limit: 5 // Get first 5 items (change as needed)
  };
  try {
    const data = await dynamo.scan(params).promise();
    console.log("DynamoDB data:", JSON.stringify(data.Items, null, 2));
  } catch (err) {
    console.error("DynamoDB ERROR:", err);
  }
}

testDynamoDB();
