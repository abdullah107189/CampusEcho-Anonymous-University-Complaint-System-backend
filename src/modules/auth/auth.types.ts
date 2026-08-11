export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IVerifyOTPRequest {
  email: string;
  otp: string;
}

export interface IResendOTPRequest {
  email: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  token: string;
}