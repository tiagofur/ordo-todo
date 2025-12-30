import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3101';

export default function () {
  const publicHeaders = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const group1 = 'Check Username';
  {
    const usernamePayload = JSON.stringify({
      username: `stresstest${Date.now()}${Math.random()}`,
    });

    const checkRes = http.post(
      `${BASE_URL}/auth/check-username`,
      usernamePayload,
      publicHeaders,
    );

    const checkResult = check(checkRes, {
      [`${group1} status is 200`]: (r) => r.status === 200,
    });

    errorRate.add(!checkResult);
    responseTime.add(checkRes.timings.duration);
  }

  const group2 = 'Health Check';
  {
    const healthRes = http.get(`${BASE_URL}/health`);

    const checkResult = check(healthRes, {
      [`${group2} status is 200`]: (r) => r.status === 200,
      [`${group2} has status`]: (r) => r.json().status === 'ok',
    });

    errorRate.add(!checkResult);
    responseTime.add(healthRes.timings.duration);
  }
}
