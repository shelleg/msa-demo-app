#!/bin/bash
kubectl create -f msa-demo-ns.yml
# sp=`kubectl get storageclasses.storage.k8s.io | wc -l`
# echo $sp
# [[ $sp -gt 2 ]] || kubectl create -n msa-demo -f .reference/redis-data-pv.yml
kubectl create -n msa-demo -f .reference/redis-data-pvc.yml
kubectl create -n msa-demo -f .reference/redis.yml
kubectl create -n msa-demo -f msa-api.yml -f msa-pinger.yml -f msa-poller.yml
