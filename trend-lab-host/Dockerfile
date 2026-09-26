FROM node:22-alpine AS build
RUN apk add --no-cache git
WORKDIR /app

ARG TRENDLAB_COMMIT=06ac015fd39906813ac75d13ae1dd2a3971cfa2f
RUN git init . \
    && git remote add origin https://github.com/anastaysia94-sudo/smartpickshop-trend-lab.git \
    && git fetch --depth=1 origin "$TRENDLAB_COMMIT" \
    && git checkout --detach FETCH_HEAD \
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
