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
        const { principal, rate, time, type, frequency } = data;

        const p = parseFloat(principal);
        const r = parseFloat(rate);
        const t = parseFloat(time);

        let interest, totalAmount;

        if (type === 'compound') {
            // Compound interest: A = P(1 + r/n)^(nt)
            const frequencyMap = {
                'annually': 1,
                'semi-annually': 2,
                'quarterly': 4,
                'monthly': 12,
                'daily': 365
            };
            const n = frequencyMap[frequency] || 1;
            totalAmount = p * Math.pow(1 + (r / 100) / n, n * t);
            interest = totalAmount - p;
        } else {
            // Simple interest: I = P * R * T / 100
            interest = (p * r * t) / 100;
            totalAmount = p + interest;
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                principal: p,
                rate: r,
                time: t,
                interest_earned: parseFloat(interest.toFixed(2)),
                total_amount: parseFloat(totalAmount.toFixed(2))
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
