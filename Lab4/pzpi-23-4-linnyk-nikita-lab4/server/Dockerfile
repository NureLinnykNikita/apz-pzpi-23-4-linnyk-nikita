FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm install --ignore-scripts

COPY tsconfig.json nodemon.json swagger.yaml ./
COPY src ./src

ENV DATABASE_URL="postgresql://langbang:langbang@postgres:5432/langbang?schema=public"
RUN npx prisma generate

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npx", "tsx", "src/server.ts"]
