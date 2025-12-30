import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const tasksCreated = new Counter('tasks_created');
const tasksUpdated = new Counter('tasks_updated');
const tasksCompleted = new Counter('tasks_completed');

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 100,
      duration: '5m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3101';

const TASK_TITLES = [
  'Complete project documentation',
  'Review pull request #42',
  'Fix authentication bug',
  'Implement new feature',
  'Optimize database queries',
  'Write unit tests',
  'Update dependencies',
  'Refactor legacy code',
  'Deploy to staging',
  'Create API documentation',
];

const TASK_DESCRIPTIONS = [
  'This is a comprehensive task that requires careful attention to detail.',
  'High priority task that needs to be completed before the deadline.',
  'Bug fix task to address critical issues reported by users.',
  'Feature implementation following the latest design specifications.',
];

export function setup() {
  const timestamp = Date.now();
  const randomEmail = `taskloadtest${timestamp}@example.com`;

  const registerPayload = JSON.stringify({
    email: randomEmail,
    username: `taskloadtest${timestamp}`,
    password: 'LoadTest123!',
    name: 'Task Load Test User',
  });

  const registerParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const registerRes = http.post(
    `${BASE_URL}/auth/register`,
    registerPayload,
    registerParams,
  );

  if (registerRes.status !== 201) {
    console.error('Setup failed: Could not register user');
    throw new Error('Setup failed');
  }

  const tokens = registerRes.json();
  const accessToken = tokens.accessToken;
  const userId = tokens.user.id;

  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const createProjectPayload = JSON.stringify({
    name: 'Load Test Project',
    description: 'Project for load testing',
  });

  const projectRes = http.post(
    `${BASE_URL}/projects`,
    createProjectPayload,
    authHeaders,
  );

  if (projectRes.status !== 201) {
    console.error('Setup failed: Could not create project');
    throw new Error('Setup failed');
  }

  const project = projectRes.json();
  const projectId = project.id;

  const createTagsPayload = JSON.stringify([
    { name: 'urgent', color: '#FF0000' },
    { name: 'backend', color: '#0000FF' },
  ]);

  http.post(`${BASE_URL}/tags/batch`, createTagsPayload, authHeaders);

  return { accessToken, userId, projectId };
}

export default function (data) {
  const { accessToken, projectId } = data;

  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const group1 = 'Create Task';
  {
    const randomTitle =
      TASK_TITLES[Math.floor(Math.random() * TASK_TITLES.length)];
    const randomDescription =
      TASK_DESCRIPTIONS[Math.floor(Math.random() * TASK_DESCRIPTIONS.length)];
    const timestamp = Date.now();

    const createPayload = JSON.stringify({
      title: `${randomTitle} (${timestamp} - VU${__VU})`,
      description: randomDescription,
      status: 'TODO',
      priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'][
        Math.floor(Math.random() * 4)
      ],
      projectId: projectId,
      dueDate: new Date(
        Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });

    const createRes = http.post(
      `${BASE_URL}/tasks`,
      createPayload,
      authHeaders,
    );

    const checkResult = check(createRes, {
      [`${group1} status is 201`]: (r) => r.status === 201,
      [`${group1} has id`]: (r) => r.json().id !== undefined,
      [`${group1} has correct title`]: (r) => r.json().title !== undefined,
    });

    errorRate.add(!checkResult);
    responseTime.add(createRes.timings.duration);

    if (checkResult) {
      tasksCreated.add(1);
      data.taskId = createRes.json().id;
    }
  }

  sleep(Math.random() * 2);

  const group2 = 'List Tasks';
  {
    const listRes = http.get(`${BASE_URL}/tasks`, authHeaders);

    const checkResult = check(listRes, {
      [`${group2} status is 200`]: (r) => r.status === 200,
      [`${group2} is array`]: (r) => Array.isArray(r.json()),
    });

    errorRate.add(!checkResult);
    responseTime.add(listRes.timings.duration);
  }

  sleep(Math.random() * 1);

  const group3 = 'Update Task';
  if (data.taskId) {
    const updatePayload = JSON.stringify({
      status: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'][
        Math.floor(Math.random() * 4)
      ],
      priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'][
        Math.floor(Math.random() * 4)
      ],
    });

    const updateRes = http.patch(
      `${BASE_URL}/tasks/${data.taskId}`,
      updatePayload,
      authHeaders,
    );

    const checkResult = check(updateRes, {
      [`${group3} status is 200`]: (r) => r.status === 200,
      [`${group3} has updated fields`]: (r) => r.json().status !== undefined,
    });

    errorRate.add(!checkResult);
    responseTime.add(updateRes.timings.duration);

    if (checkResult) {
      tasksUpdated.add(1);
    }
  }

  sleep(Math.random() * 1);

  const group4 = 'Get Today Tasks';
  {
    const todayRes = http.get(`${BASE_URL}/tasks/today`, authHeaders);

    const checkResult = check(todayRes, {
      [`${group4} status is 200`]: (r) => r.status === 200,
      [`${group4} has categories`]: (r) => r.json() !== undefined,
    });

    errorRate.add(!checkResult);
    responseTime.add(todayRes.timings.duration);
  }

  sleep(Math.random() * 1);

  const group5 = 'Complete Task';
  if (data.taskId && Math.random() > 0.5) {
    const completeRes = http.patch(
      `${BASE_URL}/tasks/${data.taskId}/complete`,
      null,
      authHeaders,
    );

    const checkResult = check(completeRes, {
      [`${group5} status is 200`]: (r) => r.status === 200,
      [`${group5} task is done`]: (r) => r.json().status === 'DONE',
    });

    errorRate.add(!checkResult);
    responseTime.add(completeRes.timings.duration);

    if (checkResult) {
      tasksCompleted.add(1);
      delete data.taskId;
    }
  }

  sleep(Math.random() * 2);
}

export function teardown(data) {
  console.log(`Tasks created: ${tasksCreated.name}`);
  console.log(`Tasks updated: ${tasksUpdated.name}`);
  console.log(`Tasks completed: ${tasksCompleted.name}`);
  console.log(`Load test completed for user: ${data.userId}`);
}
