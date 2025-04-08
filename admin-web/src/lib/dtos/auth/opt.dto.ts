
export type CreateOtpDto = {
  email: string;
  
  type: string;
}

export type VerifyOtpDto = {
  email: string;

  otpCode: string;

  type: string;
}