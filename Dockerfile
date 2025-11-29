FROM oven/bun:1.0-alpine

WORKDIR /usr/src/app

COPY package.json bun.lockb* ./

RUN bun install --frozen-lockfile --production

COPY . .

RUN mkdir -p uploads public/transcripts

RUN addgroup -g 1001 -S bunjs
RUN adduser -S bunapp -u 1001

RUN chown -R bunapp:bunjs /usr/src/app

USER bunapp

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun healthcheck.js || exit 1

CMD ["bun", "run", "index.js"]