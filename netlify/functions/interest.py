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
        rate = float(body.get('rate', 0))
        time = float(body.get('time', 0))
        type = body.get('type', 'simple') # simple or compound
        frequency = int(body.get('frequency', 1)) # times per year for compound

        if principal <= 0 or time <= 0:
             return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Principal and time must be greater than 0'})
            }

        r = rate / 100

        if type == 'simple':
            interest = principal * r * time
            total = principal + interest
        else:
            # Compound Interest: A = P(1 + r/n)^(nt)
            total = principal * (1 + r/frequency) ** (frequency * time)
            interest = total - principal

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'interest_earned': round(interest, 2),
                'total_amount': round(total, 2)
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
