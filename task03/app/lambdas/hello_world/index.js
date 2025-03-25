exports.handler = async (event) => {

    // Create the response
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello from Lambda"
        }),
    };
    
    return response;
};