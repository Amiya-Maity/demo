import axios from 'axios';

export const handler = async (event) => {
  const path = event.path || '';
  const method = event.httpMethod || '';

  if (path === '/weather' && method === 'GET') {
    try {
      // Fetch weather data from Open-Meteo API
      const response = await axios.get("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m");
      const weatherData = response.data;

      return {
        statusCode: 200,
        body: JSON.stringify(weatherData),
        headers: {
          'Content-Type': 'application/json'
        },
        isBase64Encoded: false
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
        headers: {
          'Content-Type': 'application/json'
        },
        isBase64Encoded: false
      };
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        message: `Bad request syntax or unsupported method. Request path: ${path}. HTTP method: ${method}`
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      isBase64Encoded: false
    };
  }
};
