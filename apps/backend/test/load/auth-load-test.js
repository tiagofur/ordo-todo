import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 50,
      duration: '2m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3101';

let accessToken = null;
let refreshToken = null;
let userId = null;
let taskId = null;
let projectId = null;

export function setup() {
  const timestamp = Date.now();
  const randomEmail = `loadtest${timestamp}@example.com`;

  const registerPayload = JSON.stringify({
    email: randomEmail,
    username: `loadtest${timestamp}`,
    password: 'LoadTest123!',
    name: 'Load Test User',
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

  check(registerRes, {
    'register status is 201': (r) => r.status === 201,
    'register has accessToken': (r) => r.json().accessToken !== undefined,
    'register has refreshToken': (r) => r.json().refreshToken !== undefined,
    'register has userId': (r) => r.json().user.id !== undefined,
  });

  const tokens = registerRes.json();
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  userId = tokens.user.id;

  return { accessToken, refreshToken, userId };
}

export default function (data) {
  const { accessToken } = data;

  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const publicHeaders = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const group1 = 'Refresh Token';
  {
    const refreshPayload = JSON.stringify({ refreshToken });

    const refreshRes = http.post(
      `${BASE_URL}/auth/refresh`,
      refreshPayload,
      publicHeaders,
    );

    const checkResult = check(refreshRes, {
      [`${group1} status is 200`]: (r) => r.status === 200,
      [`${group1} has accessToken`]: (r) => r.json().accessToken !== undefined,
      [`${group1} has refreshToken`]: (r) =>
        r.json().refreshToken !== undefined,
    });

    errorRate.add(!checkResult);
    responseTime.add(refreshRes.timings.duration);

    if (checkResult) {
      data.accessToken = refreshRes.json().accessToken;
    }
  }

  sleep(Math.random() * 2);

  const group2 = 'Check Username';
  {
    const usernamePayload = JSON.stringify({
      username: `user${Date.now()}${__VU}`,
    });

    const checkRes = http.post(
      `${BASE_URL}/auth/check-username`,
      usernamePayload,
      publicHeaders,
    );

    const checkResult = check(checkRes, {
      [`${group2} status is 200`]: (r) => r.status === 200,
      [`${group2} has available field`]: (r) =>
        r.json().available !== undefined,
    });

    errorRate.add(!checkResult);
    responseTime.add(checkRes.timings.duration);
  }

  sleep(Math.random() * 2);
}

export function teardown(data) {
  console.log(`Load test completed for user: ${data.userId}`);
}
