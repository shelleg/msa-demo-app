## LAB 02.statefull || Using kompose for statefull kubernetes deployments

***Purpose:***
* Get to know how a deployments & services look like in Kubernetes
* If you are coming from docker-compose - this lab could help you get started converting ...

### requirements

- `docker` & `docker-compose` installed
- access to a docker daemon running (somewhere)
- minikube / other kubernetes deployment available
- **kubectl** installed
- Internet connection and access to hub.docker.io
- If migrating from docker-compose install `kompose`

*Please note:* this was tested with the following versions:
```
kubectl version - v1.11.2
kubernetes version - v1.9.6
minikube version - v0.28.2
kompose version - 1.16.0 ()
```


## STEP-1 Get your environment ready

  #### Quick start "docker-native"
  This step is done to validate you have everything running locally before we "kompose" it.
  - From your terminal
    `docker-compose up -d`

  #### Detailed execution

  - git clone <this repo>
  - cd ./<current_dir>/...
  - `docker-compose up -d`

  #### Testing the deployment

  - `curl localhost:8080` should yield something like `Current count: 1`
    - See how the count increments each time you run the command
  - Check the redis key named "count" like so:

    ```
    docker exec `docker ps | grep redis | awk '{print $NF}'` redis-cli get pings
    ```
    which should yield a number e.g `5`
  - Stop n Start our application removing volumes like so:

    ```
    docker-compose down --volumes && docker-compose up -d
    ```

  - If we run the app again we will see our pinger is back to `1` like we started ...

  #### Tier down
  - `docker-compose down --volumes`

## STEP-2 start minikube  
  - install `minikube` [info here](https://github.com/kubernetes/minikube/releases) - this lab was performed with minkube version `v0.28.2` and kubernetes version `v1.10.0` on mac OS High Sierra
  - Getting general cluster-info -> execute `kubectl cluster-info` and make sure you are on the minikube cluster (and not som other production one...) should yield something like:

  ```
  Kubernetes master is running at https://192.168.99.100:8443
  KubeDNS is running at https://192.168.99.100:8443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

  To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
  ```
  - execute `kubectl get namespaces` just to make sure we have a clean setup ... should yield:

  ```
  NAME          STATUS    AGE
  default       Active    10d
  kube-public   Active    10d
  kube-system   Active    10d
  ```

  - Extra part which is worth while especially if you run the `docker-labs` and you have the images built locally in your docker daemon ... [more info here](https://kubernetes.io/docs/setup/minikube/#reusing-the-docker-daemon)

  *Specific instructions:*

  Just execute the following: `eval $(minikube docker-env)` if running on centos please read the info in the link provided above.

  If you followed this step:

  1. A simple `docker ps` will show you that you are running stuff like `k8s_POD_kube-dns...` and `k8s_POD_kube-proxy...` and more - this is normal for all you did above was set the `DOCKER_HOST` & co. variables to the minikube vm !
  2. Run `docker-compose` build so in our next step the deployment should go much faster than pulling from `docker hub`.


## STEP-3 komposing the docker-compse
  - install `kompose` [info here](https://github.com/kubernetes/kompose#installation) - this lab was performed with version `1.15.0` on mac OS High Sierra
  - In the lab0 root directory you will find reference files ... to compare to ...

1. Convert the docker-compose.yml with `kompose` by executing:

   `kompose convert -f docker-compose.yml`

   should yield:

   ```
   INFO Kubernetes file "msa-api-service.yaml" created
   INFO Kubernetes file "msa-api-deployment.yaml" created
   INFO Kubernetes file "msa-pinger-deployment.yaml" created
   INFO Kubernetes file "msa-poller-deployment.yaml" created
   INFO Kubernetes file "redis-deployment.yaml" created
   INFO Kubernetes file "redis-data-persistentvolumeclaim.yaml" created
   ```
   Please note in this lab we have a new PVC PersistentVolumeClaim for the redis pings key to persist unpon pod / deployment deletion.

1. Deploy `redis` (statefull) by executing:
   ```
   kubectl create -f redis-data-persistentvolumeclaim.yaml -f redis-deployment.yaml f redis-service.yaml
   ```

2. Validate `redis` rediness to serve by executing:
  ```
  kubectl exec -it `kubectl get pod | grep redis | awk '{print $1}'` redis-cli KEYS '*'
  ```
  which should yield:
  ```
  (empty list or set)  
  ```
2. Deploy `msa-api` by executing:
   ```
   kubectl create -f msa-api-deployment.yaml -f msa-api-service.yaml
   ```
   which should yield:
   ```
   deployment.extensions/msa-api created
   service/msa-api created
   ```

2. Validate `msa-api` is functional:

   ```
   kubectl logs `kubectl get pod | grep msa-api | awk '{print $1}'`
   ```
   which should yield:
   ```
   > msa-api@1.0.0 start /opt/tikal
   > node api.js

   Server running on port 8080!
   ```
3. Deploying `msa-pinger` & `msa-deployer` by executing:
   ```
   kubectl create -f msa-poller-deployment.yaml -f msa-pinger-deployment.yaml
   ```
   which should yield:

   ```
   deployment.extensions/msa-poller created
   deployment.extensions/msa-pinger created
   ```

3. Validate `msa-poller` & `msa-pinger` are functional:
   ```
   kubectl logs `kubectl get pod | grep msa-poller | awk '{print $1}'`
   ```
   Should yield something like:
   ```
   Current count: 268
   Current count: 270
   Current count: 272
   Current count: 274
   Current count: 276
   Current count: 278
   Current count: 280
   Current count: 282
   ```

   ```
   kubectl logs `kubectl get pod | grep msa-pinger | awk '{print $1}'`
   ```
   Should yield:
   ```
   Increment pinger by 1
   Increment pinger by 1
   Increment pinger by 1
   ...
   ```

   `msa-pinger` has no log output ... tell me why in "Step-4" or skip to "Cleanup"

## STEP-4 "Bonus Step"
- Why does the `msa-pinger` have no logs ?
- How do you plan on solving it ?
- Write a solution down / implement it

[//]: # (HINT :: If you take a close look at the pinger cmd it requires a DEBUG environment variable to be set to "true" [string] so see how you make it happen in your deployment)

## STEP-5 Cleanup

- use file to remove deployments(pods), services and pvc's like so:
  ```
  kubectl delete -f msa-api-deployment.yaml \
                 -f msa-api-service.yaml \
                 -f msa-pinger-deployment.yaml \
                 -f msa-poller-deployment.yaml \
                 -f redis-data-persistentvolumeclaim.yaml \
                 -f redis-deployment.yaml \
                 -f redis-service.yaml
  ```
