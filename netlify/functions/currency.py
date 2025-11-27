import json
import requests

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
        amount = float(body.get('amount', 0))
        from_currency = body.get('from', 'USD')
        to_currency = body.get('to', 'EUR')

        if amount <= 0:
             return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Amount must be greater than 0'})
            }

        # Using Frankfurter API (free, no key required)
        url = f"https://api.frankfurter.app/latest?amount={amount}&from={from_currency}&to={to_currency}"
        response = requests.get(url)
        
        if response.status_code != 200:
             return {
                'statusCode': 502,
                'headers': headers,
                'body': json.dumps({'error': 'Failed to fetch exchange rates'})
            }
            
        data = response.json()
        converted_amount = data['rates'][to_currency]
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'amount': amount,
                'from': from_currency,
                'to': to_currency,
                'converted_amount': converted_amount,
                'rate': converted_amount / amount
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
