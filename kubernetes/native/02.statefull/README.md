## Planning and Running a deployment of a statefull app on Kubernetes

### Lab structure:
1. Satisfy perquisites - general background instructions / references
2. Generate Manifests
3. Deploy to kubernetes
4. Test deployment

  ### 1. perquisites

  - You understand what a kubernetes `deployment` is [link](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
  - You understand what `services` are and the different `service` types [link](https://kubernetes.io/docs/concepts/services-networking/service/)
  - `minikube` or equivalent `kuberntes` cluster [Link to minikube getting started]()
  - excersize 01.stateless manifests will be re-used so:
    - create namespace via msa-demo-ns.yml
    - create msa-api vi msa-api.yml
    - create msa-pinger vi msa-pinger.yml
    - create msa-poller vi msa-poller.yml

    ### 1.1 msa-demo-app
    - 4 components
      - redis cache
      - msa-api - a small express app (node.js) which stores pings in redis
      - msa-pinger - send pings to the msa-api
      - msa-poller - reads from msa-api current ping count
    - 2 serve (provide an interface to other services e.g database, api)
    - 2 being served (do not need a service the just consume)
    In this lab we will be creating 1 `namespace `these 4 `deployment`s and 2 `service`s and run our demo-app on kubernetes.

    #### 1.2 Docker images we will be using for this lab:
    1. msa-demo namespace
    1. redis
    1. shelleg/msa-api:config
    1. shelleg/msa-pinger:latest
    1. shelleg/msa-poller:latest

    #### 1.3 Listen ports - a.k.a `services`
    1. `redis` will be using its default port `6379`
    1. `msa-api` will listen on port `8080`

  #### 2. Generate Manifests
  Once you've done this part your current working directory should include:
  - msa-demo-ns.yml
  - msa-api.yml
  - msa-pinger.yml
  - msa-poller.yml

  Our deployment sequence consists of `redis` and `redis service` + a `persistence volume` and `persistence volume claim`.

    **please note:**
    The `pv` creation depends on your kubernetes deployment, if you are using `minikube` with "manual pv provisioning" so you will need to create the `pv` yourself, if you running on GCP / AWS an automatic provisioning will occur as soon as a `pvc` is present ...

    Also, use the .reference directory herein as reference.)

    ##### 2.1 create namespace
    ```sh
    kubectl create namespace msa-demo --dry-run -o yaml > msa-demo-ns.yml
    ```

    ##### 2.2 Create pv (on minikube) - SKIP to 2.3 ->
    Create manifest like so:
    ```yaml
cat <<EOF > redis-data-pv.yml
kind: PersistentVolume
apiVersion: v1
metadata:
  name: redis-data
  labels:
    type: local
spec:
  storageClassName: manual
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/mnt/data"
EOF
    ```

    When running with `minikube` we can use the local storage type to provide a volume ... in a production cluster we would most definitely use some storage backend which provisions volumes automatically.

    create `pv` like so:
    ```sh
    kubectl create -n msa-demo -f redis-data-pv.yml
    ```
    should yield:
    ```sh
    persistentvolume/redis-data created
    ```

    #### 2.3 Create PersistentVolumeClaim (a.k.a pvc)
    We will claim a 100MB volume, this will cause the redis pod which claims that storage to be in `Pending` state until the `pvc` is made available by kubernetes.

    Let's create our `pvc` like so:

    ```yaml
cat <<EOF > redis-data-pvc.yml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  creationTimestamp: null
  labels:
    run: redis
  name: redis-data
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 100Mi
status: {}
EOF
    ```

    #### 2.4 Create deployment for msa-api, msa-pinger, msa-poller like so:
    ```sh
    kubectl create -n msa-demo -f msa-api.yml
    kubectl create -n msa-demo -f msa-pinger.yml -f msa-poller.yml
    ```
    This would yield:

    ```
    namespace/msa-demo created
    service/redis created
    deployment.apps/redis created
    service/msa-api created
    deployment.apps/msa-api created
    deployment.apps/msa-pinger created
    deployment.apps/msa-poller created
    ```

  #### 4. Verify our deployment
    ##### 4.1 validate services
    ```sh
    kubectl -n msa-demo get svc
    ```
    should yield:
    ```sh
    NAME      TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
    msa-api   ClusterIP   100.68.245.88   <none>        8080/TCP   4m
    redis     ClusterIP   100.64.28.115   <none>        6379/TCP   4m
    ```

    ##### 4.2 validate pods
    Get all pods with label "run" (the default when we ran kubectl `run`)

    ```sh
    kubectl get po -l run --all-namespaces
    ```
    should yield:
    ```
    NAMESPACE   NAME                          READY     STATUS    RESTARTS   AGE
    msa-demo    msa-api-6cb7c9c6bf-rz6fd      1/1       Running   0          32m
    msa-demo    msa-pinger-599f4c5bf9-s8sc7   1/1       Running   0          20m
    msa-demo    msa-poller-7cfcb4c8d-wlrr6    1/1       Running   0          15m
    msa-demo    redis-685c788858-dw7nl        1/1       Running   0          1h
    ```

    ##### 4.3 validate redis
    Test redis is working:

    ```sh
    kubectl -n msa-demo exec -it `kubectl -n msa-demo get pod | grep redis | awk '{print $1}'` redis-cli KEYS '*'
    ```
    should yield:
    ```
    1) "pings"
    ```

    Get the value of pings:
    ```sh
    kubectl -n msa-demo exec -it `kubectl -n msa-demo get pod | grep redis | awk '{print $1}'` redis-cli GET pings
    ```
    should yield somt number:
    ```sh
    "2152"
    ```

    ##### 4.4 validate msa-api
    Test msa-api is working:

    ```sh
    kubectl -n msa-demo logs `kubectl -n msa-demo get pod | grep msa-api | awk '{print $1}'`
    ```

    should yield:

    ```sh
    > msa-api@1.0.0 start /opt/tikal
    > node api.js

    loading ./config/development.json
    Connecting to cache_host: redis://10.110.76.53:6379
    Server running on port 8080!
    node_redis: Warning: Redis server does not require a password, but a password was supplied.
    ```

    #### 5. Cleanup
    ```sh
    kubectl delete deployments. -n msa-demo -l run
    kubectl delete svc redis
    kubectl delete svc msa-api
    kubectl delete pvc redis-data
    kubectl delete pv redis-data
    kubectl delete namespace msa-demo
    ```
    This could take a while ...
    Run `kubectl get pod -l run` until it yield `No resources found.`

    or use: `kubectl get pod -l run -w` until you get `No resources found.`
