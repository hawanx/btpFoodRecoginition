from flask import Flask, request, jsonify
import numpy as np
from PIL import Image
from app_settings import fruits_and_vegetables, fruit_condition
from flask_cors import CORS
import keras
from io import BytesIO


app = Flask(__name__)
CORS(app)

# Load the Keras model
model_name = keras.models.load_model(r'C:\Users\samra\Desktop\BTP\backend\re.h5')
model_cond = keras.models.load_model(r"C:\Users\samra\Desktop\BTP\backend\rp.h5")


def predict_food_name(image):
    image_bytes = image.read()
    image_stream = BytesIO(image_bytes)
    image = keras.preprocessing.image.load_img(image_stream, target_size=(64, 64))
    input_arr = keras.preprocessing.image.img_to_array(image)
    input_arr = np.array([input_arr])
    predictions = model_name.predict(input_arr)
    index = np.argmax(predictions)
    return fruits_and_vegetables[index]


def predict_food_condition(image):
    image.save(image.filename)
    img = keras.preprocessing.image.load_img(image.filename, target_size=(224, 224))
    x = keras.preprocessing.image.img_to_array(img)
    x = x / 255
    x = np.expand_dims(x, axis=0)
    prediction = model_cond.predict(x)
    index = np.argmax(prediction)
    return fruit_condition[index]


# Define route for making predictions
@app.route('/ml_model/', methods=['POST'])
def predict():
    # Get data from request
    image = request.files['pic1']
    food_name = predict_food_name(image).lower()
    if food_name == "apple" or food_name == "banana" or food_name == "orange":
        food_name = predict_food_condition(image)

    return jsonify({"Food Name": food_name})