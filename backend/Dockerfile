# ── HuggingFace Spaces Dockerfile ──────────────────────────────
# SDK: Docker  |  Port: 7860 (HF default)

FROM python:3.11-slim

WORKDIR /app

# ffmpeg needed by yt-dlp for audio/video merging
RUN apt-get update && apt-get install -y \
    ffmpeg \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend server
COPY server.py .

# HuggingFace Spaces requires port 7860
ENV PORT=7860

EXPOSE 7860

CMD ["python", "server.py"]
