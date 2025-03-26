exports.handler = async (event) => {

    // Create the response
    const response = {
        statusCode: 200,
        message: "Hello from Lambda",
    };

    return response;
};