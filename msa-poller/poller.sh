#!/bin/sh
MSA_API_SERVICE_HOST=${MSA_API_SERVICE_HOST:-"msa-api"}
MSA_API_SERVICE_PORT=${MSA_API_SERVICE_PORT:-8080}
API_URL="${MSA_API_SERVICE_HOST}:${MSA_API_SERVICE_PORT}"
echo "piniging API_URL -> $API_URL"

while true; do
	curl -s "${API_URL}/" || echo "get failed"
	sleep 1
done
