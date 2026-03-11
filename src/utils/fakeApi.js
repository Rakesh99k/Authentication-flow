// fake API helpers that simulate network delay and errors
// used by signup and otp pages for demonstration purposes
export function signupApi({ name, email, password }) {
  return new Promise((resolve, reject) => {
    const delay = 1500 + Math.random() * 500
    setTimeout(() => {
      // simulate network failure ~10%
      if (Math.random() < 0.1) return reject({ message: 'Network error' })
      // simulate existing email when email contains "exists"
      if (typeof email === 'string' && email.toLowerCase().includes('exists')) {
        return reject({ message: 'Email already exists' })
      }
      if (typeof password !== 'string' || password.length < 6) {
        return reject({ message: 'Invalid payload' })
      }
      // success case returns user object
      resolve({ success: true, user: { name, email } })
    }, delay)
  })
}

export function verifyOtpApi(code) {
  return new Promise((resolve, reject) => {
    const delay = 800 + Math.random() * 700
    setTimeout(() => {
      // 10% bloom of network errors
      if (Math.random() < 0.1) return reject({ message: 'Network error' })
      // only '123456' is treated as valid code for demo
      if (code === '123456') return resolve({ success: true })
      return reject({ message: 'Invalid OTP' })
    }, delay)
  })
}
