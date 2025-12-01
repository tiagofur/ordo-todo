const axios = require('axios');

const API_URL = 'http://localhost:3101/api/v1';

async function run() {
  try {
    // 1. Register
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';
    console.log(`Registering user ${email}...`);
    
    let token;
    try {
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            email,
            password,
            name: 'Test User'
        });
        token = regRes.data.accessToken;
    } catch (e) {
        console.error('Registration failed:', e.response ? e.response.data : e.message);
        return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Create Workspace
    console.log('Creating workspace...');
    const wsRes = await axios.post(`${API_URL}/workspaces`, {
        name: 'Test Workspace',
        type: 'PERSONAL'
    }, { headers });
    const workspaceId = wsRes.data.id;

    // 2.5 Get Workflows
    console.log('Getting workflows...');
    const wfRes = await axios.get(`${API_URL}/workflows?workspaceId=${workspaceId}`, { headers });
    let workflowId;
    if (wfRes.data && wfRes.data.length > 0) {
        workflowId = wfRes.data[0].id;
    } else {
        console.log('Creating workflow...');
        const newWfRes = await axios.post(`${API_URL}/workflows`, {
            name: 'Default Workflow',
            workspaceId
        }, { headers });
        workflowId = newWfRes.data.id;
    }

    // 3. Create Project
    console.log('Creating project...');
    const projRes = await axios.post(`${API_URL}/projects`, {
        name: 'Test Project',
        color: '#ff0000',
        workspaceId,
        workflowId
    }, { headers });
    const projectId = projRes.data.id;
    console.log(`Project created: ${projectId}, archived: ${projRes.data.archived}`);

    // 4. Archive Project
    console.log('Archiving project...');
    const archiveRes = await axios.patch(`${API_URL}/projects/${projectId}/archive`, {}, { headers });
    console.log(`Archive response: archived=${archiveRes.data.archived}`);

    // 5. Unarchive Project
    console.log('Unarchiving project...');
    const unarchiveRes = await axios.patch(`${API_URL}/projects/${projectId}/archive`, {}, { headers });
    console.log(`Unarchive response: archived=${unarchiveRes.data.archived}`);

    if (unarchiveRes.data.archived === false) {
        console.log('SUCCESS: Project unarchived successfully.');
        
        // Verify GET /projects/:id
        console.log('Verifying GET /projects/:id...');
        const getRes = await axios.get(`${API_URL}/projects/${projectId}`, { headers });
        console.log(`GET response: archived=${getRes.data.archived}`);
        
        if (getRes.data.archived === false) {
             console.log('SUCCESS: Project details reflect unarchived status.');
        } else {
             console.log('FAILURE: Project details still show archived.');
        }

    } else {
        console.log('FAILURE: Project is still archived.');
    }

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

run();
