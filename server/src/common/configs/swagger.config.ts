import swaggerJsdoc from 'swagger-jsdoc'
import { envConfig } from './configs'

const options: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'TechGear E-commerce API',
      version: '1.0.0',
      description: 'API Documentation for TechGear E-commerce backend using OpenAPI 3.0'
    },
    servers: [
      {
        url: `http://localhost:${envConfig.PORT || 3000}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  // Đường dẫn đến các file chứa annotation (JSDoc)
  apis: ['./src/modules/**/*.route.ts', './src/modules/**/*.schema.ts'] 
}

export const swaggerSpec = swaggerJsdoc(options)
