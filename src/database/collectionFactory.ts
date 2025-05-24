import logger from '@configs/logger.js'
import { MongoDBClient } from '@configs/MongoDBClient.js'
import { Collection, Document } from 'mongodb'

export function getCollection<T extends Document>(collectionName: string, dbName?: string): Collection<T> {
  try {
    const client = MongoDBClient.getInstance()
    if (!client.isClientConnected()) {
      throw new Error('MongoDB client is not connected')
    }
    logger.info('getting collection')
    const db = dbName ? client.getClient().db(dbName) : client.getDb()
    return db.collection<T>(collectionName)
  } catch (error: unknown) {
    logger.error(`Error getting collection ${collectionName}: ${error}`)

    if (error instanceof Error) {
      throw new Error(`Failed to get collection: ${error.message}`)
    }
    throw new Error(`Failed to get collection: Unknown error (${JSON.stringify(error)})`)
  }
}
