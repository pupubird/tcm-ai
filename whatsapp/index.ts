// WhatsApp client entry point

import dotenv from 'dotenv';
import { createWhatsAppClient } from './client.js';
import { SessionStore } from './sessionStore.js';
import { Whitelist } from './whitelist.js';
import { MessageHandler } from './messageHandler.js';

// Load environment variables
dotenv.config({ path: '../.env' });
dotenv.config(); // Also try .env in whatsapp directory

async function main() {
  console.log('=== TCM WhatsApp Client ===\n');

  // Configuration
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  const SESSION_PATH = process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth';
  const SESSION_EXPIRY = parseInt(process.env.WHATSAPP_SESSION_EXPIRY_MINUTES || '30');
  const WHITELIST = process.env.WHATSAPP_WHITELIST || '';

  console.log('Configuration:');
  console.log(`  Frontend URL: ${FRONTEND_URL}`);
  console.log(`  Session path: ${SESSION_PATH}`);
  console.log(`  Session expiry: ${SESSION_EXPIRY} minutes`);
  console.log(`  Whitelist: ${WHITELIST || '(disabled)'}\n`);

  // Health check
  try {
    const response = await fetch(`${FRONTEND_URL}/api/chat`, { method: 'GET' });
    // Expect 405 Method Not Allowed (POST only) - confirms endpoint exists
    if (response.status === 405) {
      console.log('✓ Backend API reachable\n');
    } else {
      console.warn(`⚠ Unexpected backend response: ${response.status}\n`);
    }
  } catch (err) {
    console.error('✗ Backend API unreachable:', (err as Error).message);
    console.error('  Please ensure the frontend is running at', FRONTEND_URL);
    console.error('  Continuing anyway...\n');
  }

  // Initialize components
  const sessionStore = new SessionStore(SESSION_EXPIRY);
  const whitelist = new Whitelist(WHITELIST);
  const messageHandler = new MessageHandler(sessionStore, whitelist, FRONTEND_URL);

  // Create WhatsApp client
  const client = await createWhatsAppClient(SESSION_PATH);

  // Message event handler
  client.on('message', async (msg) => {
    try {
      // Ignore group messages and status updates
      const chat = await msg.getChat();
      if (chat.isGroup) return;

      await messageHandler.handle(msg);
    } catch (err) {
      console.error('Message handling error:', err);
    }
  });

  // Stats logging every 60 seconds
  setInterval(() => {
    const stats = sessionStore.getStats();
    console.log(`[Stats] Sessions: ${stats.active} active / ${stats.total} total`);
  }, 60000);

  // Initialize client
  console.log('Initializing WhatsApp client...');
  await client.initialize();

  console.log('\n✓ WhatsApp client initialized and listening for messages');
  console.log('Press Ctrl+C to stop\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
