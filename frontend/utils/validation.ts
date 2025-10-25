// Validation utility functions for forms
export const validators = {
  // Email validation
  email: (email: string): { isValid: boolean; error?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return { isValid: false, error: 'Email is required' };
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    return { isValid: true };
  },

  // Phone validation
  phone: (phone: string): { isValid: boolean; error?: string } => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phone) {
      return { isValid: false, error: 'Phone number is required' };
    }
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return { isValid: false, error: 'Please enter a valid phone number' };
    }
    return { isValid: true };
  },

  // Password validation
  password: (password: string): { isValid: boolean; error?: string } => {
    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }
    if (password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { isValid: false, error: 'Password must contain uppercase, lowercase, and number' };
    }
    return { isValid: true };
  },

  // Name validation
  name: (name: string): { isValid: boolean; error?: string } => {
    if (!name) {
      return { isValid: false, error: 'Name is required' };
    }
    if (name.length < 2) {
      return { isValid: false, error: 'Name must be at least 2 characters' };
    }
    if (name.length > 50) {
      return { isValid: false, error: 'Name cannot exceed 50 characters' };
    }
    return { isValid: true };
  },

  // OTP validation
  otp: (otp: string): { isValid: boolean; error?: string } => {
    if (!otp) {
      return { isValid: false, error: 'OTP is required' };
    }
    if (!/^\d{6}$/.test(otp)) {
      return { isValid: false, error: 'OTP must be exactly 6 digits' };
    }
    return { isValid: true };
  }
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>&"']/g, '');
};