## Planning and Running a deployment of a state-full app on Kubernetes

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
    - add some configuration to redis via config map in redis.yml
    - create msa-api vi msa-api.yml
    - create msa-pinger vi msa-pinger.yml
    - create msa-poller vi msa-poller.yml


  #### 2. Generate Manifests
  Once you've done this part your current working directory should include:
  - msa-demo-ns.yml
  - msa-api.yml
  - msa-pinger.yml
  - msa-poller.yml

  Our deployment sequence consists of `redis` and `redis service` + a `configMap` and `command` customization to rell redis to use that redis.conf file populated by the configmap.

    **please note:**
    - see the provided ./redis/redis.conf example

    ##### 2.1 create redis configMap
    ```sh
    kubectl create cm --from-file=./redis/redis.conf redis.conf --dry-run -o yaml > redis-configmap.yml
    ```
    should yield:
    ```yaml
    apiVersion: v1
    data:
      redis.conf: |
        loglevel debug
    kind: ConfigMap
    metadata:
      creationTimestamp: null
      name: redis.conf
    ```

    apply the configmap:
    ```sh
    kubectl create -f redis-configmap.yml
    ```
    should yield:
    ```sh
    configmap/redis-configmap created
    ```

    Examine our configmap:

    ```sh
    kubectl get cm --export -o yaml
    ```
    ```yaml
    apiVersion: v1
    items:
    - apiVersion: v1
      data:
        redis.conf: |
          loglevel debug
      kind: ConfigMap
      metadata:
        creationTimestamp: 2018-08-27T22:48:52Z
        name: redis-configmap
        namespace: msa-demo
        resourceVersion: "44344"
        selfLink: /api/v1/namespaces/msa-demo/configmaps/redis-configmap
        uid: 5e9391f6-aa4b-11e8-ba64-0800272a8f58
    kind: List
    metadata:
      resourceVersion: ""
      selfLink: ""
    ```
    ##### 2.2 Adjust our redis Deployment to use the config map:

    First declare the `volumeMounts` in the container spec like so:

    ```yaml
    spec:
      containers:
      ...
    volumeMounts:
      - mountPath: /usr/local/etc/redis/
        name: config

    ```

    Secondly mount the config map on to the config key like so:

    ```yaml
    ...
    volumes:
    - name: config
      configMap:
        name: redis-configmap
        items:
        - key: redis.conf
          path: redis.conf
    ...
    ```
    Now let's include the config map we created earlier in our deployment like so:

    ```yaml
    cat <<EOF > redis.yml
    apiVersion: v1
    kind: Service
    metadata:
      creationTimestamp: null
      name: redis
    spec:
      ports:
      - port: 6379
        protocol: TCP
        targetPort: 6379
      selector:
        run: redis
    status:
      loadBalancer: {}
    ---
    apiVersion: apps/v1beta1
    kind: Deployment
    metadata:
      creationTimestamp: null
      labels:
        run: redis
      name: redis
    spec:
      replicas: 1
      selector:
        matchLabels:
          run: redis
      strategy: {}
      template:
        metadata:
          creationTimestamp: null
          labels:
            run: redis
        spec:
          containers:
          - image: sameersbn/redis:4.0.9-1
            name: redis
            ports:
            - containerPort: 6379
            resources: {}
            volumeMounts:
              - mountPath: /usr/local/etc/redis/
                name: config
            command: [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
          volumes:
          - name: config
            configMap:
              name: redis-configmap
              items:
              - key: redis.conf
                path: redis.conf
    status: {}
      EOF
    ```

    See how we override the docker command in order to use our new configureation file:
    ```yaml
    command: [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
    ```

    Let's launch redis with the configmap like so:
    ```sh
    kubectl create -n msa-demo -f redis.yml
    ```

    #### 2.3 Launch the rest of our apps
    Create msa-api, msa-pinger, msa-poller like so:
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
    ##### 4.1 validate configMap on running pod

    ##### 4.1 validate pods
    Get all pods with label "run" (the default when we ran kubectl `run`)

    ```sh
    kubectl get po -l run -n msa-demo
    ```
    should yield:
    ```
    NAME                          READY     STATUS    RESTARTS   AGE
    msa-api-6cb7c9c6bf-s8cd8      1/1       Running   0          37m
    msa-pinger-599f4c5bf9-gpvd6   1/1       Running   0          37m
    msa-poller-7cfcb4c8d-8hf2t    1/1       Running   0          33s
    redis-fd79db4cc-pv225         1/1       Running   0          33m
    ```

    ##### 4.2 validate configMap is loaded and being used ...
    See 3rd line int the output of the command:

    ```sh
    kubectl exec -it `kubectl get pod | grep redis | awk '{print $1}'` cat /usr/local/etc/redis/redis.conf
    ```
    which yields:
    ```sh
    loglevel debug
    ```
    which we can see is loaded in the `redis` pod log below:

    ```sh
    1:C 27 Aug 22:50:52.876 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
    1:C 27 Aug 22:50:52.876 # Redis version=4.0.11, bits=64, commit=00000000, modified=0, pid=1, just started
    1:C 27 Aug 22:50:52.876 # Configuration loaded
    ```

    #### 5. Cleanup
    ```sh
    kubectl delete deployments. -n msa-demo -l run
    kubectl delete svc redis
    kubectl delete svc msa-api
    kubectl delete pvc redis-data
    kubectl delete pv redis-data
    kubectl delete cm redis-configmap
    kubectl delete namespace msa-demo
    ```
    This could take a while ...
    Run `kubectl get deploy -l run` until it yield `No resources found.`

    or use: `kubectl get pod -l run -w` until you get `No resources found.`
