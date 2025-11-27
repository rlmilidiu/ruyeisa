import json

def handler(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Content-Type": "application/json"
    }

    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }

    try:
        body = json.loads(event['body'])
        principal = float(body.get('principal', 0))
        rate_annual = float(body.get('rate', 0))
        years = float(body.get('years', 0))

        if principal <= 0 or years <= 0:
             return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Principal and years must be greater than 0'})
            }

        # Monthly interest rate
        rate_monthly = (rate_annual / 100) / 12
        num_payments = years * 12

        if rate_annual == 0:
            monthly_payment = principal / num_payments
        else:
            monthly_payment = principal * (rate_monthly * (1 + rate_monthly) ** num_payments) / ((1 + rate_monthly) ** num_payments - 1)

        total_payment = monthly_payment * num_payments
        total_interest = total_payment - principal

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'monthly_payment': round(monthly_payment, 2),
                'total_payment': round(total_payment, 2),
                'total_interest': round(total_interest, 2)
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
