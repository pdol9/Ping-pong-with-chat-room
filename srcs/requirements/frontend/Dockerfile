FROM		node:20-bullseye AS node

########
# DEVELOPMENT
########

FROM		node AS development

WORKDIR		/app

COPY		--chown=node:node ./app/package*.json ./

RUN			npm ci

COPY		--chown=node:node ./app/ ./

USER		node

CMD			["sh", "-c", "npm run dev -- -p ${PORT}"]

########
# BUILD FOR PRODUCTION
########

FROM		node AS build

WORKDIR		/app

ARG			API42_AUTHORIZE
ENV			API42_AUTHORIZE=$API42_AUTHORIZE

COPY		--chown=node:node --from=development /app/node_modules ./node_modules
COPY		--chown=node:node ./app/ ./

RUN			npm run build

RUN			npm ci --omit=dev

########
# PRODUCTION
########

FROM		node AS production

WORKDIR		/app

COPY		--chown=node:node --from=build /app/node_modules ./node_modules
COPY		--chown=node:node --from=build /app/.next ./.next
COPY		--chown=node:node --from=build /app/public ./public

USER		node

CMD			["sh", "-c", "npx next start -p ${PORT}"]
