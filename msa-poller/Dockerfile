FROM alpine:3.5

RUN apk add --no-cache curl && mkdir -p /opt/tikal

COPY poller.sh /opt/tikal/poller.sh

CMD [ "/opt/tikal/poller.sh" ]
