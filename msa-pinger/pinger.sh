#!/bin/sh
# Example of param:
#		http://msa-api:8080/ping
readonly API_URL=$1
if [ -z "${API_URL}" ]; then
	echo "Something wrong with acript param ${API_URL}: '${API_URL}'...exiting..."
	exit 1
else
	echo "piniging API_URL -> ${API_URL}"

	while true; do
		[[ "${DEBUG}" = "true" ]]
		curl -s -X POST ${API_URL} && echo "Incremented ping by 1"
		sleep 1
	done
fi
