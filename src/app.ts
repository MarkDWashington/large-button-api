import http from "http";
import express from "express";
import { createTerminus } from "@godaddy/terminus";

import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const app = express();
const port = 3000;

app.get("/increment", (req, res) => {
  const client = new DynamoDBClient({ region: "us-east-2" });
  const dbUpdateCommand = new UpdateItemCommand({
    TableName: "Clear-Button",
    Key: {
      "Key": {
        S: "count"
      }
    },
    UpdateExpression: "SET V = V + :one",
    ExpressionAttributeValues: { ":one": { N: "1" } },
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

async function healthCheck(): Promise<void> {
  return Promise.resolve();
}

async function signalHandler(): Promise<void> {
  console.log("Server is shutting down.");
}

const server = http.createServer(app);
createTerminus(server, {
  signal: "SIGINT",
  healthChecks: {
    "/healthcheck": healthCheck,
  },
  onSignal: signalHandler
});

server.listen(3000, () => {
  console.log(`Server is listening on port ${port}`);
})