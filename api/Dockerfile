# CampusShop API container (Week 13)
FROM node:20-alpine
WORKDIR /app

# Prisma needs OpenSSL/libssl on Alpine (musl) or the query/schema engine can't load.
RUN apk add --no-cache openssl

# install deps first (better layer caching)
COPY package*.json ./
RUN npm install

# copy source + prisma schema, then generate the client
COPY . .
RUN npx prisma generate

EXPOSE 4000
# sync the schema to the DB then start (uses tsx — no build step).
# `db push` works without committed migration files; in class, `npx prisma migrate dev` (Week 10)
# is the real workflow and records migration history.
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]
