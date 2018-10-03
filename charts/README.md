## Converting Docker Compose to Helm chrats
W've created `helm` branch to coperate....
Just checkout and see  

We are working in __charts__ directory....  

We've started from ___msa-api___ chart which have __redis__ dependency.

__Redis__ receives it's _tests_ values from `redis_values.yaml`.
these values are transferred to dependent _redis_ chart from the parent _msa-api_.
