// src/lib/validation.js
// Input validation and sanitization utilities
// SECURITY: Prevents XSS, injection, and data integrity issues

/**
 * Validate event data before submission
 * OWASP A03: Injection, A04: Insecure Design
 */
export function validateEvent(data) {
  const errors = {};

  // Title validation
  if (!data.title?.trim()) {
    errors.title = 'Event title is required';
  } else if (data.title.length > 255) {
    errors.title = 'Event title must be under 255 characters';
  } else if (!/^[a-zA-Z0-9\s\-&',()]+$/.test(data.title)) {
    errors.title = 'Event title contains invalid characters';
  }

  // Description validation
  if (data.description?.length > 5000) {
    errors.description = 'Description must be under 5000 characters';
  }
  if (data.description?.includes('<') || data.description?.includes('>')) {
    errors.description = 'HTML tags not allowed in description';
  }

  // Location validation
  if (!data.location?.trim()) {
    errors.location = 'Location is required';
  } else if (data.location.length > 200) {
    errors.location = 'Location must be under 200 characters';
  }

  // Date validation
  if (!data.event_date) {
    errors.event_date = 'Event date is required';
  } else {
    const eventDate = new Date(data.event_date);
    const today = new Date();
    if (eventDate < today) {
      errors.event_date = 'Event date cannot be in the past';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate opportunity data before submission
 * OWASP A03: Injection, A04: Insecure Design
 */
export function validateOpportunity(data) {
  const errors = {};

  // Title validation
  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length > 255) {
    errors.title = 'Title must be under 255 characters';
  }

  // Organization validation
  if (!data.organization?.trim()) {
    errors.organization = 'Organization is required';
  } else if (data.organization.length > 200) {
    errors.organization = 'Organization name must be under 200 characters';
  }

  // Description validation
  if (!data.description?.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.length > 5000) {
    errors.description = 'Description must be under 5000 characters';
  }
  if (data.description?.includes('<') || data.description?.includes('>')) {
    errors.description = 'HTML tags not allowed';
  }

  // Stipend validation (if applicable)
  if (data.stipend !== undefined && data.stipend !== null && data.stipend !== '') {
    const stipend = Number(data.stipend);
    if (isNaN(stipend)) {
      errors.stipend = 'Stipend must be a number';
    } else if (stipend < 0 || stipend > 500000) {
      errors.stipend = 'Stipend must be between 0 and 500,000';
    }
  }

  // Contact email validation
  if (data.contact_email) {
    if (!isValidEmail(data.contact_email)) {
      errors.contact_email = 'Invalid email format';
    }
  }

  // Duration validation
  if (!data.duration?.trim()) {
    errors.duration = 'Duration is required';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate email format
 * OWASP A07: Authentication Failures
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Sanitize user text input
 * OWASP A03: Injection (XSS prevention)
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove angle brackets (prevent HTML injection)
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize HTML (if needed for display)
 * OWASP A03: Injection (XSS prevention)
 */
export function sanitizeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html; // textContent escapes HTML
  return div.innerHTML;
}

/**
 * Validate file upload
 * OWASP A04: Insecure Design, A05: Security Misconfiguration
 */
export function validateFileUpload(file) {
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Size check
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size must be under 10 MB' };
  }

  // MIME type check
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, and WebP images allowed',
    };
  }

  // Extension check (for double verification)
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return {
      valid: false,
      error: 'File extension is not allowed',
    };
  }

  // MIME type vs extension match
  const typeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };

  if (typeMap[fileExtension] !== file.type) {
    return {
      valid: false,
      error: 'File extension does not match file type (possible spoofing)',
    };
  }

  // Filename validation (no special characters)
  if (!/^[a-zA-Z0-9\-_.]+$/.test(file.name)) {
    return {
      valid: false,
      error: 'Filename contains invalid characters',
    };
  }

  return { valid: true };
}

/**
 * Validate password strength
 * OWASP A07: Authentication Failures
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain a number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  return {
    valid: errors.length === 0,
    errors,
    score: Math.max(0, 5 - errors.length),
  };
}

/**
 * Escape user input for display in HTML
 * OWASP A03: Injection (XSS prevention)
 */
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Validate JSON data structure
 * OWASP A03: Injection
 */
export function validateJsonStructure(data, schema) {
  const errors = {};

  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key];

    if (rules.required && !value) {
      errors[key] = `${key} is required`;
      continue;
    }

    if (value && rules.type) {
      if (typeof value !== rules.type) {
        errors[key] = `${key} must be of type ${rules.type}`;
      }
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      errors[key] = `${key} must be at least ${rules.minLength} characters`;
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors[key] = `${key} must be under ${rules.maxLength} characters`;
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      errors[key] = `${key} format is invalid`;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export default {
  validateEvent,
  validateOpportunity,
  isValidEmail,
  sanitizeInput,
  sanitizeHtml,
  validateFileUpload,
  validatePasswordStrength,
  escapeHtml,
  validateJsonStructure,
};
