import sqlite3

conn = sqlite3.connect("predictions.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rainfall REAL,
    temperature REAL,
    days_to_harvest INTEGER,
    fertilizer_used INTEGER,
    irrigation_used INTEGER,
    region TEXT,
    soil_type TEXT,
    crop TEXT,
    weather TEXT,
    predicted_yield REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()
conn.close()

print(" Database initialized")
