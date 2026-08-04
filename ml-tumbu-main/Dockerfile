# Dockerfile untuk API prediksi penyakit tanaman TaniLink
# Mode: Gemini-only (tanpa file .pth) — model ML lokal opsional
FROM python:3.11-slim

WORKDIR /app

COPY requirements-api.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py model.py class_names.py ./

# File .pth opsional — kalau tidak ada, server berjalan dalam Gemini-only mode
# COPY plant-disease-model-complete.pth ./

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
