require("dotenv").config();

const { App } = require("@slack/bolt");
const {
  shouldRonnieReply,
  buildRonnieReply,
  rememberResponse,
  getDailyStats
} = require("./ronnie");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

// Recent conversation memory.
// This stays in Ronnie's running process — no outside AI or database.
const channelMemory = new Map();

function rememberMessage(channel, message) {
  if (!channelMemory.has(channel)) {
    channelMemory.set(channel, []);
  }

  const messages = channelMemory.get(channel);

  messages.push({
    user: message.user,
    text: message.text,
    ts: message.ts
  });

  // Keep the last 25 messages per channel.
  while (messages.length > 25) {
    messages.shift();
  }
}

function getRecentMessages(channel) {
  return channelMemory.get(channel) || [];
}

function isBotMessage(event) {
  return (
    event.bot_id ||
    event.subtype === "bot_message" ||
    event.subtype === "message_changed"
  );
}

/*
 * Normal Slack messages
 */
app.event("message", async ({ event, client, logger }) => {
  try {
    if (!event.text || isBotMessage(event)) {
      return;
    }

    const ronnieUserId = process.env.RONNIE_USER_ID;
    const mentioned =
      ronnieUserId && event.text.includes(`<@${ronnieUserId}>`);

    rememberMessage(event.channel, event);

    const recentMessages = getRecentMessages(event.channel);

    if (!shouldRonnieReply(event.text, mentioned, recentMessages)) {
      return;
    }

    const response = buildRonnieReply(
      event.text,
      recentMessages,
      mentioned
    );

    if (!response) {
      return;
    }

    rememberResponse(response);

    await client.chat.postMessage({
      channel: event.channel,
      text: response,
      thread_ts: event.thread_ts || undefined
    });

    console.log(
      `Ronnie replied. Today: ${getDailyStats().responses}`
    );
  } catch (error) {
    logger.error("Ronnie message error:", error);
  }
});

/*
 * Direct @Ronnie mentions
 *
 * If somebody specifically talks to Ronnie,
 * he ALWAYS answers.
 */
app.event("app_mention", async ({ event, client, logger }) => {
  try {
    if (!event.text || isBotMessage(event)) {
      return;
    }

    const ronnieUserId = process.env.RONNIE_USER_ID;

    let cleanedMessage = event.text;

    if (ronnieUserId) {
      cleanedMessage = cleanedMessage
        .replace(new RegExp(`<@${ronnieUserId}>`, "g"), "")
        .trim();
    }

    rememberMessage(event.channel, event);

    const recentMessages = getRecentMessages(event.channel);

    const response = buildRonnieReply(
      cleanedMessage,
      recentMessages,
      true
    );

    if (!response) {
      return;
    }

    rememberResponse(response);

    await client.chat.postMessage({
      channel: event.channel,
      text: response,
      thread_ts: event.thread_ts || event.ts
    });

    console.log(
      `Ronnie was summoned. Today: ${getDailyStats().responses}`
    );
  } catch (error) {
    logger.error("Ronnie mention error:", error);
  }
});

/*
 * Start Ronnie
 */
(async () => {
  try {
    await app.start();

    console.log("=================================");
    console.log("RONNIE IS FUCKING ONLINE");
    console.log("No AI.");
    console.log("No mercy.");
    console.log("=================================");
  } catch (error) {
    console.error("Could not start Ronnie:", error);
    process.exit(1);
  }
})();
