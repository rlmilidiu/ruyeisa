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
        const { principal, annual_rate, years } = data;

        const monthlyRate = annual_rate / 100 / 12;
        const numPayments = years * 12;

        let monthlyPayment;
        if (monthlyRate === 0) {
            monthlyPayment = principal / numPayments;
        } else {
            monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                (Math.pow(1 + monthlyRate, numPayments) - 1);
        }

        const totalPayment = monthlyPayment * numPayments;
        const totalInterest = totalPayment - principal;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                principal: principal,
                annual_rate: annual_rate,
                years: years,
                monthly_payment: parseFloat(monthlyPayment.toFixed(2)),
                total_payment: parseFloat(totalPayment.toFixed(2)),
                total_interest: parseFloat(totalInterest.toFixed(2))
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
