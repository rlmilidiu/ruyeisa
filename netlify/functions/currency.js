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
        const { amount, from, to } = data;

        // Exchange rates (USD as base)
        const rates = {
            'USD': 1.0,
            'EUR': 0.92,
            'GBP': 0.79,
            'JPY': 149.50,
            'BRL': 4.97,
            'CAD': 1.36,
            'AUD': 1.52,
            'CHF': 0.88,
            'CNY': 7.24,
            'INR': 83.12
        };

        if (!rates[from] || !rates[to]) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid currency code' })
            };
        }

        // Convert to USD first, then to target currency
        const amountInUSD = parseFloat(amount) / rates[from];
        const convertedAmount = amountInUSD * rates[to];

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                amount: parseFloat(amount),
                from_currency: from,
                to_currency: to,
                converted_amount: parseFloat(convertedAmount.toFixed(2)),
                rate: parseFloat((rates[to] / rates[from]).toFixed(6))
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
