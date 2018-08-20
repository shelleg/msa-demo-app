#!/usr/bin/env sh

while true; do
	echo `curl -s "${API_URL}/"`
	sleep 1
done
