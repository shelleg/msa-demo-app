FROM node:6-alpine

RUN mkdir -p /opt/tikal/

WORKDIR /opt/tikal/

COPY package.json .
RUN npm install

COPY *.js /opt/tikal/

EXPOSE 8080

CMD [ "npm", "start" ]
