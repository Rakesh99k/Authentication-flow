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
      resolve({ success: true, user: { name, email } })
    }, delay)
  })
}

export function verifyOtpApi(code) {
  return new Promise((resolve, reject) => {
    const delay = 800 + Math.random() * 700
    setTimeout(() => {
      if (Math.random() < 0.1) return reject({ message: 'Network error' })
      if (code === '123456') return resolve({ success: true })
      return reject({ message: 'Invalid OTP' })
    }, delay)
  })
}
