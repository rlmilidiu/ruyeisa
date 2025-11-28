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

        // Exchange rates (USD as base) - Updated November 2025
        const rates = {
            'USD': 1.0,
            'EUR': 0.86,      // Updated: 0.86 EUR per USD
            'GBP': 0.76,      // Updated: 0.76 GBP per USD (1/1.32)
            'JPY': 156.00,    // Updated: 156 JPY per USD
            'BRL': 5.36,      // Updated: 5.36 BRL per USD
            'CAD': 1.40,      // Updated: 1.40 CAD per USD
            'AUD': 1.53,      // Updated: 1.53 AUD per USD
            'CHF': 0.88,      // Maintained
            'CNY': 7.24,      // Maintained
            'INR': 83.12      // Maintained
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
