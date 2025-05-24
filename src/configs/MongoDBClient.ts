import logger from '@configs/logger.js'
import dotenv from 'dotenv'
import { Db, MongoClient, ServerApiVersion, UUID } from 'mongodb'

dotenv.config()

// Kiểm tra biến môi trường
const requiredEnvVars = ['MONGO_URI', 'DB_NAME'] as const
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

// Helper: Làm sạch command log
function cleanMongoCommand(command: Record<string, any>) {
  const { apiVersion, apiStrict, apiDeprecationErrors, lsid, txnNumber, $clusterTime, $db, ...rest } = command

  logger.info(`Transaction Number: ${txnNumber ?? 'N/A'}`)
  logger.info(`API Version: ${apiVersion ?? 'N/A'}`)
  logger.info(`API Strict Mode: ${apiStrict ?? 'N/A'}`)
  logger.info(`Deprecation Errors Enabled: ${apiDeprecationErrors ?? 'N/A'}`)
  logger.info(`Cluster Time: ${$clusterTime?.clusterTime ?? 'N/A'}`)
  logger.info(`Session ID (LSID): ${lsid?.id instanceof UUID ? lsid.id.toString() : 'N/A'}`)

  return { ...rest, db: $db }
}

export class MongoDBClient {
  private static instance: MongoDBClient | null = null
  private readonly client: MongoClient
  private readonly db: Db
  private readonly uri: string
  private isConnected: boolean = false

  private constructor() {
    this.uri = process.env.MONGO_URI!
    this.client = new MongoClient(this.uri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
      monitorCommands: process.env.NODE_ENV !== 'production', // Chỉ monitor ở non-production
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10 // Giới hạn connection pool
    })

    this.db = this.client.db(process.env.DB_NAME!)

    // Command monitoring
    this.client.on('commandStarted', (event) => {
      const commandToLog = cleanMongoCommand(event.command)
      logger.debug(`[MongoDB][Started] ${event.commandName} → ${JSON.stringify(commandToLog)}`)
    })

    this.client.on('commandSucceeded', (event) => {
      logger.debug(`[MongoDB][Succeeded] ${event.commandName} (${event.duration}ms)`)
    })

    this.client.on('commandFailed', (event) => {
      logger.error(`[MongoDB][Failed] ${event.commandName}`, event.failure)
    })
  }

  static getInstance(): MongoDBClient {
    MongoDBClient.instance ??= new MongoDBClient()

    return MongoDBClient.instance
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('MongoDB client already connected')
      return
    }
    try {
      await this.client.connect() // Kết nối rõ ràng
      await this.client.db('admin').command({ ping: 1 })
      this.isConnected = true
      logger.info('✅ Connected to MongoDB')
    } catch (error: unknown) {
      logger.error('❌ MongoDB connection failed:', error)
      if (error instanceof Error) {
        throw new Error(`MongoDB connection failed: ${error.message}`)
      }
    }
  }

  async close(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.close()
        this.isConnected = false
        logger.info('MongoDB client disconnected')
      }
    } catch (error: unknown) {
      logger.error('Error closing MongoDB client:', error)

      if (error instanceof Error) {
        throw new Error(`Failed to close MongoDB client: ${error.message}`)
      }
      throw new Error('Failed to close MongoDB client: Unknown error')
    }
  }

  isClientConnected(): boolean {
    return this.isConnected
  }

  getClient(): MongoClient {
    if (!this.isConnected) {
      throw new Error('MongoDB client is not connected')
    }
    return this.client
  }

  getDb(): Db {
    if (!this.isConnected) {
      throw new Error('MongoDB client is not connected')
    }
    return this.db
  }
}
