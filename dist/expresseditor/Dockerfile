FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .


# CMD [ "node", "server.js" ]
ENV PORT=3000

ENV BCP=8080

ENV BCH=localhost

EXPOSE ${PORT}

# CMD ["PORT=9090", "BC=localhost", "node", "app.js" ]
CMD ["sh", "-c", "node server.js ${PORT} ${BCH} ${BCP}"]