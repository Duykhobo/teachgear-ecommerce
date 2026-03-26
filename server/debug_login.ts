import databaseServices from './src/common/services/database.service'
import authService from './src/modules/auth/auth.service'
import { ObjectId } from 'mongodb'
import { hashPassword } from './src/common/utils/crypto'
import User from './src/modules/users/users.schema'

async function test() {
  await databaseServices.connect()
  const email = 'test_login@example.com'
  const password = 'Password123!'
  
  // Cleanup
  await databaseServices.users.deleteOne({ email })
  
  // Register manually
  const user_id = new ObjectId()
  await databaseServices.users.insertOne(new User({
    _id: user_id,
    email,
    password: await hashPassword(password),
    name: 'Test User',
    date_of_birth: new Date()
  }))
  
  console.log('User registered. Attempting login...')
  
  try {
    const result = await authService.login({ email, password })
    console.log('Login Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('Login Error:', error)
  } finally {
    await databaseServices.client.close()
  }
}

test()
