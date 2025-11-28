exports.handler = async function (event, context) {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        const { principal, rate, time } = data;

        // Calculate simple interest: I = P * R * T / 100
        const interest = (principal * rate * time) / 100;
        const totalAmount = principal + interest;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                principal: principal,
                rate: rate,
                time: time,
                interest: parseFloat(interest.toFixed(2)),
                total_amount: parseFloat(totalAmount.toFixed(2))
            })
        };
    } catch (error) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid request data' })
        };
    }
};
