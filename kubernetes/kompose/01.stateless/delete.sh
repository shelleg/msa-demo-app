#deploy msa-pinger and msa-poller
kubectl delete -f msa-pinger-deployment.yaml -f msa-poller-deployment.yaml
# deploy msa-api
kubectl delete -f msa-api-service.yaml -f msa-api-deployment.yaml
# deploy redis
kubectl delete -f redis-deployment.yaml -f redis-service.yaml
