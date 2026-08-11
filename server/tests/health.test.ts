import request from 'supertest'
import app from '../src/index'

describe('System Health & Root Endpoint Tests', () => {
  it('Should return 200 OK for Root Welcome API (GET /)', async () => {
    const response = await request(app).get('/')

    expect(response.status).toBe(200)
    expect(response.body.message).toBeDefined()
    expect(response.body.status).toBeDefined()
  })

  it('Should return 200 OK for System Health Check (GET /health)', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('OK')
    expect(response.body.services).toBeDefined()
    expect(response.body.services.mongodb).toBe('healthy')
  })
})
