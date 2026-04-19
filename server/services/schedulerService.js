import cron from 'node-cron';
import { scanAllUsers } from './redditService.js';
import { scanAllUsersHN } from './hnService.js';
import { sendAllDailyDigests } from './emailService.js';
import { checkAllUsersConversations } from './conversationService.js';

export function startScheduler() {
  // Scan Reddit every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    console.log('[Scheduler] Starting Reddit scan...');
    await scanAllUsers();
  });

  // Scan Hacker News every 30 minutes (offset by 5 min so it doesn't overlap Reddit)
  cron.schedule('5,35 * * * *', async () => {
    console.log('[Scheduler] Starting HN scan...');
    await scanAllUsersHN();
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

  console.log('[Scheduler] Started: Reddit scan every 15 min, HN scan every 30 min, inbox check every hour, digest at 8AM UTC');
}
