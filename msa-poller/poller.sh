#!/bin/sh
# Example of param:
#		http://msa-api:8080
readonly API_URL=$1
if [ -z "${API_URL}" ]; then
	echo "Something wrong with acript param ${API_URL}: '${API_URL}'...exiting..."
	exit 1
else
	echo "polling API_URL -> ${API_URL}"

	while true; do
		curl -s "${API_URL}/" || echo "get failed"
		sleep 1
	done
fi
