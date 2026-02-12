from flask import Flask, request, render_template, jsonify
import joblib
import pandas as pd
import sqlite3

app = Flask(__name__)

# --------------------
# DATABASE CONNECTION
# --------------------
def get_db_connection():
    conn = sqlite3.connect("predictions.db")
    conn.row_factory = sqlite3.Row
    return conn

# --------------------
# MODEL
# --------------------
model = joblib.load("crop_yield_model.pkl")

FEATURES = [
    'Rainfall_mm', 'Temperature_Celsius', 'Fertilizer_Used',
    'Irrigation_Used', 'Days_to_Harvest',
    'Region_North', 'Region_South', 'Region_West',
    'Soil_Type_Clay', 'Soil_Type_Loam', 'Soil_Type_Peaty',
    'Soil_Type_Sandy', 'Soil_Type_Silt',
    'Crop_Cotton', 'Crop_Maize', 'Crop_Rice',
    'Crop_Soybean', 'Crop_Wheat',
    'Weather_Condition_Rainy', 'Weather_Condition_Sunny'
]

REGIONS = ["North", "South", "West"]
SOILS = ["Clay", "Loam", "Peaty", "Sandy", "Silt"]
CROPS = ["Cotton", "Maize", "Rice", "Soybean", "Wheat"]
WEATHER = ["Rainy", "Sunny"]

# --------------------
# YIELD INTERPRETATION
# --------------------
def interpret_yield(yield_value):
    if yield_value < 2:
        return {
            "level": "Low Yield 🌱",
            "message": "Below average yield. Conditions may not be optimal.",
            "tip": "Increase irrigation, improve soil nutrients, or review weather impact."
        }
    elif yield_value < 4:
        return {
            "level": "Average Yield 🌿",
            "message": "Normal productivity for current conditions.",
            "tip": "Small optimizations in fertilizer or irrigation could improve output."
        }
    else:
        return {
            "level": "High Yield 🌾",
            "message": "Strong prediction. Conditions look favorable.",
            "tip": "Maintain current farming strategy and monitor weather stability."
        }

# --------------------
# HOME PAGE
# --------------------
@app.route("/")
def home():
    conn = get_db_connection()
    rows = conn.execute("""
        SELECT crop, rainfall, temperature, days_to_harvest,
               fertilizer_used, irrigation_used, predicted_yield
        FROM predictions
        ORDER BY created_at DESC
    """).fetchall()
    conn.close()

    prediction_history = [dict(row) for row in rows]

    return render_template("index.html", prediction_history=prediction_history)

# --------------------
# PREDICTION FROM FORM
# --------------------
@app.route("/predict_form", methods=["POST"])
def predict_form():
    try:
        form = request.form

        # Get values from form
        rainfall = float(form["Rainfall_mm"])
        temperature = float(form["Temperature_Celsius"])
        days = int(form["Days_to_Harvest"])
        fertilizer = int(form["Fertilizer_Used"])
        irrigation = int(form["Irrigation_Used"])
        crop = form["Crop"]
        region = form["Region"]
        soil = form["Soil"]
        weather = form["Weather"]

        # One-hot encoding
        region_features = {f"Region_{r}": 0 for r in REGIONS}
        soil_features = {f"Soil_Type_{s}": 0 for s in SOILS}
        crop_features = {f"Crop_{c}": 0 for c in CROPS}
        weather_features = {f"Weather_Condition_{w}": 0 for w in WEATHER}

        region_features[f"Region_{region}"] = 1
        soil_features[f"Soil_Type_{soil}"] = 1
        crop_features[f"Crop_{crop}"] = 1
        weather_features[f"Weather_Condition_{weather}"] = 1

        input_data = {
            "Rainfall_mm": rainfall,
            "Temperature_Celsius": temperature,
            "Days_to_Harvest": days,
            "Fertilizer_Used": fertilizer,
            "Irrigation_Used": irrigation,
            **region_features,
            **soil_features,
            **crop_features,
            **weather_features
        }

        df = pd.DataFrame([input_data], columns=FEATURES)
        prediction = round(model.predict(df)[0], 2)
        yield_info = interpret_yield(prediction)

        # Save to DB
        conn = get_db_connection()
        conn.execute("""
            INSERT INTO predictions (
                rainfall, temperature, days_to_harvest,
                fertilizer_used, irrigation_used,
                region, soil_type, crop, weather,
                predicted_yield
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            rainfall, temperature, days,
            fertilizer, irrigation,
            region, soil, crop, weather,
            prediction
        ))
        conn.commit()

        # Fetch updated history
        rows = conn.execute("""
            SELECT crop, rainfall, temperature, days_to_harvest,
                   fertilizer_used, irrigation_used, predicted_yield
            FROM predictions
            ORDER BY created_at DESC
        """).fetchall()
        conn.close()
        prediction_history = [dict(row) for row in rows]

        return render_template(
            "index.html",
            prediction=prediction,
            yield_info=yield_info,
            prediction_history=prediction_history
        )

    except Exception as e:
        # Include history even on error
        conn = get_db_connection()
        rows = conn.execute("SELECT * FROM predictions ORDER BY created_at DESC").fetchall()
        conn.close()
        prediction_history = [dict(r) for r in rows]
        return render_template("index.html", error=str(e), prediction_history=prediction_history)

# --------------------
# API: HISTORY
# --------------------
@app.route("/history")
def history():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM predictions").fetchall()
    conn.close()
    history = [dict(row) for row in rows]
    return jsonify({"total_predictions": len(history), "history": history})

# --------------------
# VISUALIZATION PAGE
# --------------------
@app.route("/visualize")
def visualize():
    conn = get_db_connection()
    rows = conn.execute("""
        SELECT crop, rainfall, temperature, days_to_harvest,
               fertilizer_used, irrigation_used, predicted_yield
        FROM predictions
        ORDER BY created_at DESC
    """).fetchall()
    conn.close()

    prediction_history = [dict(row) for row in rows]

    # Add yield info to latest
    if prediction_history:
        latest = prediction_history[0]
        y_info = interpret_yield(latest['predicted_yield'])
        latest.update({
            "yield_level": y_info['level'],
            "yield_message": y_info['message'],
            "yield_tip": y_info['tip']
        })

    return render_template("visualize.html", prediction_history=prediction_history)

# --------------------
# RUN APP
# --------------------
if __name__ == "__main__":
    app.run(debug=True)
