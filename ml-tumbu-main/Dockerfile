# Dockerfile untuk API prediksi penyakit tanaman
FROM python:3.11-slim

WORKDIR /app

COPY requirements-api.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py model.py class_names.py ./
# Pastikan file model .pth kamu ada di folder ini sebelum build,
# atau mount sebagai volume saat menjalankan container.
COPY plant-disease-model-complete.pth ./

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
