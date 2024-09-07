FROM node:lts-alpine as builder

WORKDIR /app

ARG API_URL

ENV API_URL=${API_URL}


COPY . .

RUN yarn


# 構建應用
RUN yarn  build

FROM node:lts-alpine

WORKDIR /app


ENV NODE_ENV production


COPY --from=builder /app/next.config.js ./


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


# Set the correct permission for prerender cache
RUN mkdir .next
RUN #chown nextjs:nodejs .next
COPY --from=builder  /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN #yarn add sharp
RUN #mkdir -p /app/.next/cache && chown -R node:node /app/.next/cache
RUN chown nextjs:nodejs .next
USER nextjs

EXPOSE 7979

ENV PORT 7979

ENV HOSTNAME "0.0.0.0"


CMD ["node", "server.js"]
