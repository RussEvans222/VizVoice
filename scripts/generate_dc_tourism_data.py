#!/usr/bin/env python3
"""
Generate Washington DC Accessible Tourism Dataset
Story arc: 2022-2024 accessibility transformation
"""

import csv
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
import math

# Set random seed for reproducibility
random.seed(42)

# Story arc parameters
STORY_ARC = {
    2022: {
        "hotel_accessible_room_pct": 0.30,
        "restaurant_braille_menu_pct": 0.15,
        "restaurant_accessible_entrance_pct": 0.25,
        "avg_accessibility_rating": 65,
    },
    2023: {
        "hotel_accessible_room_pct": 0.50,
        "restaurant_braille_menu_pct": 0.40,
        "restaurant_accessible_entrance_pct": 0.40,
        "avg_accessibility_rating": 72,
    },
    2024: {
        "hotel_accessible_room_pct": 0.70,
        "restaurant_braille_menu_pct": 0.60,
        "restaurant_accessible_entrance_pct": 0.60,
        "avg_accessibility_rating": 77,
    },
}

# Real DC venues with actual coordinates

# Restaurants (40 venues)
RESTAURANTS = [
    {"id": "REST_FOUNDING_FARMERS", "name": "Founding Farmers", "lat": 38.9017, "lon": -77.0405, "neighborhood": "Foggy Bottom", "ward": "2", "zip": "20037", "cuisine": "American", "price": "$$"},
    {"id": "REST_BUSBOYS_POETS", "name": "Busboys and Poets", "lat": 38.9170, "lon": -77.0368, "neighborhood": "U Street", "ward": "1", "zip": "20009", "cuisine": "American", "price": "$$"},
    {"id": "REST_OLD_EBBITT", "name": "Old Ebbitt Grill", "lat": 38.8977, "lon": -77.0387, "neighborhood": "Downtown", "ward": "2", "zip": "20004", "cuisine": "American", "price": "$$$"},
    {"id": "REST_BENS_NEXT_DOOR", "name": "Ben's Next Door", "lat": 38.9170, "lon": -77.0368, "neighborhood": "U Street", "ward": "1", "zip": "20009", "cuisine": "Ethiopian", "price": "$$"},
    {"id": "REST_DUKEM", "name": "Dukem", "lat": 38.9160, "lon": -77.0370, "neighborhood": "U Street", "ward": "1", "zip": "20009", "cuisine": "Ethiopian", "price": "$$"},
    {"id": "REST_PHO14", "name": "Pho 14", "lat": 38.9030, "lon": -77.0285, "neighborhood": "Penn Quarter", "ward": "2", "zip": "20004", "cuisine": "Vietnamese", "price": "$"},
    {"id": "REST_MAYDAN", "name": "Maydan", "lat": 38.9180, "lon": -77.0450, "neighborhood": "14th Street", "ward": "1", "zip": "20009", "cuisine": "Lebanese", "price": "$$$"},
    {"id": "REST_MINIBAR", "name": "Minibar", "lat": 38.9015, "lon": -77.0247, "neighborhood": "Penn Quarter", "ward": "2", "zip": "20001", "cuisine": "Fine_Dining", "price": "$$$$"},
]

