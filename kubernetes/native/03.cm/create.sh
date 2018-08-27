#!/bin/bash
kubectl create -f msa-demo-ns.yml
kubectl create -n msa-demo -f redis.yml
kubectl create -n msa-demo -f msa-api.yml -f msa-pinger.yml -f msa-poller.yml
