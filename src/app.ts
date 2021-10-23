import express from "express";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const app = express();
const port = 3000;

app.get("/increment-button", (req, res) => {
  const client = new DynamoDBClient({ region: "us-east-2" });
  const dbUpdateCommand = new UpdateItemCommand({
    TableName: "Clear-Button",
    Key: {
      "Key": {
        S: "count"
      }
    },
    UpdateExpression: "SET V = V + :one",
    ExpressionAttributeValues: {":one": {N: "1"}},
    ReturnValues: "UPDATED_NEW"
  });

  const response = client.send(dbUpdateCommand);
  response.then((value) => {
    if (value.Attributes && value.Attributes.V.N) {
      res.send(value.Attributes.V.N);
    } else {
      throw "Something went wrong";
    }
  }).catch((err) => res.send(err));
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});