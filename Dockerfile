FROM oven/bun:1.0-alpine

WORKDIR /usr/src/app

COPY package.json ./

RUN bun install --production

COPY . .

RUN mkdir -p /app/data/uploads /app/data/transcripts

RUN addgroup -g 1001 -S bunjs
RUN adduser -S bunapp -u 1001

RUN chown -R bunapp:bunjs /usr/src/app /app/data

USER bunapp

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun -e "await fetch('http://localhost:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "run", "index.js"]