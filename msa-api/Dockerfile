FROM arabkin/node-base-img:0.1.1

RUN mkdir -p /opt/tikal/config

WORKDIR /opt/tikal/
COPY package.json .
COPY *.js /opt/tikal/
COPY config/* /opt/tikal/config/

EXPOSE 8080

CMD [ "npm", "start" ]
