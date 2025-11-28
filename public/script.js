document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching
    const tabs = document.querySelectorAll('.tab-btn');
    const calculators = document.querySelectorAll('.calculator');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            calculators.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const target = tab.dataset.target;
            document.getElementById(target).classList.add('active');
        });
    });

    // Interest Type Toggle
    const interestType = document.getElementById('interest-type');
    const frequencyGroup = document.getElementById('frequency-group');

    interestType.addEventListener('change', () => {
        if (interestType.value === 'compound') {
            frequencyGroup.style.display = 'block';
        } else {
            frequencyGroup.style.display = 'none';
        }
    });

    // Helper to format currency
    const formatCurrency = (num, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(num);
    };

    // --- Currency Converter ---
    document.getElementById('btn-currency').addEventListener('click', async () => {
        const amount = document.getElementById('currency-amount').value;
        const from = document.getElementById('currency-from').value;
        const to = document.getElementById('currency-to').value;
        const resultDiv = document.getElementById('result-currency');

        if (!amount || amount <= 0) {
            resultDiv.innerHTML = '<span class="placeholder" style="color: #ef4444;">Please enter a valid amount</span>';
            return;
        }

        resultDiv.innerHTML = '<span class="placeholder">Converting...</span>';

        try {
            const response = await fetch('/.netlify/functions/currency', {
                method: 'POST',
                body: JSON.stringify({ amount, from, to })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            resultDiv.innerHTML = `
                <div class="result-value">${formatCurrency(data.converted_amount, to)}</div>
                <div class="result-detail">1 ${from} = ${data.rate.toFixed(4)} ${to}</div>
            `;
        } catch (error) {
            resultDiv.innerHTML = `<span class="placeholder" style="color: #ef4444;">Error: ${error.message}</span>`;
        }
    });

    // --- Loan Calculator ---
    document.getElementById('btn-loan').addEventListener('click', async () => {
        const principal = document.getElementById('loan-principal').value;
        const rate = document.getElementById('loan-rate').value;
        const years = document.getElementById('loan-years').value;
        const resultDiv = document.getElementById('result-loan');

        if (!principal || !rate || !years) {
            resultDiv.innerHTML = '<span class="placeholder" style="color: #ef4444;">Please fill all fields</span>';
            return;
        }

        resultDiv.innerHTML = '<span class="placeholder">Calculating...</span>';

        try {
            const response = await fetch('/.netlify/functions/loan', {
                method: 'POST',
                body: JSON.stringify({ principal, rate, years })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            resultDiv.innerHTML = `
                <div class="result-value">${formatCurrency(data.monthly_payment)} / mo</div>
                <div class="result-detail">Total Interest: ${formatCurrency(data.total_interest)}</div>
                <div class="result-detail">Total Payment: ${formatCurrency(data.total_payment)}</div>
            `;
        } catch (error) {
            resultDiv.innerHTML = `<span class="placeholder" style="color: #ef4444;">Error: ${error.message}</span>`;
        }
    });

    // --- Interest Calculator ---
    document.getElementById('btn-interest').addEventListener('click', async () => {
        const principal = document.getElementById('interest-principal').value;
        const rate = document.getElementById('interest-rate').value;
        const time = document.getElementById('interest-time').value;
        const type = document.getElementById('interest-type').value;
        const frequency = document.getElementById('interest-frequency').value;
        const resultDiv = document.getElementById('result-interest');

        if (!principal || !rate || !time) {
            resultDiv.innerHTML = '<span class="placeholder" style="color: #ef4444;">Please fill all fields</span>';
            return;
        }

        resultDiv.innerHTML = '<span class="placeholder">Calculating...</span>';

        try {
            const response = await fetch('/.netlify/functions/interest', {
                method: 'POST',
                body: JSON.stringify({ principal, rate, time, type, frequency })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            resultDiv.innerHTML = `
                <div class="result-value">${formatCurrency(data.total_amount)}</div>
                <div class="result-detail">Interest Earned: ${formatCurrency(data.interest_earned)}</div>
            `;
        } catch (error) {
            resultDiv.innerHTML = `<span class="placeholder" style="color: #ef4444;">Error: ${error.message}</span>`;
        }
    });
    // --- Present Value Calculator ---
    document.getElementById('btn-pv').addEventListener('click', async () => {
        const future_value = document.getElementById('pv-future-value').value;
        const rate = document.getElementById('pv-rate').value;
        const years = document.getElementById('pv-years').value;
        const frequency = document.getElementById('pv-frequency').value;
        const resultDiv = document.getElementById('result-pv');

        if (!future_value || !rate || !years) {
            resultDiv.innerHTML = '<span class="placeholder" style="color: #ef4444;">Please fill all fields</span>';
            return;
        }

        resultDiv.innerHTML = '<span class="placeholder">Calculating...</span>';

        try {
            const response = await fetch('/.netlify/functions/present_value', {
                method: 'POST',
                body: JSON.stringify({ future_value, rate, years, frequency })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            resultDiv.innerHTML = `
                <div class="result-value">${formatCurrency(data.present_value)}</div>
                <div class="result-detail">To reach ${formatCurrency(data.future_value)} in ${data.years} years</div>
                <div class="result-detail">Interest Needed: ${formatCurrency(data.interest_needed)}</div>
            `;
        } catch (error) {
            resultDiv.innerHTML = `<span class="placeholder" style="color: #ef4444;">Error: ${error.message}</span>`;
        }
    });
});
