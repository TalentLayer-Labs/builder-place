# Delegates 

## Overview

Delegation is an action of allowing a used to execute on-chain transactions on your behalf.
TalentLayer implemented delegation on the TalentLayerId contract, which allows a user to add ETH addresses as delegates, which will have on-chain rights to execute certain functions on behalf of the user.


On BuilderPlace, we use delegation for 2 different cases:

 - **CollaboratorDelegate**: A platform owner can add other users as sub-admins for the platform, which are called Collaborators. When adding a collaborator, the owner will add the collaborator's address as delegate to his own TalentLayer Id, so that the collaborator can create services or reviews using the owner's Id.
 - **BackendDelegate**: A user can add our backend as a delegate in to let it execute transactions on his behalf, and save gas fees.

### Collaborator Delegate

From: BuilderPlace collaborators page
The new collaborator must have a BuilderPlace profile and TalentLayer id

- The Owner inputs the address of the new collaborator
- Its address will be added on-chain to the Platform owner's delegates
- The Owner can then remove a collaborator, its address will be removed on-chain


### Backend Delegate

IF the user does not have a TalentLayer Id yet:
- From: Onboarding
    - When the user registers as a Platform User, if the NEXT_PUBLIC_ACTIVATE_DELEGATE_MINT environment variable is set to true, then if he does not have a TalentLayer Id yet, it will be minted and transferred by our backend to the user, and our backend will add its address as a delegate of the user.

IF the user already has a TalentLayer Id during onboarding, it will not be activated at this step.
- From: Dashboard
    - He will have the possibility to add our backend as a delegate


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