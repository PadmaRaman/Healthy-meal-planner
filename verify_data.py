import requests
from requests.auth import HTTPBasicAuth

response = requests.get('http://localhost:8000/groceries', auth=HTTPBasicAuth('admin', 'fitmeal123'))
data = response.json()

print('✅ Fresh Data Verification')
groceries = data['groceries']
print(f'Total Categories: {len(groceries)}')
print('\nCategories with Items:')
for i, cat in enumerate(groceries.keys(), 1):
    item_count = len(groceries[cat])
    print(f'{i:2d}. {cat:30s} ({item_count} items)')
