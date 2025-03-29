import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoDBClient = new DynamoDBClient();
const TABLE_NAME = process.env.TABLE_NAME || "Events";

export const handler = async (event) => {
    try {
        console.info("Processing event:", JSON.stringify(event, null, 2));

        if (!process.env.TABLE_NAME) {
            console.error("Environment variable TABLE_NAME is not defined");
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Internal server error: Table name not defined in environment variables" })
            };
        }

        // Parse and validate the request body
        let inputEvent;
        try {
            inputEvent = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        } catch (parseError) {
            console.error("Error parsing event body:", parseError);
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid JSON format in request body" })
            };
        }

        const principalId = Number(inputEvent.principalId);
        if (isNaN(principalId) || inputEvent.content === undefined) {
            console.error("Validation failed: Missing or invalid fields", inputEvent);
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid input: principalId and content are required" })
            };
        }

        // Construct the DynamoDB item
        const eventId = uuidv4();
        const createdAt = new Date().toISOString();
        const eventItem = {
            id: eventId,
            principalId,
            createdAt,
            body: inputEvent.content
        };

        console.log("Constructed DynamoDB item:", JSON.stringify(eventItem, null, 2));

        // Save the event to DynamoDB
        try {
            await dynamoDBClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: eventItem,
            }));
            console.log("Saved successfully");
        } catch (dynamoError) {
            console.error("Error saving to DynamoDB:", dynamoError);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Failed to save event to DynamoDB", error: dynamoError.message })
            };
        }

        // Prepare the response
        return {
            statusCode: 201,
            body: JSON.stringify({ event: eventItem })
        };

    } catch (error) {
        console.error("Error processing request:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error: error.message })
        };
    }
};