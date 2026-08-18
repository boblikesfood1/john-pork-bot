require('dotenv').config();
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// Canned John Pork lines — add as many as you want, one per entry.
const JOHN_PORK_LINES = [
  "ugh, someone @'d me. logging this as unpaid overtime. 🐷",
  "can't talk right now, deep in a very important nap. 💤",
  "wow you actually expect me to respond? bold of you.",
  "checked my calendar, I'm busy doing nothing until 5pm. 📉",
  "this better not be about the TPS reports again.",
  "working hard or hardly working? correct, it's the second one.",
  "I'll get to this right after my 4th coffee break. ☕",
  "you rang? unfortunately for both of us, I answered.",
  "let me consult my calendar... yeah, still no.",
  "this is exactly the kind of thing I have an assistant for. oh wait, I AM the assistant.",
  "per my last nap, I'll circle back never.",
  "adding this to my list of problems that are now yours.",
  "wow, straight to the point. respect. still not doing it though.",
  "I'm technically at my desk, which is 90% of the job.",
];

function randomLine() {
  return JOHN_PORK_LINES[Math.floor(Math.random() * JOHN_PORK_LINES.length)];
}

// Respond to @John Pork mentions
app.event('app_mention', async ({ event, say }) => {
  try {
    await say({ text: randomLine(), thread_ts: event.thread_ts || event.ts });
  } catch (err) {
    console.error('Error handling app_mention:', err);
  }
});

(async () => {
  await app.start();
  console.log('🐷 John Pork is online (Socket Mode).');
})();
