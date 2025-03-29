const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    let requestBody;
    try {
        // Validate and parse event body
        requestBody = JSON.parse(event.body);
    } catch (error) {
        console.error("Invalid JSON in event body:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid request body' }),
        };
    }

    const newEvent = {
        id: uuidv4(), // Generate unique ID
        principalId: requestBody.principalId,
        createdAt: new Date().toISOString(),
        body: requestBody.content,
    };

    try {
        // DynamoDB put operation
        await dynamoDB.put({
            TableName: process.env.TARGET_TABLE, // Ensure TARGET_TABLE is set
            Item: newEvent,
        }).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({ event: newEvent }),
        };
    } catch (error) {
        console.error("DynamoDB error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to create event' }),
        };
    }
};