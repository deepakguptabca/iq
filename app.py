from flask import Flask, render_template, request, jsonify
import os
import dotenv
import cloudinary
import cloudinary.uploader
from pdf2image import convert_from_bytes
import io
import requests
from gradio_client import Client, handle_file


# loaded env variables
dotenv.load_dotenv()
# flask app
app = Flask(__name__)

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


@app.route("/cv", methods=["POST"])
def cv():
    file = request.files.get("file")

    if not file:
        return jsonify({"error": "No file uploaded"}), 400

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
        prompt = f"""You are an experienced professional interviewer conducting a complete mock interview.return the interview in structured format with questions. Do not include any explanations, Markdown formatting,  backticks or /n /u for new line. Return the raw text only in clean and orgainsed way.

The candidate’s resume is provided below:

{result}

You must conduct a structured interview in 3 rounds:

Rules:

Ask one question at a time.
Maintain professional interview tone.


Round 1: Basic / Screening Round

Evaluate:

Candidate introduction (background, education, skills)

Experience discussion

Communication clarity and confidence

Then automatically move to Round 2.

Round 2: Technical Round

Instructions:

Analyze the resume carefully.

Ask technical questions based on:

Mentioned skills

Technologies

Projects

Experience level

Include:

Concept-based question

Scenario-based question

Problem-solving question

Adjust difficulty based on experience.

Then automatically move to Round 3.

Round 3: Behavioral / Managerial Round

Focus on:

Teamwork

Conflict handling

Leadership (if applicable)

Deadline pressure

Decision making

Real-world work scenarios

Rules:

Ask situational questions like:
"Tell me about a time when..."

"""
        test = call_gemini(prompt)
        return jsonify({"gemini_response": test}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
