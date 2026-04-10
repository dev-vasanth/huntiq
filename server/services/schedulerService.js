import cron from 'node-cron';
import { scanAllUsers } from './redditService.js';
import { sendAllDailyDigests } from './emailService.js';
import { checkAllUsersConversations } from './conversationService.js';

export function startScheduler() {
  // Scan Reddit every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Scheduler] Starting Reddit scan...');
    await scanAllUsers();
  });

  // Check DM inboxes for replies every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[Scheduler] Checking conversation inboxes...');
    await checkAllUsersConversations();
  });

  // Send daily digests at 8:00 AM UTC
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Sending daily digests...');
    await sendAllDailyDigests();
  });

  console.log('[Scheduler] Started: Reddit scan every 15 min, inbox check every hour, digest at 8AM UTC');
}
