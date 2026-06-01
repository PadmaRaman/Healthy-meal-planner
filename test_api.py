#!/usr/bin/env python3
"""Test script for FitmealSouth API endpoints"""

import requests
import json
import sys
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:8000"
USERNAME = "admin"
PASSWORD = "fitmeal123"
AUTH = HTTPBasicAuth(USERNAME, PASSWORD)

def test_meals_endpoint():
    """Test GET /meals"""
    print("\n=== Test 1: GET /meals ===")
    try:
        response = requests.get(f"{BASE_URL}/meals", auth=AUTH)
        if response.status_code == 200:
            print("✅ /meals endpoint working")
            data = response.json()
            has_snack = "snack" in data.get("meals", {})
            print(f"✓ Has snack data: {has_snack}")
            snack_main = len(data["meals"].get("snack", {}).get("main", []))
            snack_side = len(data["meals"].get("snack", {}).get("sidedish", []))
            print(f"✓ Snack items - main: {snack_main}, sidedish: {snack_side}")
            return True
        else:
            print(f"❌ /meals endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_groceries_endpoint():
    """Test GET /groceries"""
    print("\n=== Test 2: GET /groceries ===")
    try:
        response = requests.get(f"{BASE_URL}/groceries", auth=AUTH)
        if response.status_code == 200:
            print("✅ /groceries endpoint working")
            data = response.json()
            categories = list(data.get("groceries", {}).keys())
            print(f"✓ Grocery categories: {', '.join(categories)}")
            return True
        else:
            print(f"❌ /groceries endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_generate_meal_plan():
    """Test POST /generate-meal-plan"""
    print("\n=== Test 3: POST /generate-meal-plan ===")
    try:
        payload = {
            "breakfast": True,
            "lunch": True,
            "dinner": True,
            "snack": True
        }
        response = requests.post(
            f"{BASE_URL}/generate-meal-plan",
            json=payload,
            auth=AUTH
        )
        if response.status_code == 200:
            print("✅ /generate-meal-plan endpoint working")
            data = response.json()
            week_plan = data.get("weekly_plan", [])
            print(f"✓ Generated meals for {len(week_plan)} days")
            if week_plan:
                day1 = week_plan[0]
                print(f"✓ First day: {day1.get('day')} ({day1.get('date')})")
                if "snack" in day1:
                    print(f"✓ Snack included: {day1['snack']}")
            return True
        else:
            print(f"❌ /generate-meal-plan endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_update_meals():
    """Test POST /update-meals"""
    print("\n=== Test 4: POST /update-meals ===")
    try:
        payload = {
            "breakfast_main": ["Idli", "Dosa"],
            "breakfast_sidedish": ["Sambar"],
            "lunch_monday_main": ["Rice"],
            "lunch_tuesday_main": ["Rice"],
            "lunch_wednesday_main": ["Rice"],
            "lunch_thursday_main": ["Rice"],
            "lunch_friday_main": ["Rice"],
            "lunch_saturday_main": ["Rice"],
            "lunch_sunday_main": ["Rice"],
            "lunch_second_main": ["Appalam"],
            "lunch_poriyal": ["Poriyal"],
            "dinner_main": ["Chapati"],
            "dinner_sidedish": ["Kurma"],
            "snack_main": ["Murukku"],
            "snack_sidedish": ["Chutney"],
        }
        response = requests.post(
            f"{BASE_URL}/update-meals",
            json=payload,
            auth=AUTH
        )
        if response.status_code == 200:
            print("✅ /update-meals endpoint working")
            data = response.json()
            print(f"✓ Message: {data.get('message')}")
            return True
        else:
            print(f"❌ /update-meals endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 50)
    print("FitmealSouth API Test Suite")
    print("=" * 50)
    
    results = []
    results.append(("GET /meals", test_meals_endpoint()))
    results.append(("GET /groceries", test_groceries_endpoint()))
    results.append(("POST /update-meals", test_update_meals()))
    results.append(("POST /generate-meal-plan", test_generate_meal_plan()))
    
    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! API is working correctly.")
        sys.exit(0)
    else:
        print(f"\n⚠️ {total - passed} test(s) failed. Check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
