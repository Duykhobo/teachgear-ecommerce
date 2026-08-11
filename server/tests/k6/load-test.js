import http from 'k6/http'
import { check, sleep } from 'k6'

// Cấu hình k6 load test stage
export const options = {
  stages: [
    { duration: '15s', target: 20 }, // Ramp-up lên 20 Virtual Users (VUs) trong 15s
    { duration: '30s', target: 50 }, // Duy trì 50 VUs trong 30s (Giả lập traffic lớn)
    { duration: '15s', target: 0 }  // Ramp-down giảm dần về 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% số lượng request phải phản hồi dưới 500ms
    http_req_failed: ['rate<0.01']     // Tỷ lệ lỗi request phải dưới 1%
  }
}

const BASE_URL = 'http://localhost:3000'

export default function () {
  // 1. Test Healthcheck
  const healthRes = http.get(`${BASE_URL}/health`)
  check(healthRes, {
    'Health Check Status 200': (r) => r.status === 200
  })

  // 2. Test Get Products List (Query Database)
  const productsRes = http.get(`${BASE_URL}/products?page=1&limit=10`)
  check(productsRes, {
    'Get Products Status 200': (r) => r.status === 200,
    'Products Response Time < 300ms': (r) => r.timings.duration < 300
  })

  // 3. Test Get Categories
  const categoriesRes = http.get(`${BASE_URL}/categories`)
  check(categoriesRes, {
    'Get Categories Status 200': (r) => r.status === 200
  })

  sleep(1) // Chờ 1 giây giữa mỗi iteration người dùng
}
