FROM node:6-alpine

RUN mkdir -p /opt/tikal/config

WORKDIR /opt/tikal/

COPY package.json .
RUN npm install

COPY *.js /opt/tikal/
COPY config/* /opt/tikal/config/

EXPOSE 8080

CMD [ "npm", "start" ]
