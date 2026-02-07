FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy source code
COPY . .

# Build arguments for Vite (non-sensitive only; sensitive vars via BuildKit secrets)
ARG VITE_API_BASE_URL
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_USE_FIREBASE_EMULATOR=false

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID
ENV VITE_USE_FIREBASE_EMULATOR=$VITE_USE_FIREBASE_EMULATOR

# Sensitive values injected via BuildKit secrets (not stored in image layers)
RUN --mount=type=secret,id=firebase_api_key \
    --mount=type=secret,id=firebase_auth_domain \
    export VITE_FIREBASE_API_KEY=$(cat /run/secrets/firebase_api_key) && \
    export VITE_FIREBASE_AUTH_DOMAIN=$(cat /run/secrets/firebase_auth_domain) && \
    npm run build

# Production stage - copy built files to nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


