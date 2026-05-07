FROM node:22-slim
WORKDIR /app

# Chromium runtime libs for the headless browser tool (Playwright).
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates fonts-liberation libnss3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
    libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2 \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package.json
RUN npm install --omit=dev

COPY AGENT.md AGENT.md
COPY poncho.config.js poncho.config.js
COPY skills skills
COPY .env.example .env.example
COPY server.js server.js

EXPOSE 3000
CMD ["node","server.js"]
