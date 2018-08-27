# deploy redis
kubectl create -f redis-deployment.yaml -f redis-service.yaml
# deploy msa-api
kubectl create -f msa-api-service.yaml -f msa-api-deployment.yaml
#deploy msa-pinger and msa-poller
kubectl create -f msa-pinger-deployment.yaml -f msa-poller-deployment.yaml
