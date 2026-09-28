# ---------- Frontend build ----------
FROM node:20 AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build


# ---------- Backend ----------
FROM python:3.9-slim-buster

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend
COPY backend/ ./backend/

# Copy React production build
COPY --from=frontend-build /app/frontend/build ./frontend/build

WORKDIR /app/backend

EXPOSE 5000

CMD ["flask", "run","--host","0.0.0.0"]