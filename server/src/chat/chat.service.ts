import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class ChatService {
  private groq: Groq;
  private model: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');

    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not defined in .env');
    }

    this.groq = new Groq({ apiKey });
    this.model = this.configService.get<string>('AI_MODEL') || 'llama3-8b-8192';
  }

  async processMessage(message: string) {
    try {
      const completion = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: message },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content || 'No response';

      return {
        success: true,
        data: {
          reply,
          timestamp: new Date().toISOString(),
          model: this.model,
        },
      };
    } catch (error: any) {
      console.error('Groq error:', error);

      if (error.status === 401) {
        throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED);
      }

      if (error.status === 429) {
        throw new HttpException(
          'Rate limit exceeded',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new HttpException(
        'Failed to get response from AI',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
