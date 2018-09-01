# get the 0.10.0 version so this lab is repoducible ...
helm fetch --version=0.10.0 stable/chaoskube

# untar
tar xvf chaoskube-0.10.0.tgz

# show default values
helm template ./chaoskube --name chaoskube

# --debug
helm template ./chaoskube --name chaoskube --debug

# use --set or use my-values.yaml ...
helm template --set rbac.create=true --debug --name ./chaoskube

# show the installed charts with helm cli
helm list

# show the installed chart with kubectl and labels
kubectl -n default get pods -l='release=chaoskube'

# cleanup
# helm delete chaoskube --purge
