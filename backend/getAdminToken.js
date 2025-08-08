const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const email = 'ryanhallford.br@gmail.com'; // Use your actual admin email
const password = 'campabbey4ever';         // Use your actual admin password

async function getToken() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok && data.token) {
      console.log('Token:', data.token);
    } else {
      console.error('Error:', data.error || data);
    }
  } catch (err) {
    console.error('Request failed:', err);
  }
}

getToken();