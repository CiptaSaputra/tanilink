FROM python:3.11-slim

WORKDIR /app

COPY requirements-api.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py model.py class_names.py ./

EXPOSE 8000

# Pakai shell form agar $PORT ter-expand sebagai environment variable
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}
