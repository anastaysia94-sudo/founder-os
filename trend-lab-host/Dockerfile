FROM node:22-alpine AS build
RUN apk add --no-cache git
WORKDIR /app

ARG TRENDLAB_COMMIT=8c859593e94c48307d3c972513bca98243cd9905
RUN git clone --depth=1 --branch main https://github.com/anastaysia94-sudo/smartpickshop-trend-lab.git . \
    && test "$(git rev-parse HEAD)" = "$TRENDLAB_COMMIT" \
    && echo "TRENDLAB_COMMIT=$(git rev-parse HEAD)"

RUN npm install
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app ./
EXPOSE 3000
CMD ["sh","-c","npm run start -- -H 0.0.0.0 -p ${PORT:-3000}"]
