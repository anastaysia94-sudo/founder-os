FROM node:22-alpine AS build
RUN apk add --no-cache git
WORKDIR /app
RUN git clone --depth=1 --branch main https://github.com/anastaysia94-sudo/smartpickshop-trend-lab.git .
RUN npm install
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app ./
EXPOSE 3000
CMD ["sh","-c","npm run start -- -H 0.0.0.0 -p ${PORT:-3000}"]
