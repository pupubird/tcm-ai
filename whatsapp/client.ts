// WhatsApp Web client with QR code authentication

import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function createWhatsAppClient(sessionPath: string = './.wwebjs_auth'): Promise<typeof Client.prototype> {
  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: sessionPath,
      clientId: 'qtyf-tcm-client'
    }),
    puppeteer: {
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ]
    },
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    }
  });

  // QR code display for first-time setup
  client.on('qr', (qr: string) => {
    console.log('\n=== WhatsApp QR Code ===');
    console.log('Scan this QR code with your WhatsApp mobile app:');
    qrcode.generate(qr, { small: true });
    console.log('========================\n');
  });

  // Authentication status
  client.on('authenticated', () => {
    console.log('✓ WhatsApp authenticated successfully');
  });

  client.on('auth_failure', (msg: string) => {
    console.error('✗ Authentication failed:', msg);
    console.log('Please delete the session directory and try again');
  });

  // Connection status
  client.on('ready', () => {
    console.log('✓ WhatsApp client is ready');
    const info = client.info;
    if (info) {
      console.log(`Connected as: ${info.pushname} (${info.wid.user})`);
    }
  });

  client.on('disconnected', (reason: string) => {
    console.log('WhatsApp disconnected:', reason);
    console.log('Attempting to reconnect...');
  });

  // Error handling
  client.on('error', (error: Error) => {
    console.error('WhatsApp client error:', error.message);
  });

  return client;
}
