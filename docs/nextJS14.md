# NextJS 14

## Migration 

- main doc: https://nextjs.org/docs/pages/building-your-application/upgrading/app-router-migration
- must watch: https://www.youtube.com/watch?v=YQMSietiFm0&ab_channel=LeeRobinson


## To know

- New Metadata that replace Head: https://nextjs.org/docs/app/building-your-application/optimizing/metadata


## TODO 

- check Suspense
- check special files: https://nextjs.org/docs/app/building-your-application/routing#file-conventions


## Ticket to create 

- Migrate service to DB
    - everytime we create/edit one service, it's first saved in the DB and then synced onchain (async process?)
        - we need to find an easy to handle edge case (tx that failed)
            - add a simulate sync to confirm it will pass 
            - create in DB a tx table that will store the tx data, hash and the status
            - handle the tx async and retry mechanism
            - add on frontend a way to see the tx status
            - be optimistic and upate the frontend directly after DB save
    - allow owner to remove a service on his BP 
    - allow owner to highlist a service on his BP
- This same system will be applied for all entities that got offchain data: 
    - User profile
    - Proposal
    - Review 
- have one file by entity for api request and db request
    - + split frontend api query and backend db query clearly
    - remove all unused functions in actions.ts / request.ts
- rename builderPlace > platform
- Define best practices for everything
    - code architecture / folder organisation 
    - hooks creation & usage 
    - react query 
    - API 
    - loading management 
    - error management (frontend / backend)
    - form
    