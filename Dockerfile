FROM dhi.io/node:22-alpine-dev AS build
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

FROM dhi.io/node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=65532:65532 /app/node_modules ./node_modules
COPY --chown=65532:65532 package.json ./package.json
COPY --chown=65532:65532 src ./src

USER 65532
EXPOSE 3000
CMD ["node", "src/server.js"]
