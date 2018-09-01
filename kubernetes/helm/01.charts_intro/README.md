## LAB 1 :: Work with existing charts [chaoskube]

In order to review the structure of a chart will take an example stable chart `chaoskube` - chosen due to it's components.

#### Perquisites
- helm is installed (see `../00.helm-install`)

##### 1. Get the chart locally & examine it

`helm fetch --version=0.10.0 stable/chaoskube`

Which should result in the file `chaoskube-0.10.0.tgz` in your current working directory.

If we extract this tar file like so:

`tar xvf chaoskube-0.10.0.tgz`

we get the following:

```sh
./chaoskube
|-- Chart.yaml
|-- OWNERS
|-- README.md
|-- templates
|   |-- NOTES.txt
|   |-- _helpers.tpl
|   |-- clusterrole.yaml
|   |-- clusterrolebinding.yaml
|   |-- deployment.yaml
|   |-- role.yaml
|   |-- rolebinding.yaml
|   `-- serviceaccount.yaml
`-- values.yaml

1 directory, 12 files
```

##### 2. Learn what this chart would do by default:

```sh
helm template ./chaoskube --name chaoskube
```

Would yield:
```yaml
---
# Source: chaoskube/templates/deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: chaoskube
  labels:
    app: chaoskube
    heritage: "Tiller"
    release: "chaoskube"
    chart: chaoskube-0.10.0
spec:
  replicas: 1
  selector:
    matchLabels:
      app: chaoskube
      release: chaoskube
  template:
    metadata:
      labels:
        app: chaoskube
        heritage: "Tiller"
        release: "chaoskube"
        chart: chaoskube-0.10.0
    spec:
      containers:
        - name: chaoskube
          image: quay.io/linki/chaoskube:v0.10.0
          args:
            - --interval=10m
            - --labels=
            - --annotations=
            - --namespaces=
            - --excluded-weekdays=
            - --excluded-times-of-day=
            - --excluded-days-of-year=
            - --timezone=UTC
            - --minimum-age=0s
          resources:
            {}

      serviceAccountName: "default"

---
# Source: chaoskube/templates/clusterrole.yaml

---
# Source: chaoskube/templates/clusterrolebinding.yaml

---
# Source: chaoskube/templates/role.yaml

---
# Source: chaoskube/templates/rolebinding.yaml

---
# Source: chaoskube/templates/serviceaccount.yaml
```

See all the "empty" files due to the fact we didn't provide values to set them.

##### 3. Learn what this chart could potentially do:

If we run the same with --debug we can see the exact values which are expected by the chart:

```sh
helm template ./chaoskube --name chaoskube --debug

REVISION: 1
RELEASED: Sat Sep  1 21:01:41 2018
CHART: chaoskube-0.10.0
USER-SUPPLIED VALUES:
{}

COMPUTED VALUES:
affinity: {}
annotations: null
debug: false
dryRun: true
excludedDaysOfYear: null
excludedTimesOfDay: null
excludedWeekdays: null
image: quay.io/linki/chaoskube
imageTag: v0.10.0
interval: 10m
labels: null
minimumAge: 0s
name: chaoskube
namespaces: null
nodeSelector: {}
priorityClassName: ""
rbac:
  create: false
  serviceAccountName: default
replicas: 1
resources: {}
timezone: UTC
tolerations: []

HOOKS:
MANIFEST:

---
```

##### 3. Customize values via cli with `--set`:

If we were to say `--set rbac-true` like so:

`helm template --set rbac.create=true --debug  ./chaoskube` well get a much longer output which also create the required ServiceAcoount, ClusterRole, ClusterRoleBinding, RoleBinding as you see in the templates directory.


##### 4. Use your own `values.yml` file:

You could use your own custom values.yaml file (and keep it in source control ...) and run helm like so:

```sh
cp ./chaoskube/values.yaml my-values.yaml
```

edit **line 49** and set `rbac.create` to true and then:
or run:

```sh
cat ./chaoskube/values.yaml | sed -e 's/create: false/create: true/g' > my-values.yml
```

```sh
helm template -f my-values.yaml ./chaoskube --debug
```

Which is the same we did from --set in bullet #3 above.

##### 5. Install the chart:
```
helm install -f my-values.yaml ./chaoskube --debug --name chaoskube
```

Would yield:
```sh
[debug] Created tunnel using local port: '64563'

[debug] SERVER: "127.0.0.1:64563"

[debug] Original chart version: ""
[debug] CHART PATH: /Users/hagzag/projects/shelleg/msa-demo-app/kubernetes/helm/01.charts_intro/.reference/chaoskube

NAME:   chaoskube
REVISION: 1
RELEASED: Sat Sep  1 19:18:09 2018
CHART: chaoskube-0.10.0
USER-SUPPLIED VALUES:
{{ snip - see example ebove }}
---
# Source: chaoskube/templates/serviceaccount.yaml
{{ snip - see example ebove }}
---
# Source: chaoskube/templates/clusterrole.yaml
{{ snip - see example ebove }}
---
# Source: chaoskube/templates/clusterrolebinding.yaml
{{ snip - see example ebove }}
---
# Source: chaoskube/templates/role.yaml
{{ snip - see example ebove }}
---
# Source: chaoskube/templates/rolebinding.yaml
{{ snip - see example ebove }}
---
# Source: chaoskube/templates/deployment.yaml
{{ snip - see example ebove }}

LAST DEPLOYED: Sat Sep  1 19:18:09 2018
NAMESPACE: default
STATUS: DEPLOYED

RESOURCES:
==> v1beta1/Deployment
NAME       DESIRED  CURRENT  UP-TO-DATE  AVAILABLE  AGE
chaoskube  1        1        1           0          0s

==> v1/Pod(related)
NAME                        READY  STATUS             RESTARTS  AGE
chaoskube-79ddff756d-2n45v  0/1    ContainerCreating  0         0s

==> v1/ServiceAccount
NAME                 SECRETS  AGE
chaoskube-chaoskube  1        0s

==> v1/ClusterRole
NAME                 AGE
chaoskube-chaoskube  0s

==> v1/ClusterRoleBinding
NAME                 AGE
chaoskube-chaoskube  0s

==> v1/Role
NAME                 AGE
chaoskube-chaoskube  0s

==> v1/RoleBinding
NAME                 AGE
chaoskube-chaoskube  0s


NOTES:
chaoskube is running and will kill arbitrary pods every 10m.

You can follow the logs to see what chaoskube does:

    POD=$(kubectl -n default get pods -l='release=chaoskube' --output=jsonpath='{.items[0].metadata.name}')
    kubectl -n default logs -f $POD

You are running in dry-run mode. No pod is actually terminated.
```

##### 6. Check chart status

* Using `helm list` like so:
```sh
helm list
NAME     	REVISION	UPDATED                 	STATUS  	CHART           	NAMESPACE
chaoskube	1       	Sun Sep  2 00:47:05 2018	DEPLOYED	chaoskube-0.10.0	default
```
* Using `kubectl` like so:
```sh
kubectl -n default get pods -l='release=chaoskube'
```
**Note** the default `release` label which is added by helm

Considering our goal here was to see a chart and it's structure we won't dwell on what `chaoskube` can do or not do ...

##### 7. Delete the chart:

```
helm delete chaoskube --purge
release "chaoskube" deleted
```

IMHO were ready to write our own Chart ... see ya in the next lab ;)
