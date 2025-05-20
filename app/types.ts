import { User } from 'firebase/auth';

interface AdditionalUserInfo {
  isNewUser: boolean;
  providerId: string;
  profile: Record<string, unknown>; // Using Record<string, unknown> as profile is an empty object
}

export interface AuthObject {
  user: User;
  credential: null; // Can be more specific if other credential types are possible
  operationType: string;
  additionalUserInfo: AdditionalUserInfo;
}

