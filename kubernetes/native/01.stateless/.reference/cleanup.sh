#!/bin/bash
kubectl delete namespace msa-demo
# kubectl delete -n msa-demo -f redis.yml -f msa-api.yml -f msa-pinger.yml -f msa-poller.yml
