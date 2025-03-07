exports.handler = async (event) => {
    let response;
    
    if (event.path === '/hello' && event.httpMethod === 'GET') {
        response = {
            statusCode: 200,
            body: JSON.stringify({
                statusCode: 200,
                message: "Hello from Lambda"
            }),
            headers: {
                "content-type": "application/json"
            },
            isBase64Encoded: false
        };
    } else {
        response = {
            statusCode: 400,
            body: JSON.stringify({
                statusCode: 400,
                message: `Bad request syntax or unsupported method. Request path: ${event.path}. HTTP method: ${event.httpMethod}`
            }),
            headers: {
                "content-type": "application/json"
            },
            isBase64Encoded: false
        };
    }
    
    return response;
};