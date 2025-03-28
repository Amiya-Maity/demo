import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoDb = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
    try {
        // Parse incoming request
        const { principalId, content } = JSON.parse(event.body);

        // Validate input
        if (!principalId || !content) {
            return {
                statusCode: 400, // Bad request
                body: JSON.stringify({
                    message: "Invalid request format. 'principalId' and 'content' fields are required."
                }),
            };
        }

        // Prepare event data
        const newEvent = {
            id: uuidv4(),
            principalId,
            createdAt: new Date().toISOString(),
            body: content,
        };

        // Save to DynamoDB
        const params = {
            TableName: process.env.TABLE_NAME, // Example: 'cmtr-112a2f2b-Events-8rfw'
            Item: {
                id: { S: newEvent.id },
                principalId: { N: String(newEvent.principalId) },
                createdAt: { S: newEvent.createdAt },
                body: { M: mapToDynamoDbFormat(newEvent.body) },
            },
        };
        const command = new PutItemCommand(params);
        await dynamoDb.send(command);

        // Return successful response
        return {
            statusCode: 201,
            body: JSON.stringify({
                event: newEvent, // Include the created event in response
            }),
        };
    } catch (error) {
        console.error("Error:", error);

        // Return error response
        return {
            statusCode: 500, // Internal server error
            body: JSON.stringify({
                message: "An error occurred while processing the request.",
                error: error.message,
            }),
        };
    }
};

// Convert JS object to DynamoDB attribute map
const mapToDynamoDbFormat = (object) => {
    const map = {};
    for (const key in object) {
        if (typeof object[key] === "string") {
            map[key] = { S: object[key] };
        } else if (typeof object[key] === "number") {
            map[key] = { N: object[key].toString() };
        }
        // Add more type handling as needed
    }
    return map;
};