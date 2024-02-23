# Platforms
aka Builer Place (aim to rename it to Platform)

## Onboarding

We have 2 types of platform on Builder Place that are different due to their posting jobPostingConditions

| Platform Type | allowPosts | Description | Fees |
| --- | --- | --- | --- |
| Market Place | TRUE | User create his own market where he can allow others to post following his conditions. He can define his own fees rules. | Custom |
| Company Place | FALSE | User create a place only for his own posts | Default |

### JobPostingConditions

```javascript
interface JobPostingConditions {
    allowPosts: boolean;
    conditions?: PostingCondition[];
}

type PostingCondition = NFTCondition | TokenCondition;

interface NFTCondition {
    type: 'NFT';
    address: string; // Address of the NFT contract
}

interface TokenCondition {
    type: 'Token';
    address: string; // Address of the token contract
    minimumAmount: number; // Minimum amount of tokens required
}
```

### Market Place

- TalentLayer: this one got his own TalentLayerPlatformId. It will allow to customize fees...
- Job posting conditions: 
    - Public: allow others
    - Condition: allow only someone who owns an NFT or a certain amount of tokens


### Company Place

- TalentLayer: this one use the default builderPlace TalentLayerPlatformId.


## TODO

- [x] update db schema, add jobPostingConditions
- Complete new onboarding with step 2, create platform
    - ask for the minimum filled required:
        - name
        - subdomain
        - baseline?
        - logo
        - jobPostingConditions
    - everything created after one step
    - onSubmit
        - mint platformId 
        - sign message 
        - post everything to DB
        - Redirect to new domain
- Add Post job in the menu for everyone if jobPostingStrategy = allow others
    - Display the conditons on the post page
    - Display form or an access denied message depending on current wallet connected
- Add a form to update fees (but only accessible on superadmin for now)
- Clean old code
- Rename to platform?