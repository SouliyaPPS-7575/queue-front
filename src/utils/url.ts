export const isClient = typeof window !== 'undefined'; // Check if we're on the client-side

// ✅ Environment Check
export const isDevelopment = import.meta.env.MODE === 'development';
