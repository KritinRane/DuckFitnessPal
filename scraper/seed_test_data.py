"""Seed fake menu data for today so the app UI can be tested."""

import requests
from datetime import date

APP_URL = "http://localhost:3000"
SECRET  = "dev-secret"
TODAY   = str(date.today())

items = [
    # Breakfast
    {"date": TODAY, "mealPeriod": "Breakfast", "station": "Grill",
     "name": "Scrambled Eggs", "servingSize": "4 oz",
     "calories": 180, "protein": 12.0, "carbs": 2.0, "fat": 14.0},
    {"date": TODAY, "mealPeriod": "Breakfast", "station": "Grill",
     "name": "Turkey Bacon", "servingSize": "2 slices",
     "calories": 70, "protein": 8.0, "carbs": 1.0, "fat": 3.5},
    {"date": TODAY, "mealPeriod": "Breakfast", "station": "Bakery",
     "name": "Whole Wheat Toast", "servingSize": "2 slices",
     "calories": 140, "protein": 6.0, "carbs": 28.0, "fat": 2.0},
    {"date": TODAY, "mealPeriod": "Breakfast", "station": "Bakery",
     "name": "Blueberry Muffin", "servingSize": "1 muffin",
     "calories": 320, "protein": 4.0, "carbs": 52.0, "fat": 11.0},
    {"date": TODAY, "mealPeriod": "Breakfast", "station": "Cereal & Dairy",
     "name": "Greek Yogurt Parfait", "servingSize": "6 oz",
     "calories": 160, "protein": 14.0, "carbs": 22.0, "fat": 0.0},
    # Lunch
    {"date": TODAY, "mealPeriod": "Lunch", "station": "Grill",
     "name": "Grilled Chicken Breast", "servingSize": "5 oz",
     "calories": 220, "protein": 42.0, "carbs": 0.0, "fat": 5.0},
    {"date": TODAY, "mealPeriod": "Lunch", "station": "Grill",
     "name": "Cheeseburger", "servingSize": "1 burger",
     "calories": 480, "protein": 28.0, "carbs": 38.0, "fat": 22.0},
    {"date": TODAY, "mealPeriod": "Lunch", "station": "Entrees",
     "name": "Penne Pasta Marinara", "servingSize": "8 oz",
     "calories": 310, "protein": 10.0, "carbs": 58.0, "fat": 4.0},
    {"date": TODAY, "mealPeriod": "Lunch", "station": "Entrees",
     "name": "Chicken Stir Fry with Rice", "servingSize": "10 oz",
     "calories": 390, "protein": 30.0, "carbs": 48.0, "fat": 8.0},
    {"date": TODAY, "mealPeriod": "Lunch", "station": "Salad Bar",
     "name": "Caesar Salad", "servingSize": "4 oz",
     "calories": 120, "protein": 4.0, "carbs": 8.0, "fat": 9.0},
    {"date": TODAY, "mealPeriod": "Lunch", "station": "Salad Bar",
     "name": "Mixed Green Salad", "servingSize": "3 oz",
     "calories": 25, "protein": 2.0, "carbs": 4.0, "fat": 0.0},
    {"date": TODAY, "mealPeriod": "Lunch", "station": "Soup",
     "name": "Chicken Noodle Soup", "servingSize": "8 oz",
     "calories": 110, "protein": 9.0, "carbs": 12.0, "fat": 2.5},
    # Dinner
    {"date": TODAY, "mealPeriod": "Dinner", "station": "Entrees",
     "name": "Grilled Salmon", "servingSize": "6 oz",
     "calories": 280, "protein": 38.0, "carbs": 0.0, "fat": 14.0},
    {"date": TODAY, "mealPeriod": "Dinner", "station": "Entrees",
     "name": "Beef Tacos (2)", "servingSize": "2 tacos",
     "calories": 420, "protein": 24.0, "carbs": 44.0, "fat": 16.0},
    {"date": TODAY, "mealPeriod": "Dinner", "station": "Entrees",
     "name": "Vegetable Curry with Rice", "servingSize": "10 oz",
     "calories": 350, "protein": 8.0, "carbs": 62.0, "fat": 9.0},
    {"date": TODAY, "mealPeriod": "Dinner", "station": "Grill",
     "name": "New York Strip Steak", "servingSize": "6 oz",
     "calories": 380, "protein": 46.0, "carbs": 0.0, "fat": 21.0},
    {"date": TODAY, "mealPeriod": "Dinner", "station": "Sides",
     "name": "Roasted Broccoli", "servingSize": "4 oz",
     "calories": 55, "protein": 3.0, "carbs": 8.0, "fat": 2.0},
    {"date": TODAY, "mealPeriod": "Dinner", "station": "Sides",
     "name": "Mashed Potatoes", "servingSize": "6 oz",
     "calories": 180, "protein": 4.0, "carbs": 34.0, "fat": 5.0},
    {"date": TODAY, "mealPeriod": "Dinner", "station": "Dessert",
     "name": "Chocolate Chip Cookie", "servingSize": "1 cookie",
     "calories": 220, "protein": 2.0, "carbs": 30.0, "fat": 11.0},
    {"date": TODAY, "mealPeriod": "Dinner", "station": "Dessert",
     "name": "Soft Serve Ice Cream", "servingSize": "4 oz",
     "calories": 140, "protein": 3.0, "carbs": 22.0, "fat": 4.5},
]

resp = requests.post(
    f"{APP_URL}/api/menu/sync",
    json={"items": items, "secret": SECRET},
    headers={"Content-Type": "application/json"},
    timeout=15,
)
print(f"Status: {resp.status_code}")
print(resp.json())
