const axios = require('axios');

async function testApi() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:3101/api/v1/auth/login', {
      email: 'test@test.com',
      password: 'password'
    });
    const token = loginRes.data.accessToken;
    console.log('Login successful. Token:', token.substring(0, 20) + '...');

    // 2. Get Current User
    console.log('Fetching /users/me...');
    const meRes = await axios.get('http://localhost:3101/api/v1/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('User:', meRes.data.email);

    // 3. Get Workspaces
    console.log('Fetching /workspaces...');
    const workspacesRes = await axios.get('http://localhost:3101/api/v1/workspaces', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Workspaces:', workspacesRes.data);

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    if (error.response) {
        console.error('Status:', error.response.status);
    }
  }
}

testApi();
