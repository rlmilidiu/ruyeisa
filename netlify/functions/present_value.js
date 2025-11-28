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
        const { future_value, rate, years, frequency } = data;

        const fv = parseFloat(future_value);
        const r = parseFloat(rate) / 100;
        const t = parseFloat(years);

        const frequencyMap = {
            'annually': 1,
            'semi-annually': 2,
            'quarterly': 4,
            'monthly': 12,
            'daily': 365
        };
        const n = frequencyMap[frequency] || 1;

        // PV = FV / (1 + r/n)^(n*t)
        const presentValue = fv / Math.pow(1 + (r / n), n * t);
        // The difference is the interest that needs to be earned
        const interestNeeded = fv - presentValue;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                future_value: fv,
                rate: parseFloat(rate),
                years: t,
                present_value: parseFloat(presentValue.toFixed(2)),
                interest_needed: parseFloat(interestNeeded.toFixed(2))
            })
        };
    } catch (error) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid request data', details: error.message })
        };
    }
};
