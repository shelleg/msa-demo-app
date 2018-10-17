# msa-demo-app deployment with helm

## Workstation Setup

Ensure you have the following tools installed:

* kubectl
* helm

Ensure you have the ac.fuse.tikal.io cluster context setup.

See [ac.fuse.tikal.io](https://github.com/shelleg/ac-k8s/tree/master/ac.fuse.tikal.io#connection-to-the-cluster-considering-you-have-the-above-perquisites)

Ensure you have the stable helm repository set-up:

```sh
helm repo add stable https://kubernetes-charts.storage.googleapis.com
```
Install helm-s3 plugin:

```sh
helm plugin install https://github.com/hypnoglow/helm-s3.git
```

Add the msa-charts S3 helm repository:

```sh
helm repo add msa-charts s3://msa-charts/
```

## msa-demo-app deploy

Use helm command-line tool to deploy msa-demo-app:

```sh
kubectl create namespace msa-umbrella
helm dep build ./helm/msa-umbrella
helm install --name v1 --namespace msa-umbrella ./helm/msa-umbrella
```

The `msa-umbrella` helm chart is an umbrella that deploys the following
sub-charts:

* [redis](https://github.com/helm/charts/tree/master/stable/redis)
* [msa-api](./msa-api/)
* [msa-pinger](./msa-pinger/)
* [msa-poller](./msa-poller/)

## Verification

to verify that app working check pods logs:

```sh
kubectl get pods -n msa-umbrella
NAME                             READY     STATUS    RESTARTS   AGE
msa-api-6766fc84b-d8gj4          1/1       Running   2          9h
v1-msa-pinger-6654fd77c4-sn794   1/1       Running   0          9h
v1-msa-poller-66fc9587b7-xjkq4   1/1       Running   0          9h
v1-redis-master-0                1/1       Running   0          9h

kubectl logs v1-msa-pinger-6654fd77c4-sn794 -n msa-umbrella
Incremented ping by 1

kubectl logs v1-msa-poller-66fc9587b7-xjkq4 -n msa-umbrella
Current ping count: 508
```

for simpler multiple logs output use tool: [kubetail](https://github.com/johanhaleby/kubetail)

```sh
kubetail v1 -n msa-umbrella
Will tail 3 logs...
v1-msa-pinger-6654fd77c4-sn794
v1-msa-poller-66fc9587b7-xjkq4
v1-redis-master-0
[v1-msa-pinger-6654fd77c4-sn794] Incremented ping by 1
[v1-msa-poller-66fc9587b7-xjkq4] Current ping count: 553
[v1-msa-pinger-6654fd77c4-sn794] Incremented ping by 1
[v1-msa-poller-66fc9587b7-xjkq4] Current ping count: 554
```
