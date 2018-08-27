#!/bin/bash
# kubectl delete namespace msa-demo
kubectl delete svc redis
kubectl delete svc msa-api
kubectl delete pvc redis-data
kubectl delete pv redis-data
kubectl delete namespace msa-demo
# kubectl delete -n msa-demo -f redis.yml -f msa-api.yml -f msa-pinger.yml -f msa-poller.yml