HOTELS = [
    {"id": "HOTEL_WATERGATE", "name": "The Watergate Hotel", "lat": 38.8973, "lon": -77.0566, "neighborhood": "Foggy Bottom", "ward": "2", "zip": "20037", "price_base": 350, "category": "Luxury"},
    {"id": "HOTEL_ZENA", "name": "Hotel Zena", "lat": 38.9073, "lon": -77.0332, "neighborhood": "Thomas Circle", "ward": "2", "zip": "20005", "price_base": 280, "category": "Boutique"},
    {"id": "HOTEL_GRAND_HYATT", "name": "Grand Hyatt Washington", "lat": 38.8977, "lon": -77.0297, "neighborhood": "Penn Quarter", "ward": "2", "zip": "20004", "price_base": 320, "category": "Convention"},
    {"id": "HOTEL_HAY_ADAMS", "name": "The Hay-Adams", "lat": 38.9005, "lon": -77.0369, "neighborhood": "Lafayette Square", "ward": "2", "zip": "20006", "price_base": 450, "category": "Historic_Luxury"},
    {"id": "HOTEL_MONACO", "name": "Kimpton Hotel Monaco", "lat": 38.8979, "lon": -77.0283, "neighborhood": "Penn Quarter", "ward": "2", "zip": "20004", "price_base": 300, "category": "Boutique"},
    {"id": "HOTEL_EMBASSY_DUPONT", "name": "Embassy Suites Dupont Circle", "lat": 38.9101, "lon": -77.0434, "neighborhood": "Dupont Circle", "ward": "2", "zip": "20036", "price_base": 200, "category": "Business"},
    {"id": "HOTEL_LINE_DC", "name": "The Line DC", "lat": 38.9201, "lon": -77.0400, "neighborhood": "Adams Morgan", "ward": "1", "zip": "20009", "price_base": 240, "category": "Trendy"},
    {"id": "HOTEL_CANOPY_WHARF", "name": "Canopy by Hilton", "lat": 38.8795, "lon": -77.0191, "neighborhood": "The Wharf", "ward": "6", "zip": "20024", "price_base": 260, "category": "Modern"},
    {"id": "HOTEL_PHOENIX_PARK", "name": "Phoenix Park Hotel", "lat": 38.8975, "lon": -77.0077, "neighborhood": "Capitol Hill", "ward": "6", "zip": "20002", "price_base": 220, "category": "Historic"},
    {"id": "HOTEL_WASH_PLAZA", "name": "Washington Plaza Hotel", "lat": 38.9066, "lon": -77.0343, "neighborhood": "Thomas Circle", "ward": "2", "zip": "20005", "price_base": 180, "category": "Mid_Range"},
]

# Seasonal pricing multipliers
def get_seasonal_multiplier(date: datetime) -> float:
    """Calculate pricing multiplier based on date"""
    month = date.month
    day = date.day

    # Cherry Blossom season (late March - early April)
    if (month == 3 and day >= 25) or (month == 4 and day <= 10):
        return 1.40

    # July 4th week
    if month == 7 and 1 <= day <= 7:
        return 1.50

    # Summer tourist season (May-August)
    if 5 <= month <= 8:
        return 1.25

    # Winter off-peak (January-February)
    if month in [1, 2]:
        return 0.80

    # Federal holidays (approximate)
    if (month == 1 and day == 15) or (month == 2 and day == 19) or \
       (month == 5 and day == 27) or (month == 9 and day == 2) or \
       (month == 11 and 22 <= day <= 24) or (month == 12 and 24 <= day <= 26):
        return 1.20

    return 1.0

def get_metro_distance() -> float:
    """Generate realistic distance to Metro (most venues close to Metro in DC)"""
    # 70% within 0.5 miles, 20% within 1 mile, 10% farther
    rand = random.random()
    if rand < 0.70:
        return round(random.uniform(0.1, 0.5), 2)
    elif rand < 0.90:
        return round(random.uniform(0.5, 1.0), 2)
    else:
        return round(random.uniform(1.0, 2.0), 2)

def get_accessibility_rating_for_year(base_rating: int, year: int, venue_category: str) -> int:
    """Calculate accessibility rating based on story arc"""
    # Smithsonian museums always high
    if "Smithsonian" in venue_category:
        return random.randint(95, 100)

    # Apply year-based progression
    if year == 2022:
        return max(50, min(100, base_rating + random.randint(-5, 5)))
    elif year == 2023:
        improvement = random.randint(5, 15)
        return max(50, min(100, base_rating + improvement))
    else:  # 2024
        improvement = random.randint(10, 25)
        return max(50, min(100, base_rating + improvement))

