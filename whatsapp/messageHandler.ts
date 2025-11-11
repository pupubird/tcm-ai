// Message routing: text → /api/chat, image → /api/vision

import fetch from 'node-fetch';
import FormData from 'form-data';
import type { Message as WhatsAppMessage } from 'whatsapp-web.js';
import { SessionStore } from './sessionStore.js';
import { Whitelist } from './whitelist.js';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class MessageHandler {
  private sessionStore: SessionStore;
  private whitelist: Whitelist;
  private apiBaseUrl: string;

  constructor(sessionStore: SessionStore, whitelist: Whitelist, apiBaseUrl: string) {
    this.sessionStore = sessionStore;
    this.whitelist = whitelist;
    this.apiBaseUrl = apiBaseUrl;
  }

  private extractPhoneNumber(from: string): string {
    // WhatsApp format: "60123456789@c.us" → "+60123456789"
    const phone = from.split('@')[0];
    return '+' + phone;
  }

  private cleanMarkdown(text: string): string {
    // Strip markdown incompatible with WhatsApp
    // WhatsApp interprets * as bold, so we remove ** and * formatting
    return text
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold** → bold
      .replace(/\*([^*]+)\*/g, '$1');      // *italic* → italic
  }

  private async sendLongMessage(msg: WhatsAppMessage, text: string): Promise<void> {
    const MAX_LENGTH = 4096;

    if (text.length <= MAX_LENGTH) {
      await msg.reply(text);
      return;
    }

    // Split at sentence boundaries
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let chunk = '';

    for (const sentence of sentences) {
      if (chunk.length + sentence.length > MAX_LENGTH) {
        if (chunk) {
          await msg.reply(chunk.trim());
          await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
          chunk = '';
        }
      }
      chunk += sentence;
    }

    if (chunk) {
      await msg.reply(chunk.trim());
    }
  }

  private async handleTextMessage(msg: WhatsAppMessage, phone: string): Promise<void> {
    const text = msg.body.trim();
    if (!text) return;

    console.log(`[${phone}] Text: ${text.substring(0, 50)}...`);

    try {
      // Get session with conversation history
      const session = this.sessionStore.getSession(phone);

      // Build message array for API
      const messages: Message[] = [
        ...session.conversationHistory,
        { role: 'user', content: text }
      ];

      const startTime = Date.now();

      // Call chat API
      const response = await fetch(`${this.apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `chat_${Date.now()}`,
          messages
        })
      });

      const elapsed = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { messages: Message[] };

      // Extract assistant response
      const assistantMessage = data.messages[data.messages.length - 1];
      if (assistantMessage && assistantMessage.role === 'assistant') {
        const cleanedText = this.cleanMarkdown(assistantMessage.content);

        console.log(`[${phone}] Response (${elapsed}ms): ${cleanedText.substring(0, 50)}...`);

        // Update session with full conversation
        this.sessionStore.updateSession(phone, data.messages);

        // Send response
        await this.sendLongMessage(msg, cleanedText);
      } else {
        await msg.reply('抱歉，未收到响应。请重试。');
      }

    } catch (err) {
      console.error(`[${phone}] Text message error:`, err);

      const error = err as Error;
      if (error.message.includes('ECONNREFUSED')) {
        await msg.reply('服务暂时不可用。请确保后端服务正在运行 (http://localhost:3000)');
      } else if (error.message.includes('timeout')) {
        await msg.reply('请求超时。请尝试更简单的问题。');
      } else {
        await msg.reply('处理消息时出错。请重试。');
      }
    }
  }

  private async handleImageMessage(msg: WhatsAppMessage, phone: string): Promise<void> {
    console.log(`[${phone}] Image received`);

    try {
      // Download media
      const media = await msg.downloadMedia();
      if (!media) {
        throw new Error('Failed to download media');
      }

      console.log(`[${phone}] Media: ${media.mimetype}, ${media.data.length} bytes`);

      // Convert base64 to buffer
      const buffer = Buffer.from(media.data, 'base64');

      // Create FormData
      const formData = new FormData();
      formData.append('image', buffer, {
        filename: 'tongue.jpg',
        contentType: media.mimetype
      });

      const startTime = Date.now();

      // Call vision API
      const response = await fetch(`${this.apiBaseUrl}/api/vision`, {
        method: 'POST',
        body: formData as any,
        headers: formData.getHeaders()
      });

      const elapsed = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`Vision API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { diagnosis: string; success: boolean };

      if (data.success && data.diagnosis) {
        const cleanedText = this.cleanMarkdown(data.diagnosis);

        console.log(`[${phone}] Vision response (${elapsed}ms): ${cleanedText.substring(0, 50)}...`);

        await this.sendLongMessage(msg, cleanedText);
      } else {
        await msg.reply('图像分析失败。请重试。');
      }

    } catch (err) {
      console.error(`[${phone}] Image message error:`, err);

      const error = err as Error;
      if (error.message.includes('ECONNREFUSED')) {
        await msg.reply('服务暂时不可用。请确保后端服务正在运行 (http://localhost:3000)');
      } else if (error.message.includes('download')) {
        await msg.reply('下载图像失败。请重新发送。');
      } else {
        await msg.reply('分析图像失败。请在良好光线下重试，确保舌头清晰可见。');
      }
    }
  }

  async handle(msg: WhatsAppMessage): Promise<void> {
    const phone = this.extractPhoneNumber(msg.from);

    // Whitelist check
    if (!this.whitelist.isAllowed(phone)) {
      console.log(`[${phone}] Blocked by whitelist - no reply sent`);
      return;
    }

    // Route by message type
    if (msg.hasMedia) {
      const media = await msg.downloadMedia();
      if (media && media.mimetype.startsWith('image/')) {
        await this.handleImageMessage(msg, phone);
      } else {
        await msg.reply('请仅发送图片进行舌诊分析。文本消息用于咨询。');
      }
    } else if (msg.body && msg.body.trim()) {
      await this.handleTextMessage(msg, phone);
    }
  }
}
