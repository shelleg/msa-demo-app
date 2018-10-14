## Converting Docker Compose to Helm chrats
W've created `helm` branch to coperate....
Just checkout and see  

We are working in __charts__ directory....  

We've started from ___msa-api___ chart which have __redis__ dependency.

__Redis__ receives it's _tests_ values from `redis_values.yaml`.
these values are transferred to dependent _redis_ chart from the parent _msa-api_.

## Final architecture

All components will have their own charts since they are microservices.  
Entire solution, called ___msa-demo-app___ is "composed solution" built from microservices, this solution will have
the helm chatr only, no code there.  
When ___msa-demo-app___ is deployed, it takes care to bring up all relevant components:  
* __msa-api__ with healthchecks (liveness and readiness checks were implemented) starts with dependent `redis` component and becomes ready once all healthchecks are ok.
* __msa-pinger__ service has no dependencies (healthcheck - liveness only)
* __msa-poller__ service has no dependencies (healthcheck - liveness only)

Each chart has it's own default values inside the chart. In order to supply different values (for staging, prod, lab etc.) there is local (POC) folder (which in a real scenario should be managed in another repository - TBD.).  
Folders structure will looks as follows:

```bash
charts/env-values/
├── msa-api
│   ├── lab
│   ├── prod
│   └── uat
├── msa-demo-app
│   ├── lab
│   ├── prod
│   └── uat
├── msa-pinger
│   ├── lab
│   │   └── values.yaml
│   ├── prod
│   └── uat
└── msa-poller
    ├── lab
    ├── prod
    └── uat
```

So it will be possible to "rule the world" without changing charts.
