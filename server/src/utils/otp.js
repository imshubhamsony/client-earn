import speakeasy from 'speakeasy';

const OTP_DIGITS = 6;
const OTP_VALID_SECONDS = 600; // 10 min

export function generateOTP() {
  return speakeasy.totp({
    secret: speakeasy.generateSecret().base32,
    digits: OTP_DIGITS,
    step: OTP_VALID_SECONDS,
  });
}

export function verifyOTP(token, secret) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    digits: OTP_DIGITS,
    step: OTP_VALID_SECONDS,
    window: 1,
  });
}

// Simple numeric OTP for email (store in DB with expiry)
export function generateNumericOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export function isOTPExpired(expiresAt) {
  return !expiresAt || new Date() > new Date(expiresAt);
}
