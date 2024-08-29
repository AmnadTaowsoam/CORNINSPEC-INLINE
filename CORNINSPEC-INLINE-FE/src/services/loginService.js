// loginService.js

export async function login(username, password) {
    const response = await fetch(`${import.meta.env.VITE_REACT_APP_USER_ENDPOINT}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password
      })
    });
  
    if (!response.ok) {
      throw new Error('Login failed');
    }
  
    const data = await response.json();
    return data;
  }