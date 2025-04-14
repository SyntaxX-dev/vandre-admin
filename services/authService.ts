import { setCookie } from 'nookies';

export async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      },
    });

    setCookie(null, 'token', '', {
      maxAge: -1,
      path: '/',
    });

    window.location.href = '/signin';
  } catch (error) {
    console.error('Failed to log out:', error);
    throw error;
  }
}
