FROM node:6-alpine

RUN mkdir -p /opt/tikal/config

WORKDIR /opt/tikal/

VOLUME /opt/tikal/config

COPY package.json .
RUN npm install

COPY config/* config/
COPY *.js /opt/tikal/

EXPOSE 8080

CMD [ "npm", "start" ]
