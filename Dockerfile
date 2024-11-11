ARG NODE_VERSION

FROM public.ecr.aws/docker/library/node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/app
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --ignore-scripts --frozen-lockfile

COPY . .

RUN yarn build
# remove development dependencies
RUN yarn install --production

FROM public.ecr.aws/docker/library/node:${NODE_VERSION}-alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ARG SERVICE_VERSION
ENV SERVICE_VERSION=$SERVICE_VERSION

WORKDIR /usr/src/app
COPY --from=build --chown=node:node /usr/src/app/package.json ./
COPY --from=build --chown=node:node /usr/src/app/yarn.lock ./
COPY --from=build --chown=node:node /usr/src/app/dist ./dist
COPY --from=build --chown=node:node /usr/src/app/node_modules ./node_modules

USER node

CMD ["node", "dist/main"]