def generate_hotel_timeseries(hotel: Dict[str, Any], start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
    """Generate daily hotel records for 3 years"""
    records = []
    current_date = start_date

    # Base accessibility features (improve over time)
    base_accessibility = {
        2022: random.randint(60, 75),
        2023: 0,  # Will calculate
        2024: 0,
    }
    base_accessibility[2023] = base_accessibility[2022] + random.randint(5, 15)
    base_accessibility[2024] = base_accessibility[2023] + random.randint(5, 15)

    # Feature adoption dates
    braille_added = None
    if random.random() < 0.4:  # 40% add braille in 2023
        braille_added = datetime(2023, random.randint(3, 9), random.randint(1, 28))

    tactile_added = None
    if random.random() < 0.3:  # 30% add tactile features in 2023-2024
        tactile_added = datetime(random.randint(2023, 2024), random.randint(1, 12), random.randint(1, 28))

    while current_date <= end_date:
        year = current_date.year

        # Daily rate with seasonal variation
        base_price = hotel["price_base"]
        seasonal_mult = get_seasonal_multiplier(current_date)
        daily_rate = round(base_price * seasonal_mult)

        # Occupancy rate (higher in peak season)
        base_occupancy = 0.75
        occupancy_rate = round(min(100, base_occupancy * seasonal_mult * 100 + random.uniform(-10, 10)), 1)

        # Accessible room availability (decreases in peak season, improves over years)
        year_availability_base = STORY_ARC[year]["hotel_accessible_room_pct"]
        if seasonal_mult > 1.3:
            accessible_room_avail = random.random() < (year_availability_base * 0.5)
        else:
            accessible_room_avail = random.random() < year_availability_base

        # Accessibility rating for this year
        accessibility_rating = get_accessibility_rating_for_year(base_accessibility[year], year, hotel["category"])

        # Features based on story arc
        has_braille = braille_added is not None and current_date >= braille_added
        has_tactile = tactile_added is not None and current_date >= tactile_added

        record = {
            "Record_ID": f"{hotel['id']}_{current_date.strftime('%Y-%m-%d')}",
            "Venue_ID": hotel["id"],
            "Venue_Name": hotel["name"],
            "Venue_Category": "Hotel",
            "Subcategory": hotel["category"],
            "Latitude": hotel["lat"],
            "Longitude": hotel["lon"],
            "Street_Address": "",  # Would need real addresses
            "Neighborhood": hotel["neighborhood"],
            "Ward": hotel["ward"],
            "Zip_Code": hotel["zip"],
            "Distance_to_Metro": get_metro_distance(),
            "Nearest_Metro_Station": "Metro_Center",  # Simplified
            "Metro_Line": "Red",
            "Date": current_date.strftime("%Y-%m-%d"),
            "Day_of_Week": current_date.strftime("%A"),
            "Month": current_date.strftime("%B"),
            "Year": year,
            "Is_Weekend": current_date.weekday() >= 5,
            "Is_Holiday": seasonal_mult > 1.15,
            "Season": get_season(current_date.month),
            "Tourist_Season": "High" if seasonal_mult > 1.3 else ("Low" if seasonal_mult < 0.9 else "Medium"),
            # Accessibility features
            "Has_Braille_Signage": has_braille,
            "Has_Large_Print_Materials": has_braille,  # Paired with braille
            "Has_Audio_Tour": False,  # N/A for hotels
            "Has_Tactile_Maps": has_tactile,
            "Guide_Dog_Friendly": True,
            "Wheelchair_Accessible_Entrance": True,
            "Has_Elevator": True,
            "Wheelchair_Accessible_Restrooms": True,
            # Hotel-specific metrics
            "Daily_Rate": daily_rate,
            "Occupancy_Rate": occupancy_rate,
            "Accessibility_Room_Available": accessible_room_avail,
            # Common metrics
            "Accessibility_Rating": accessibility_rating,
            "Overall_Rating": round(3.5 + (accessibility_rating / 100) * 1.5, 1),  # Correlate with accessibility
            "Last_Verified_Date": current_date.strftime("%Y-%m-%d") if current_date.day == 1 else "",
            "Verified_By": "Staff_Report" if current_date.day == 1 else "",
        }

        records.append(record)
        current_date += timedelta(days=1)

    return records

def get_season(month: int) -> str:
    if month in [12, 1, 2]:
        return "Winter"
    elif month in [3, 4, 5]:
        return "Spring"
    elif month in [6, 7, 8]:
        return "Summer"
    else:
        return "Fall"

def generate_restaurant_weekly_snapshots(restaurant: Dict[str, Any], start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
    """Generate weekly restaurant records for 3 years"""
    records = []
    current_date = start_date

    # Base accessibility features (improve over time)
    base_accessibility = {
        2022: random.randint(50, 70),
        2023: 0,
        2024: 0,
    }
    base_accessibility[2023] = base_accessibility[2022] + random.randint(5, 15)
    base_accessibility[2024] = base_accessibility[2023] + random.randint(5, 12)

    # Feature adoption (restaurants slower than hotels)
    has_braille_2022 = random.random() < STORY_ARC[2022]["restaurant_braille_menu_pct"]
    has_braille_2023 = has_braille_2022 or random.random() < 0.25  # 25% add in 2023
    has_braille_2024 = has_braille_2023 or random.random() < 0.20  # 20% more add in 2024

    has_accessible_entrance_2022 = random.random() < STORY_ARC[2022]["restaurant_accessible_entrance_pct"]
    has_accessible_entrance_2023 = has_accessible_entrance_2022 or random.random() < 0.15
    has_accessible_entrance_2024 = has_accessible_entrance_2023 or random.random() < 0.20

    # Weekly snapshots (sample one day per week)
    while current_date <= end_date:
        year = current_date.year

        # Determine features based on year
        has_braille = (year == 2022 and has_braille_2022) or \
                      (year == 2023 and has_braille_2023) or \
                      (year == 2024 and has_braille_2024)

        has_entrance = (year == 2022 and has_accessible_entrance_2022) or \
                       (year == 2023 and has_accessible_entrance_2023) or \
                       (year == 2024 and has_accessible_entrance_2024)

        # Wait time varies by day of week (higher on weekends)
        is_weekend = current_date.weekday() >= 5
        base_wait = 25 if is_weekend else 15
        avg_wait_time = base_wait + random.randint(-5, 10)

        # Noise level higher on weekends
        noise_level = random.randint(3, 5) if is_weekend else random.randint(1, 3)

        accessibility_rating = get_accessibility_rating_for_year(base_accessibility[year], year, "Restaurant")

        record = {
            "Record_ID": f"{restaurant['id']}_{current_date.strftime('%Y-%m-%d')}",
            "Venue_ID": restaurant["id"],
            "Venue_Name": restaurant["name"],
            "Venue_Category": "Restaurant",
            "Subcategory": restaurant["cuisine"],
            "Latitude": restaurant["lat"],
            "Longitude": restaurant["lon"],
            "Street_Address": "",
            "Neighborhood": restaurant["neighborhood"],
            "Ward": restaurant["ward"],
            "Zip_Code": restaurant["zip"],
            "Distance_to_Metro": get_metro_distance(),
            "Nearest_Metro_Station": "Metro_Center",
            "Metro_Line": "Red",
            "Date": current_date.strftime("%Y-%m-%d"),
            "Day_of_Week": current_date.strftime("%A"),
            "Month": current_date.strftime("%B"),
            "Year": year,
            "Is_Weekend": is_weekend,
            "Is_Holiday": False,
            "Season": get_season(current_date.month),
            "Tourist_Season": "High" if 5 <= current_date.month <= 8 else "Low",
            # Accessibility features
            "Has_Braille_Signage": has_braille,
            "Has_Large_Print_Materials": has_braille,  # Often paired
            "Has_Audio_Tour": False,
            "Has_Tactile_Maps": False,
            "Guide_Dog_Friendly": True,
            "Wheelchair_Accessible_Entrance": has_entrance,
            "Has_Elevator": False,
            "Wheelchair_Accessible_Restrooms": has_entrance,  # Correlate with entrance
            # Restaurant-specific metrics
            "Average_Wait_Time": avg_wait_time,
            "Reservations_Available": random.random() < 0.7,
            "Noise_Level_Rating": noise_level,
            "Price_Range": restaurant["price"],
            # Common metrics
            "Accessibility_Rating": accessibility_rating,
            "Overall_Rating": round(3.0 + (accessibility_rating / 100) * 2.0, 1),
            "Last_Verified_Date": current_date.strftime("%Y-%m-%d") if current_date.day == 1 else "",
            "Verified_By": "User_Review" if current_date.day == 1 else "",
        }

        records.append(record)
        current_date += timedelta(days=7)  # Weekly snapshots

    return records

def main():
    """Generate all dataset files"""
    print("Generating Washington DC Accessible Tourism Dataset...")
    print("Story arc: 2022-2024 accessibility transformation\n")
    print("Structure: TWO separate tables, ONE semantic model (relational)")
    print("  1. Hotels table (daily time-series)")
    print("  2. Restaurants table (weekly time-series)")
    print("  Both share common dimensions for joins on Venue_ID\n")

    start_date = datetime(2022, 1, 1)
    end_date = datetime(2024, 12, 31)

    # ===== HOTELS TABLE =====
    hotel_records = []
    print("Generating hotel time-series data...")
    for i, hotel in enumerate(HOTELS, 1):
        print(f"  {i}/{len(HOTELS)}: {hotel['name']}")
        records = generate_hotel_timeseries(hotel, start_date, end_date)
        hotel_records.extend(records)

    print(f"  ✓ {len(hotel_records)} hotel records (daily)\n")

    # ===== RESTAURANTS TABLE =====
    restaurant_records = []
    print("Generating restaurant weekly snapshots...")
    for i, restaurant in enumerate(RESTAURANTS, 1):
        print(f"  {i}/{len(RESTAURANTS)}: {restaurant['name']}")
        records = generate_restaurant_weekly_snapshots(restaurant, start_date, end_date)
        restaurant_records.extend(records)

    print(f"  ✓ {len(restaurant_records)} restaurant records (weekly)\n")

    # Write HOTELS CSV
    hotels_output = "dc_tourism_hotels_timeseries.csv"
    if hotel_records:
        with open(hotels_output, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=hotel_records[0].keys())
            writer.writeheader()
            writer.writerows(hotel_records)
        print(f"✅ Hotels table: {len(hotel_records)} records")
        print(f"   Saved to: {hotels_output}")

    # Write RESTAURANTS CSV
    restaurants_output = "dc_tourism_restaurants_timeseries.csv"
    if restaurant_records:
        with open(restaurants_output, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=restaurant_records[0].keys())
            writer.writeheader()
            writer.writerows(restaurant_records)
        print(f"✅ Restaurants table: {len(restaurant_records)} records")
        print(f"   Saved to: {restaurants_output}")

    print(f"\n✅ Total records: {len(hotel_records) + len(restaurant_records)}")
    print("\n🎉 Dataset generation complete!")
    print(f"\nNext steps:")
    print(f"1. Upload {hotels_output} to Data Cloud → DMO: DC_Tourism_Hotels__dlm")
    print(f"2. Upload {restaurants_output} to Data Cloud → DMO: DC_Tourism_Restaurants__dlm")
    print(f"3. Create semantic model 'DC_Tourism_TimeSeries__dlm' with BOTH DMOs as sources")
    print(f"4. Define relationship: JOIN on Venue_ID")
    print(f"5. (Phase 2) Add Museums table, Parks table for expansion")

if __name__ == "__main__":
    main()
