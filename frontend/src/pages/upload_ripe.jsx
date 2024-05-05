import React, { useEffect, useState } from "react";
import "./upload_ripe.css";
import Loader from "../components/loader";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [foodName, setFoodName] = useState(null);
  const [calories, setCalories] = useState(null);
  const [totalFat, setTotalFat] = useState(null);
  const [protein, setProtein] = useState(null);
  const [carbohydrate, setCarbohydrate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filepath, setFilepath] = useState(null);
  const [color, setColor] = useState("black");

  const colors = { Raw: "#D5BB10", Rip: "#00b400", Rot: "#9a0404" };

  const appId = "aabe9e4e";
  const appKey = "c48c92f0f7124657580c39cba003ab6e";

  useEffect(() => {
    if (foodName != null) {
      setColor(colors[foodName.slice(0, 3)] ?? "#333");
      extract_nutrition_info();
    }
  }, [foodName]);

  useEffect(() => {
    setFoodName(null);
    setTotalFat(null);
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFilepath(selectedFile["name"]);
    setFile(selectedFile);

    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("pic1", file);

      const response = await fetch("http://127.0.0.1:5000/ml_model/", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (data["Food Name"] == foodName) {
          setLoading(false);
          return;
        }
        setFoodName(data["Food Name"]);
      } else {
        throw new Error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const extract_nutrition_info = async () => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": appId,
        "x-app-key": appKey,
      },
      body: JSON.stringify({
        query: foodName,
      }),
    };

    try {
      const response = await fetch(
        "https://trackapi.nutritionix.com/v2/natural/nutrients",
        options
      );
      const data = await response.json();
      const food_data = data["foods"][0];
      const weight = food_data["serving_weight_grams"];
      setCalories(((food_data["nf_calories"] / weight) * 100).toFixed(2));
      setCarbohydrate(
        ((food_data["nf_total_carbohydrate"] / weight) * 100).toFixed(2)
      );
      setProtein(((food_data["nf_protein"] / weight) * 100).toFixed(2));
      setTotalFat(((food_data["nf_total_fat"] / weight) * 100).toFixed(2));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload">
      <div className="file-upload__input-container">
        <label htmlFor="file-input" className="file-upload__label">
          Choose a file
        </label>
        <input
          id="file-input"
          type="file"
          className="file-upload__input"
          onChange={handleFileChange}
        />
      </div>
      <button
        className="file-upload__button"
        onClick={handleUpload}
        disabled={!file}
      >
        Upload
      </button>
      {filepath && !totalFat && (
        <div className="filepath">Selected File : {filepath}</div>
      )}
      {loading ? (
        <div className="compo">
          <Loader />
        </div>
      ) : (
        totalFat && (
          <div className="file-upload__preview">
            <div className="panel">
              <img className="img-input" src={previewUrl} alt="Preview" />
              <div className="fruit_name" style={{ color: color }}>
                {foodName.charAt(0).toUpperCase() + foodName.slice(1)}
              </div>
              <div className="nutrition-info">
                <p className="nutrient-box">Calories {calories} grams</p>
                <p className="nutrient-box">Total Fat {totalFat} grams</p>
                <p className="nutrient-box">Protein {protein} grams</p>
                <p className="nutrient-box">
                  Carbohydrate {carbohydrate} grams
                </p>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    marginTop: "20px",
                  }}
                ></p>
              </div>
              <span className="disc">
                Above nutrients are stated as Amount per 100 gm
              </span>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default FileUpload;
