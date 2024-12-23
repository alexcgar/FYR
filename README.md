# Project: Automated Prediction System

## Overview
This project is a Flask-based backend application designed to automatically fetch, process, and provide product predictions. The system is particularly useful for scenarios involving large datasets, real-time updates, and periodic data processing. The application supports periodic updates to ensure fresh data is always available for the client-side interface.

## Features
- **Automated Prediction Fetching**: Fetches and processes predictions periodically (every 3 minutes).
- **Machine Learning Integration**: Utilizes a trained model to predict product codes based on descriptions.
- **Data Storage**: Caches predictions in memory for quick retrieval.
- **API Endpoints**:
  - `/api/predicciones` - Retrieves the latest predictions.
  - `/api/send-seleccion` - Accepts and processes user selections.
  - `/api/buscar` - Searches products in the CSV database.
  - `/api/getAudio` - Downloads audio files related to predictions.
- **Text Normalization**: Pre-processes input text for consistent predictions.
- **Thread-Safe Operations**: Ensures cache updates and retrievals are safe in multi-threaded environments.

## How It Works
1. **Data Loading**: Initializes a machine learning model and vectorizer from stored files.
2. **Periodic Updates**: A background thread fetches product data and updates the cache every 3 minutes.
3. **Prediction Logic**: Uses the TF-IDF vectorizer and a trained SGDClassifier to predict product codes based on processed text descriptions.
4. **API Services**: Provides endpoints for predictions, user selections, and data searching.
5. **Text and Image Processing**: Normalizes descriptions and processes image data for base64 encoding.

## Technologies Used
- **Python**
  - Flask
  - Pandas
  - Scikit-learn
  - TheFuzz (for fuzzy matching)
- **Machine Learning**
  - TF-IDF Vectorization
  - Stochastic Gradient Descent Classifier
- **Utilities**
  - `pickle` for model serialization
  - `threading` for background tasks

## Getting Started
### Prerequisites
- Python 3.7+
- Required Libraries:
  - `flask`
  - `flask-cors`
  - `pandas`
  - `scikit-learn`
  - `thefuzz`

### Installation
1. Clone the repository.
   ```bash
   git clone https://github.com/your-repo/automated-prediction-system.git
   cd automated-prediction-system
   ```
2. Install the dependencies.
   ```bash
   pip install -r requirements.txt
   ```
3. Prepare necessary files:
   - Model file: `backend/model/modelo_actualizado.pkl`
   - CSV file: `backend/model/consulta_resultado.csv`
   - Confirmed descriptions: `backend/model/descripciones_confirmadas.pkl`

### Running the Application
1. Start the Flask application.
   ```bash
   python app.py
   ```
2. The server will be available at `http://127.0.0.1:5000`.

### Usage
- Access the predictions at `/api/predicciones`.
- Use `/api/send-seleccion` to send and update selections.
- Perform searches using `/api/buscar`.
- Download related audio files using `/api/getAudio`.

## Future Improvements
- Implement a frontend for better user interaction.
- Enhance model training with additional data.
- Introduce user authentication and role management.

---

Feel free to contribute to the project by submitting issues or pull requests!
