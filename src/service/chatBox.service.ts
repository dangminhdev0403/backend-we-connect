import logger from '@configs/logger.js'
import axios from 'axios'

type OnDataCallback = (text: string) => void
type OnErrorCallback = (error: any) => void
type OnEndCallback = () => void

export class ChatBoxService {
  public apiKey: string = process.env.API_CHAT_BOX as string
  public endpoint: string = process.env.BASE_URL_CHAT as string

  async streamChatMessages(data: object, onData: OnDataCallback, onEnd: OnEndCallback, onError: OnErrorCallback) {
    try {
      const response = await axios({
        method: 'POST',
        url: `${this.endpoint}/chat-messages`,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        data,
        responseType: 'stream'
      })

      let buffer = ''

      response.data.on('data', (chunk: Buffer) => {
        buffer += chunk.toString('utf-8')

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue

          const jsonStr = trimmed.replace(/^data:\s*/, '')

          try {
            const json = JSON.parse(jsonStr)

            switch (json.event) {
              case 'message':
                if (json.answer) onData(json.answer)
                break
              case 'message_end':
                onEnd()
                break
              case 'error':
                onError(new Error(json.message || 'Unknown error'))
                break
            }
          } catch (err) {
            logger.warn('⚠️ Invalid JSON chunk:', jsonStr)
          }
        }
      })

      response.data.on('end', () => {
        onEnd()
      })

      response.data.on('error', (err: any) => {
        onError(err)
      })
    } catch (error: any) {
      logger.error('Error in streamChatMessages', error)
      onError(error)
      throw error
    }
  }
}
