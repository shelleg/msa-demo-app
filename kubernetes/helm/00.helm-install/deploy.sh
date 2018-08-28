#!/usr/bin/env bash

[[ -f ./helm-init.yml ]] || helm init --service-account helm --dry-run --debug > helm-init.yml
[[ -f ./helm-rbac-cluster-wide.yml ]] && kubectl create -f helm-rbac-cluster-wide.yml
kubectl create -f helm-init.yml
