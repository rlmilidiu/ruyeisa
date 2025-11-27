import sys
import json
import os

# Add the functions directory to the path
sys.path.append('./netlify/functions')

# Mock context
class Context:
    pass

def test_loan():
    from loan import handler
    event = {
        'httpMethod': 'POST',
        'body': json.dumps({'principal': 200000, 'rate': 5, 'years': 30})
    }
    response = handler(event, Context())
    body = json.loads(response['body'])
    print(f"Loan Test: {body}")
    assert response['statusCode'] == 200
    assert 'monthly_payment' in body

def test_interest():
    from interest import handler
    event = {
        'httpMethod': 'POST',
        'body': json.dumps({'principal': 10000, 'rate': 5, 'time': 5, 'type': 'simple'})
    }
    response = handler(event, Context())
    body = json.loads(response['body'])
    print(f"Interest Test (Simple): {body}")
    assert response['statusCode'] == 200
    assert body['total_amount'] == 12500.0

def test_currency():
    from currency import handler
    event = {
        'httpMethod': 'POST',
        'body': json.dumps({'amount': 100, 'from': 'USD', 'to': 'EUR'})
    }
    # Note: This makes a real network call
    response = handler(event, Context())
    body = json.loads(response['body'])
    print(f"Currency Test: {body}")
    assert response['statusCode'] == 200
    assert 'converted_amount' in body

if __name__ == "__main__":
    try:
        test_loan()
        test_interest()
        print("Logic tests passed!")
        # test_currency() # Optional: skip to avoid network dependency in test if needed, but good to check
    except ImportError as e:
        print(f"Import Error: {e}")
    except Exception as e:
        print(f"Test Failed: {e}")
