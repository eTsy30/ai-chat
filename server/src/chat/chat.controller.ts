import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  message!: string;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  sendMessage(@Body() dto: SendMessageDto) {
    return this.chatService.processMessage(dto.message);
  }
}
