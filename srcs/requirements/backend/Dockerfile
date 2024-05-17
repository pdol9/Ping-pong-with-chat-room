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

CMD			["npm", "run", "start:dev"]

########
# BUILD FOR PRODUCTION
########

FROM		node AS build

WORKDIR		/app

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
COPY		--chown=node:node --from=build /app/dist ./dist

USER		node

CMD			["node", "dist/main"]
