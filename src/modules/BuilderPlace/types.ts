import { PreferredWorkType } from '../../types';

export interface UpdateBuilderPlace {
  subdomain: string;
  name: string | undefined;
  primaryColor: string | undefined;
  secondaryColor: string | undefined;
  ownerTalentLayerId: string | undefined;
  owners: string[] | undefined;
  status: string | undefined;
  cover: string | undefined;
  logo: string | undefined;
}

export interface UpdateBuilderPlaceDomain {
  subdomain: string;
  customDomain: string;
}

export interface SetBuilderPlaceOwner {
  subdomain: string;
  owners: string[];
  ownerTalentLayerId: string;
}

export enum DomainVerificationStatusProps {
  Valid = 'Valid Configuration',
  Invalid = 'Invalid Configuration',
  Pending = 'Pending Verification',
  NotFound = 'Domain Not Found',
  Error = 'Unknown Error',
}

export interface CreateBuilderPlaceAction {
  name: string;
  subdomain: string;
  primaryColor: string;
  secondaryColor: string;
  presentation: string;
  preferredWorkType: PreferredWorkType[];
  imageUrl: string;
}

export interface CreateBuilderPlaceProps {
  name: string;
  subdomain: string;
  primaryColor: string;
  secondaryColor: string;
  presentation: string;
  preferredWorkType: PreferredWorkType[];
  imageUrl: string;
}

export type IBuilderPlace = {
  id: Number;
  name: string;
  subdomain: string;
  customDomain: string | null;
  logo: string;
  cover: string;
  primaryColor: string;
  secondaryColor: string;
  presentation: string;
  owners: string[];
  ownerTalentLayerId: string;
  status: 'Validated' | 'Pending';
  preferredWorkType: PreferredWorkType[];
  imageUrl: string;
};

// From https://vercel.com/docs/rest-api/endpoints#get-a-project-domain
export interface DomainResponse {
  name: string;
  apexName: string;
  projectId: string;
  redirect?: string | null;
  redirectStatusCode?: (307 | 301 | 302 | 308) | null;
  gitBranch?: string | null;
  updatedAt?: number;
  createdAt?: number;
  /** `true` if the domain is verified for use with the project. If `false` it will not be used as an alias on this project until the challenge in `verification` is completed. */
  verified: boolean;
  /** A list of verification challenges, one of which must be completed to verify the domain for use on the project. After the challenge is complete `POST /projects/:idOrName/domains/:domain/verify` to verify the domain. Possible challenges: - If `verification.type = TXT` the `verification.domain` will be checked for a TXT record matching `verification.value`. */
  verification: {
    type: string;
    domain: string;
    value: string;
    reason: string;
  }[];
}

// From https://vercel.com/docs/rest-api/endpoints#get-a-domain-s-configuration
export interface DomainConfigResponse {
  /** How we see the domain's configuration. - `CNAME`: Domain has a CNAME pointing to Vercel. - `A`: Domain's A record is resolving to Vercel. - `http`: Domain is resolving to Vercel but may be behind a Proxy. - `null`: Domain is not resolving to Vercel. */
  configuredBy?: ('CNAME' | 'A' | 'http') | null;
  /** Which challenge types the domain can use for issuing certs. */
  acceptedChallenges?: ('dns-01' | 'http-01')[];
  /** Whether or not the domain is configured AND we can automatically generate a TLS certificate. */
  misconfigured: boolean;
}

// From https://vercel.com/docs/rest-api/endpoints#verify-project-domain
export interface DomainVerificationResponse {
  name: string;
  apexName: string;
  projectId: string;
  redirect?: string | null;
  redirectStatusCode?: (307 | 301 | 302 | 308) | null;
  gitBranch?: string | null;
  updatedAt?: number;
  createdAt?: number;
  /** `true` if the domain is verified for use with the project. If `false` it will not be used as an alias on this project until the challenge in `verification` is completed. */
  verified: boolean;
  /** A list of verification challenges, one of which must be completed to verify the domain for use on the project. After the challenge is complete `POST /projects/:idOrName/domains/:domain/verify` to verify the domain. Possible challenges: - If `verification.type = TXT` the `verification.domain` will be checked for a TXT record matching `verification.value`. */
  verification?: {
    type: string;
    domain: string;
    value: string;
    reason: string;
  }[];
}

export interface OrganizationProps {
  name: string;
  about: string;
  jobType: PreferredWorkType;
  imageUrl: string;
}
