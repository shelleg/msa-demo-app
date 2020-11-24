## Planning and Running a deployment of a stateless app on Kubernetes

### Lab structure:
1. Satisfy perquisites - general background instructions / references
2. Generate Manifests
3. Deploy to kubernetes
4. Test deployment

  ### 1. perquisites

  - You understand what a kubernetes `deployment` is [link](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
  - You understand what `services` are and the different `service` types [link](https://kubernetes.io/docs/concepts/services-networking/service/)
  - `minikube` or equivalent `kuberntes` cluster [Link to minikube getting started]()

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

  #### 2. Manifests
  - msa-demo-ns.yml
  - redis.yml
  - msa-api.yml
  - msa-pinger.yml
  - msa-poller.yml

    **please note:** use the .reference directory herein as reference.)

    ##### 2.1 Create `msa-demo` namespace 

    ```sh
    kubectl create namespace msa-demo
    ```

    ##### 2.2.1 Create deployment for redis (using kubectl --dry-run)

    ```sh
    kubectl  create deployment redis --image=redis:5 --port=6379 --dry-run=client -o yaml > redis-deployment.yaml
    ```

    which yields:
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      creationTimestamp: null
      labels:
        app: redis
      name: redis
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: redis
      strategy: {}
      template:
        metadata:
          creationTimestamp: null
          labels:
            app: redis
        spec:
          containers:
          - image: redis:5
            name: redis
            ports:
            - containerPort: 6379
            resources: {}
    status: {}
    ```
    
    ##### 2.2.2 Create service for redis (using kubectl --dry-run)

    ```sh
    kubectl  create service clusterip redis  --tcp=6379 --dry-run=client  -oyaml > redis-service.yaml
    ```

    which yields:
    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      creationTimestamp: null
      labels:
        app: redis
      name: redis
    spec:
      ports:
      - name: "6379"
        port: 6379
        protocol: TCP
        targetPort: 6379
      selector:
        app: redis
      type: ClusterIP
    status:
      loadBalancer: {}
    ```
    
    #### 2.3.1 Create deployment for msa-api
    ```sh
    kubectl create deployment msa-api --image=shelleg/msa-api:config  --port=8080 --dry-run=client -o yaml > msa-api-deployment.yaml
    ```

    which yields:
    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      creationTimestamp: null
      labels:
        app: msa-api
      name: msa-api
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: msa-api
      strategy: {}
      template:
        metadata:
          creationTimestamp: null
          labels:
            app: msa-api
        spec:
          containers:
          - image: shelleg/msa-api:config
            name: msa-api
      ports:
            - containerPort: 8080
            resources: {}
    status: {}
    ```
    Edit file `msa-api-deployment.yaml`:  In the `containers` under `spec`, after the `image` and `name` definition add:
    ```yaml
    env:
      - name: REDIS_URL 
        value: redis://redis:6379
    ```
    Save your changes. Now the pod will know where to find the cache server.
    
    #### 2.3.2 Create service for msa-api
    ```sh
    kubectl  create service clusterip msa-api --tcp=8080 --dry-run=client  -oyaml > msa-api-service.yaml
    ```
    which yield:
    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      creationTimestamp: null
      labels:
        app: msa-api
      name: msa-api
    spec:
      ports:
      - name: "8080"
        port: 8080
        protocol: TCP
        targetPort: 8080
      selector:
        app: msa-api
      type: ClusterIP
    status:
      loadBalancer: {}
      ```
      
      ### Lets deploy
      run 
      ```sh
      ls
      ```
      You should have this in your folder:
      ```
      msa-api-deployment.yaml  README.md              redis-service.yaml
      msa-api-service.yaml     redis-deployment.yaml
      ```
      Now run:
      ```sh
       k create --namespace msa-demo -f .
       ```
       
       ### Lets test
       Link the api service to a local port:
       ```sh
       kubectl port-forward service/msa-api 8080
       ```
       point your browser to `http://localhost:8080`, verify you get `Current ping count: null `
       
       Now ping to it by running:
       ```sh
       curl -d "" http://localhost:8080/ping
       ```
       Refresh your browser and see if ping was counted.
      
    -------------------- MIO -------------------------  

    #### 2.4 Create deployment for msa-pinger
    ```sh
    kubectl run msa-pinger --image=shelleg/msa-pinger:latest --env="API_URL=msa-api:8080" --env="DEBUG=true" --dry-run -o yaml > msa-pinger.yml
    ```
    **Explained:**

    1. `--env="API_URL=http://msa-api:8080"` could be using the `MSA_API_SERVICE_HOST` and `MSA_API_SERVICE_PORT` to construct the `API_URL` variable which is expected to be set by the **msa-pinger** service.
    Considering we know we have a service names `msa-api` we could choose to assume that we have that info laying around ...

    As an example execute >
    ```sh
    kubectl exec -it `kubectl -n msa-demo get po | grep msa-pinger | awk '{print $1}'` -- printenv | grep MSA
    ```
    which should yield something like:
    ```sh
    API_URL=${MSA_API_SERVICE_HOST}:${MSA_API_SERVICE_PORT}
    MSA_API_SERVICE_HOST=100.68.245.88
    MSA_API_SERVICE_PORT=8080
    MSA_API_PORT=tcp://100.68.245.88:8080
    MSA_API_PORT_8080_TCP_PORT=8080
    MSA_API_PORT_8080_TCP_ADDR=100.68.245.88
    MSA_API_PORT_8080_TCP=tcp://100.68.245.88:8080
    MSA_API_PORT_8080_TCP_PROTO=tcp`
    ```
    Hence we can use these environment variables in our deployment ...
    It could look like somthing like the following:
    ```sh
    kubectl run msa-pinger --image=shelleg/msa-pinger:latest --env="API_URL=\${MSA_API_SERVICE_HOST}:\${MSA_API_SERVICE_PORT}" --env="DEBUG=true" --dry-run -o yaml > msa-pinger.yml
    ```

    2. `--env="DEBUG=true"` by defult there will be no log unless this environment variable is set so I guess this also shows how to pass an arbitrary environment variable to a pod (via deployment).

    So if we replace our `msa-api` and `8080` with the environment vars we expect to have present `MSA_API_SERVICE_HOST` and `${MSA_API_SERVICE_PORT}` our deployment should look like the following:
    which looks like:
    ```yaml
    apiVersion: apps/v1beta1
    kind: Deployment
    metadata:
      creationTimestamp: null
      labels:
        run: msa-pinger
      name: msa-pinger
    spec:
      replicas: 1
      selector:
        matchLabels:
          run: msa-pinger
      strategy: {}
      template:
        metadata:
          creationTimestamp: null
          labels:
            run: msa-pinger
        spec:
          containers:
          - env:
            - name: API_URL
              value: ${MSA_API_SERVICE_HOST}:${MSA_API_SERVICE_PORT}
            - name: DEBUG
              value: "true"
            image: shelleg/msa-pinger:latest
            name: msa-pinger
            resources: {}
    status: {}
    ```
    note the `- env:` above.

    #### 2.5 Create deployment for msa-poller
    ```sh
    kubectl run msa-poller --image=shelleg/msa-poller:latest --env="API_URL=\${MSA_API_SERVICE_HOST}:\${MSA_API_SERVICE_PORT}" --dry-run -o yaml > msa-poller.yml
    ```
    which yields:
    ```yaml
    apiVersion: apps/v1beta1
    kind: Deployment
    metadata:
      creationTimestamp: null
      labels:
        run: msa-poller
      name: msa-poller
    spec:
      replicas: 1
      selector:
        matchLabels:
          run: msa-poller
      strategy: {}
      template:
        metadata:
          creationTimestamp: null
          labels:
            run: msa-poller
        spec:
          containers:
          - env:
            - name: API_URL
              value: ${MSA_API_SERVICE_HOST}:${MSA_API_SERVICE_PORT}
            image: shelleg/msa-poller:latest
            name: msa-poller
            resources: {}
    status: {}
    ```
  ### 3. Deploy to kubernetes

    Considering we now have all we need to deploy our demo-app let's use `kubectl` to deploy our manifests like so:

    ```sh
    kubectl create -f msa-demo-ns.yml
    kubectl create -n msa-demo -f redis.yml
    kubectl create -n msa-demo -f msa-api.yml
    kubectl create -n msa-demo -f msa-pinger.yml -f msa-poller.yml
    ```
    This would yield:

    ```sh
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
    ```sh
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
    kubectl delete namespace msa-demo
    ```
    This could take a while ...
    Run `kubectl get pod -l run` until it yield `No resources found.`
    or use: `kubectl get pod -l run -w` until you get `No resources found.`
