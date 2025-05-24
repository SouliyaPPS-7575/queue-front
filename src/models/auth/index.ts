export interface LoginForm {
  identity: string;
  password: string;
}

export interface SignupForm {
  username: string;
  name?: string;
  phone_number: string;
  email: string;
  emailVisibility?: boolean;
  province: string;
  district: string;
  village: string;
  password: string;
  passwordConfirm: string;
  otp?: string;
}

export interface VerifyEmail {
  avatar: string
  collectionId: string
  collectionName: string
  created: string
  email: string
  emailVisibility: boolean
  id: string
  name: string
  phone_number: string
  updated: string
  username: string
  verified: boolean
}
