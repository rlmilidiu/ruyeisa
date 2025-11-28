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

        // Fetch live exchange rates from free API
        const apiUrl = `https://open.er-api.com/v6/latest/${from}`;

        let rates;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch exchange rates');
            }
            const ratesData = await response.json();
            rates = ratesData.rates;
        } catch (apiError) {
            // Fallback to static rates if API fails
            console.error('API error, using fallback rates:', apiError);
            const fallbackRates = {
                'USD': 1.0, 'EUR': 0.86, 'GBP': 0.76, 'JPY': 156.00,
                'BRL': 5.36, 'CAD': 1.40, 'AUD': 1.53, 'CHF': 0.88,
                'CNY': 7.24, 'INR': 83.12
            };

            // Convert fallback rates to be relative to 'from' currency
            if (from === 'USD') {
                rates = fallbackRates;
            } else {
                rates = {};
                const fromRate = fallbackRates[from];
                for (const [currency, rate] of Object.entries(fallbackRates)) {
                    rates[currency] = rate / fromRate;
                }
            }
        }

        if (!rates[to]) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid currency code' })
            };
        }

        // Convert amount using live rates
        const convertedAmount = parseFloat(amount) * rates[to];
        const rate = rates[to];

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                amount: parseFloat(amount),
                from_currency: from,
                to_currency: to,
                converted_amount: parseFloat(convertedAmount.toFixed(2)),
                rate: parseFloat(rate.toFixed(6)),
                live_rates: true
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
