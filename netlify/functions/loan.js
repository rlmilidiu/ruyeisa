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
        const { principal, rate, years } = data;

        const monthlyRate = parseFloat(rate) / 100 / 12;
        const numPayments = parseFloat(years) * 12;

        let monthlyPayment;
        if (monthlyRate === 0) {
            monthlyPayment = parseFloat(principal) / numPayments;
        } else {
            monthlyPayment = parseFloat(principal) * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                (Math.pow(1 + monthlyRate, numPayments) - 1);
        }

        const totalPayment = monthlyPayment * numPayments;
        const totalInterest = totalPayment - parseFloat(principal);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                principal: parseFloat(principal),
                annual_rate: parseFloat(rate),
                years: parseFloat(years),
                monthly_payment: parseFloat(monthlyPayment.toFixed(2)),
                total_payment: parseFloat(totalPayment.toFixed(2)),
                total_interest: parseFloat(totalInterest.toFixed(2))
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
