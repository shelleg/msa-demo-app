Installing HELM
===============

## Install helm-client on your workstation

* [OSX](https://storage.googleapis.com/kubernetes-helm/helm-v2.9.1-darwin-amd64.tar.gz) either `brew install kubernetes-helm` or get it [here](https://storage.googleapis.com/kubernetes-helm/helm-v2.9.1-darwin-amd64.tar.gz) [OSX](https://storage.googleapis.com/kubernetes-helm/helm-v2.9.1-darwin-amd64.tar.gz)
* [LINUX](https://storage.googleapis.com/kubernetes-helm/helm-v2.9.1-linux-amd64.tar.gz)
* [WINDOWS](https://storage.googleapis.com/kubernetes-helm/helm-v2.9.1-windows-amd64.zip)

Add the executable to your PATH.




## Deploy tiller
**Please note:** You can choose to run the `./deploy.sh` shell script provided here in which does all the instructions listed below.
1. create `helm-init.yml`

   **Please note:** `./helm-init.yml` is provided here-in

   As a best practice we will be is to save the yaml config in `helm-init.yml` like so:

   `helm init --service-account helm --dry-run --debug > helm-init.yml`

2. create sufficient RBAC rules -> service account and cluster role-binding

   **Please note:** `helm-rbac-cluster-wide.yml` is provided here-in

   In the following yaml we create a serviceaccount named `helm` and a clusterrolebindings named helm which takes after cluster-admin:

  ```yaml
  apiVersion: v1
  kind: ServiceAccount
  metadata:
    name: helm
    namespace: kube-system
  ---
  apiVersion: rbac.authorization.k8s.io/v1beta1
  kind: ClusterRoleBinding
  metadata:
    name: helm
  roleRef:
    apiGroup: rbac.authorization.k8s.io
    kind: ClusterRole
    name: cluster-admin
  subjects:
    - kind: ServiceAccount
      name: helm
      namespace: kube-system
  ```
  Save the above to file:
  ```
  cat <<EOF > helm-rbac-cluster-wide.yml2
  apiVersion: v1
  kind: ServiceAccount
  metadata:
    name: helm
    namespace: kube-system
  ---
  apiVersion: rbac.authorization.k8s.io/v1beta1
  kind: ClusterRoleBinding
  metadata:
    name: helm
  roleRef:
    apiGroup: rbac.authorization.k8s.io
    kind: ClusterRole
    name: cluster-admin
  subjects:
    - kind: ServiceAccount
      name: helm
      namespace: kube-system
  EOF
  ```

  In order to apply run:

  `kubectl create -f helm-rbac-cluster-wide.yml`

3. Ready to helm ...

  So once we have `helm-init.yml` & `helm-rbac-cluster-wide.yml`

  `kubectl create -f helm-init.yml -f helm-rbac-cluster-wide.yml`

  Which should yield something like:
  ```
  serviceaccount/helm created
  clusterrolebinding.rbac.authorization.k8s.io/helm created
  deployment.extensions/tiller-deploy created
  service/tiller-deploy created
  ```
4. See helm is "healthy"

   run `helm version` which should yield something like (depending on the version):
   ```
   Client: &version.Version{SemVer:"v2.9.1", GitCommit:"20adb27c7c5868466912eebdf6664e7390ebe710", GitTreeState:"clean"}
Server: &version.Version{SemVer:"v2.9.1", GitCommit:"20adb27c7c5868466912eebdf6664e7390ebe710", GitTreeState:"clean"}
   ```

**In the next lab we will be deploying charts via tiller**

## cleanup
**Please use for general knowledge or end of lab if your'e not continuing to the next ...**

**So** If your done with `helm` or just need to cleanup this lab use the `cleanup.sh` provided here-in.

1. remove Deployment

   Get the deployment name:
   `kubectl get deployments --all-namespaces | grep 'helm\|tiller' | awk '{print $2}'`

   `kubectl` to delete the deployment:
   ```
   kubectl delete deployment `kubectl get deployments --all-namespaces | grep 'helm\|tiller' | awk '{print $2}'` 2> /dev/null`
   ```

2. remove Service

   Get the deployment name:
   `kubectl get svc | grep 'helm\|tiller' | awk '{print $1}'`

   `kubectl` to delete the service:
   ```
   kubectl delete svc `kubectl get svc | grep 'helm\|tiller' | awk '{print $1}'` 2> /dev/null
   ```

3. remove ServiceAccount

   Get the ServiceAccount name:

   `kubectl get serviceaccounts --all-namespaces | grep 'helm\|tiller' | awk '{print $2}'``

   `kubectl` to delete the ServiceAccount:
   ```
   `kubectl delete sa `kubectl get serviceaccounts --all-namespaces | grep 'helm\|tiller' | awk '{print $2}'` 2> /dev/null`
   ```

4. remove ClusterRoleBinding

   Get the ClusterRoleBinding name:

   `kubectl get clusterrolebindings.rbac.authorization.k8s.io --all-namespaces | grep 'helm\|tiller' | awk '{print $1}'`

   `kubectl` to delete the ClusterRoleBinding:
   ```
   kubectl delete clusterrolebindings.rbac.authorization.k8s.io `kubectl get clusterrolebindings.rbac.authorization.k8s.io --all-namespaces | grep 'helm\|tiller' | awk '{print $1}'` 2> /dev/null
   ```

**In the next lab we will be deploying charts via tiller**
