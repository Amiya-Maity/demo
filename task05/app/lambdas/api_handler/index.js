import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
const dynamoDb = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
    try {
        const { principalId, content } = JSON.parse(event.body);
        if (!principalId || !content) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Invalid request format. 'principalId' and 'content' are required fields.",
                }),
            };
        }
        const newEvent = {
            id: uuidv4(),
            principalId: principalId,
            createdAt: new Date().toISOString(),
            body: content,
        };
        const params = {
            TableName: "Events",
            Item: {
                id: { S: newEvent.id },
                principalId: { N: String(newEvent.principalId) },
                createdAt: { S: newEvent.createdAt },
                body: { M: convertToDynamoDBMap(newEvent.body) },
            },
        };

        const command = new PutItemCommand(params);
        await dynamoDb.send(command);

        return {
            statusCode: 201,
            body: JSON.stringify({
                statusCode: 201,
                event: newEvent,
            }),
        };
    } catch (error) {
        console.error("Error saving event:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "An error occurred while processing the request.",
                error: error.message,
            }),
        };
    }
};
const convertToDynamoDBMap = (object) => {
    const map = {};
    for (const key in object) {
        if (typeof object[key] === "string") {
            map[key] = { S: object[key] };
        }
    }
    return map;
};