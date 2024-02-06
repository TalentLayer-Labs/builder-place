# Users 

## Onboarding

We have 4 types of user on Builder Place.

| User Type | Description | Onboarding From |
| --- | --- | --- |
| Owner | A user that owned a platform | Default domain |
| Collaborator | A user added by a platform owner to help him administrate it | The platform custom domain |
| Worker | A user that is searching for work | Could be both |
| Hirer | A user that is want to post on a BuilderPlace | The platform custom domain |

### Owner onboarding


- From: BuilderPlace homepage
- Step 1: Complete the "create your profile" form 
    - It creates the user in DB
    - And create a TLid linked to the address if the user don't have one yet
    - Note: this step is automatically skipped if the user already have a TLid
- Step 2: Complete the "create your platform" form
    - Create the platform in DB
    - Create TLPlatformId owned by the address
- On success: 
    - Redirect to the new platform dashboard


### Collaborator onboarding

- From: BuilderPlace collaborators page
- Step 1: The owner complete the "add a collaborator" form
    - It creates the user in DB (status pending as we didn't confirmed the signature)
    - Send him an email with a link to the "create your profile" form
    - And create a TLid linked to the address if the user don't have one yet
- Step 2: The owner delegate onchain right to the address TLID
- Step 3: The user click on the link and complete the "create your profile" form
    - It update the user in DB (status confirmed)
    - And create a TLid linked to the address if the user don't have one yet
- On success: 
    - Redirect to the platform dashboard


### Worker onboarding

- From: 
    - case 1: BuilderPlace worker page
    - case 2: if a worker want to apply to a job
- Step 1: Complete the "create your profile" form 
    - It creates the user in DB
    - And create a TLid linked to the address if the user don't have one yet
    - Note: this step is automatically skipped if the user already have a TLid
- On success: 
    - Case 1: Redirect to his dashboard
    - Case 2: Redirect to the job page


### Hirer onboarding

- From a given BuilderPlace, i the hirer want to post a job
- Step 1: Complete the "create your profile" form 
    - It creates the user in DB
    - And create a TLid linked to the address if the user don't have one yet
    - Note: this step is automatically skipped if the user already have a TLid
- On success: Redirect to the create job page

## TalentLayerId

- A TalentLayerId is a unique identifier that is linked to an address
- We will mint the TLid for the user automatically during onboarding. 
- In case the user already have a TLid, we will link it to his profile in DB
- Important: In case something goes wrong, the user can create a TLid manually from the dashboard or anytime he try to execute his first onchain action