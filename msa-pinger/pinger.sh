#!/usr/bin/env sh

while true; do
	[[ "${DEBUG}" = "true" ]] && echo "Increment pinger by 1"
	curl -s -X POST "${API_URL}/ping"
	sleep 1
done
