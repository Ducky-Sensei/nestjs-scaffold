# Multi-stage production Dockerfile for NestJS API
# Build context should be the monorepo root

FROM node:22-alpine AS deps

WORKDIR /app
RUN corepack enable pnpm

# Copy workspace configuration and package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @scaffold/api...

FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable pnpm

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages
COPY apps/api ./apps/api
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Build application
RUN pnpm --filter @scaffold/api build

FROM node:22-alpine AS prod

ENV NODE_ENV=production

# Set working directory to the app location
WORKDIR /opt/app/apps/api

# Copy package files and dependencies from build stage (relative to /opt/app)
COPY --chown=node:node --from=build /app/package.json /opt/app/package.json
COPY --chown=node:node --from=build /app/node_modules /opt/app/node_modules
COPY --chown=node:node --from=build /app/packages /opt/app/packages

# Copy app-specific files
COPY --chown=node:node --from=build /app/apps/api/package.json ./package.json
COPY --chown=node:node --from=build /app/apps/api/node_modules ./node_modules
COPY --chown=node:node --from=build /app/apps/api/dist ./dist

EXPOSE 8000
USER node

CMD ["node", "--enable-source-maps", "dist/main.js"]
