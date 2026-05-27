# ── Stage 1: Build Frontend ───────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Final Backend Image ──────────────────────────────
FROM python:3.11-slim
WORKDIR /app

# ffmpeg needed by yt-dlp, and curl + nodejs for yt-dlp JS signature decryption
RUN apt-get update && apt-get install -y ffmpeg curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend server
COPY backend/server.py ./

# Copy built frontend dist into expected location (relative to backend server.py, which looks at ../frontend/dist)
COPY --from=frontend-builder /frontend/dist /frontend/dist

# HuggingFace Spaces requires port 7860
ENV PORT=7860
EXPOSE 7860

CMD ["python", "server.py"]
