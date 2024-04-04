# Test V2 Workflow

Gm! Before getting started, copy this page and title it "testV2-yourname.md" (EX: "testV2-kirsten.md"), and keep it in this folder. This will help track who's tested what. Then, as you progress, in your own document please check off the things you've tested. LFG!


## Workflow to test

without delegation turned on
- [ ] As a platform entreprener, i can... 
     - [X] create an account
     - [X] create my platform
     - [X] setup my skin
     - [ ] configure to allow others to post if they have an NFT 
          - [ ] a third-party hirer can actuallly post on the platform with this condition
               - [X] As a hirer I can see that I have the ability to post and I can fill out the form
               - [ ] I can make the post (BLOCKED: Not sure why, but endless load https://trello.com/c/dBLzo0EW/144-bug-endless-load-on-job-posting-as-a-hirer-using-someone-elses-platform)
     - [ ] allow others to post if they have a token
          - [X] platfom allowed me to configure this
          - [ ] as a third-party hirer I posted on this platform with this condition (No: blocked by 2 issues, endless load and gating issue)
               - [X] As a hirer I can see that I have the ability to post and I can fill out the form
               - [ ] I can make the post (BLOCKED: Not sure why, but endless load)
     - [X] as a platform I can update my profile information
     - [X] as a platform I can verify my email and activate delegation
     - [X] as a platform I can post a job
     - [X] approve a proposal (Blocked: Hirer can't validate propo - endless load)
     - [ ] pay out a freelancer (blocked by other)
     - [ ] as a platform I can recieve email notifications on important steps (question - when should i get emails?)
- [ ] As a freelancer,
     - [X] i can create an account
     - [X] post a proposalr
     - [ ] receive my first payment (Blocked: Hirer can't validate propo - endless load)
     - [X] as a freelancer I can update my profile information
     - [X] as a freelancer I can verify my email and activate delegation 
          - [X] email activated
          - [X] delegation works?
- [ ] As a hirer,
     - [X] I can create an account
     - [ ] post a job (No: blocked by 2 issues, endless load and gating issue)
     - [ ] approve a proposal (Blocked: Hirer can't validate propo - endless load)
     - [ ] pay out a freelancer (blocked by other)
     - [X] as a hirer I can update my profile information
     - [X] as a hirer I can verify my email and activate delegation
          - [X] email activated
          - [X] delegation works?  (no it does not: https://trello.com/c/7CuHSbiq/146-delegation-not-initiated-after-i-have-approved-email
*For now collaborator can't be added, this part is not ready

with delegation turned on
- [X] As a platform entreprener, i can... 
     - [X] setup my skin
     - [X] as a platform I can update my profile information
- [ ] As a freelancer,
     - [ ] post a proposal and receive my first payment 
     - [X] as a freelancer I can update my profile information
- [ ] As a hirer,
     - [ ] I can create an account
     - [ ] post a job
     - [ ] approve a proposal (sending payment to escrow)
     - [ ] pay out a freelancer
     - [X] as a hirer I can update my profile information
*For now collaborator can't be added, this part is not ready
   

## Trello ticket model

**Context**

- url: 
- what role on bp (worker, collaborator, owner, hirer): 
- Jam.dev link (includes console & network error):
- with or without delegate: 
- which user:
    - wallet:
    - email:
    - had an TalentLayerId before, or new:
