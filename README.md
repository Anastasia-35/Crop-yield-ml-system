# 🌱 Crop Yield Prediction System

A full-stack Machine Learning web application that predicts agricultural crop yield (tons per hectare) based on environmental and farming inputs.

This project demonstrates an end-to-end ML pipeline — from data cleaning and model training to deployment with Flask, database integration, and interactive dashboard visualization.

---

## 📌 Project Overview

The Crop Yield Prediction System estimates crop yield using:

- Rainfall (mm)
- Temperature (°C)
- Days to harvest
- Fertilizer usage (kg)
- Irrigation usage (mm)
- Region (North, South, West)
- Soil type
- Crop type (Maize, Wheat, Cotton, Soybeans, Rice)
- Weather condition (Sunny, Rainy)

Users submit inputs via a web form, and the application generates a real-time yield prediction using a trained regression model.

All predictions are stored in a SQLite database for historical tracking and dashboard visualization.

---

## 🧠 Machine Learning Pipeline

The ML workflow includes:

1. Data loading  
2. Data cleaning and preprocessing  
3. Exploratory Data Analysis (EDA)  
4. Feature engineering  
5. Manual one-hot encoding  
6. Train-test split  
7. Model training (Scikit-learn regression)  
8. Model evaluation (R², MAE, RMSE)  
9. Model serialization using Joblib  
10. Deployment with Flask  

The training and EDA process is documented in:

```
notebooks/crop_yield_eda_training.ipynb
```

The trained model is stored in:

```
model/crop_yield_model.pkl
```

---

## 🗄 Database Integration

The application uses SQLite to persist prediction history.

### Database File:
```
predictions.db
```

### Table Schema:

- id (Primary Key)
- rainfall (REAL)
- temperature (REAL)
- days_to_harvest (INTEGER)
- fertilizer_used (INTEGER)
- irrigation_used (INTEGER)
- region (TEXT)
- soil_type (TEXT)
- crop (TEXT)
- weather (TEXT)
- predicted_yield (REAL)
- created_at (TIMESTAMP)

The database is initialized using:

```
python init_db.py
```

The database file is excluded from GitHub using `.gitignore`.

---

## 🎨 Frontend & Visualization

The frontend is built using:

- HTML  
- CSS  
- JavaScript  
- Chart.js  
- Jinja2 templating  

### Features:

- Prediction form  
- Dashboard visualization  
- Animated charts  
- Crop filtering  
- Line + Bar combination charts  
- Scatter plots  
- Average yield comparison  
- Fertilizer usage distribution  
- Responsive layout  

---

## ⚙️ Tech Stack

### Backend
- Python  
- Flask  
- SQLite  
- Joblib  

### Machine Learning
- Scikit-learn  
- Pandas  
- NumPy  

### Frontend
- HTML  
- CSS  
- JavaScript  
- Chart.js  

---

## 📁 Dataset

The dataset used for training (~90MB) is not included in this repository due to size limitations.

You can download it from Kaggle:

https://www.kaggle.com/datasets/samuelotiattakorah/agriculture-crop-yield

After downloading, place the dataset inside a local `/data` folder if you wish to retrain the model.

---

## 📂 Project Structure

```
crop-yield-prediction/
│
├── app.py
├── init_db.py
├── requirements.txt
├── README.md
├── .gitignore
│
├── model/
│   └── crop_yield_model.pkl
│
├── notebooks/
│   └── Crop_Yield.ipynb
│
├── static/
│   ├── dashboard.js
│   ├── styles.css
│   └── images/
│
├── templates/
│   ├── index.html
│   └── visualize.html
│
└── data/
    └── (dataset not included – download from Kaggle)
```

Note: The trained model file is not included due to size limitations. 
You can retrain the model using the provided notebook.

---

## 🚀 Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/crop-yield-prediction.git
cd crop-yield-prediction
```

### 2️⃣ Create Virtual Environment

```bash
python -m venv venv
```

Activate:

Windows:
```bash
venv\Scripts\activate
```

Mac/Linux:
```bash
source venv/bin/activate
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Initialize Database

```bash
python init_db.py
```

### 5️⃣ Run Application

```bash
python app.py
```

Open in browser:

```
http://127.0.0.1:5000
```

---

## 📦 Requirements.txt

```
Flask
scikit-learn
pandas
numpy
joblib
```

---

## 🔌 API Example

### POST `/predict`

```json
{
  "Rainfall_mm": 120,
  "Temperature_Celsius": 28,
  "Days_to_Harvest": 110,
  "Fertilizer_Used": 200,
  "Irrigation_Used": 150,
  "Region": "North",
  "Soil_Type": "Loam",
  "Crop": "Maize",
  "Weather_Condition": "Sunny"
}
```

Response:

```json
{
  "predicted_yield": 5.43
}
```

---

## 🎯 What This Project Demonstrates

- End-to-end Machine Learning pipeline  
- Feature engineering and model deployment  
- Backend API development  
- Database integration  
- Full-stack architecture  
- Data visualization  
- Clean project structuring  
- Real-world ML system simulation  

This project demonstrates a complete ML system rather than just a trained model.

