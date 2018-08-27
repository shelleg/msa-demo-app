#!/bin/sh
MSA_API_SERVICE_HOST=${MSA_API_SERVICE_HOST:-"msaa-api"}
MSA_API_SERVICE_PORT=${MSA_API_SERVICE_PORT:-8081}
API_URL="${MSA_API_SERVICE_HOST}:${MSA_API_SERVICE_PORT}"
echo "piniging API_URL -> $API_URL"

while true; do
	[[ "${DEBUG}" = "true" ]]
	curl -s -X POST "${API_URL}/ping" && echo "Incremented ping by 1"
	sleep 1
done
