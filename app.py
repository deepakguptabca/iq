from flask import Flask, render_template, request, jsonify
import os
import dotenv
import cloudinary
import cloudinary.uploader
from pdf2image import convert_from_bytes
import io
import requests
from gradio_client import Client, handle_file
from flask_cors import CORS



# loaded env variables
dotenv.load_dotenv()

# flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


# Gradio model
client = Client("CohereLabs/command-a-vision")
uploaded_urls = []

GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)  # Replace with your key from aistudio.google.com
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET"),
)


# ─────────────────────────────────────────────
# Helper: Call Gemini 2.5 Pro API
# ─────────────────────────────────────────────
def call_gemini(prompt):
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY not found")

    url = GEMINI_API_URL

    headers = {"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY}

    payload = {"contents": [{"role": "user", "parts": [{"text": prompt}]}]}

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        print("Full Error:", response.text)
        response.raise_for_status()

    result = response.json()
    return result

# ─────────────────────────────────────────────
# Route: /cv pre interview
# ─────────────────────────────────────────────
@app.route("/cv", methods=["POST"])
def cv():
    file = request.files.get("file")
    role = request.form.get("role_id")          # 👈 new
    frontend_prompt = request.form.get("prompt")  # 👈 new

    if not file:
        return jsonify({"error": "No file uploaded"}), 400
    
    if not role:
        return jsonify({"error": "No role provided"}), 400

    if not frontend_prompt:
        return jsonify({"error": "No prompt provided"}), 400

    # Check file type
    if file.filename.lower().endswith(".pdf"):

        # Convert PDF → Images
        images = convert_from_bytes(file.read(), dpi=300)

        for i, image in enumerate(images):
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format="JPEG")
            img_byte_arr.seek(0)

            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                img_byte_arr, resource_type="image", folder="cv_uploads"
            )

            uploaded_urls.append(result["secure_url"])
            print("uploaded_urls", uploaded_urls)

    else:

        img_byte_arr = io.BytesIO()
        file.save(img_byte_arr)
        img_byte_arr.seek(0)

        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            img_byte_arr, resource_type="image", folder="cv_uploads"
        )

        uploaded_urls.append(result["secure_url"])
        print("uploaded_urls", uploaded_urls)

    try:
        # Send to Gradio OCR model
        result = client.predict(
            message={
                "text": """
                You are an expert resume parser. Do not include any explanations, Markdown formatting,  backticks or /n /u for new line and underline.Return the raw text only in clean and orgainsed way. Extract the following information from the resume:
                1. Name - name
                2. career objective if have - career_objective
                3. skills - skills[]
                4. experience - experience[] with company name, role, duration and description of work done with order list if more than 1
                5. education - education[] with degree, institution name, duration and description of work done with order list if more than 1
                6. certifications if have - certifications[] with name, institution and duration with order list if more than 1
                7. projects if have - projects[] with name, description and technologies used with order list if more than 1
                8. achievements if have - achievements[] with name and description with order list if more than 1
                9. another information which is left 
                """,
                "files": [handle_file(uploaded_urls[0])],
            },
            api_name="/chat",
        )
        print("Gradio model response:", result)

    except Exception as e:
        print("Error calling Gradio model:", e)

    # google gemini api call
    try:
        prompt = f"""
        you are an experienced recruiter and you have to set questions for interview based on the resume,below prompt is given and the role.some faq questions are also given to make the questions more relevant or personalised to the role.
        return the questions in orgainsed way with round.
        Maintain professional tone.
        Return only structured questions.
        don't give any explanation or markdown formatting or backticks or /n for new line. Return the questions in plain text only.

        {frontend_prompt}

        Target Role:
        {role}

        Candidate Resume:
        {result}

"""
        test = call_gemini(prompt)
        test = test['candidates'][0]['content']['parts'][0]['text']
        print(test)
        return jsonify({"gemini_response": test}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
