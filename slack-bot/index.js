const { App, ExpressReceiver } = require('@slack/bolt');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { queryDocs, generateAnswer } = require('../rag-engine/rag');

// Setup receiver to allow custom Express routes if needed
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: '/slack/events',
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

// Respond to @mentions with RAG response
app.event('app_mention', async ({ event, client }) => {
  const userQuery = event.text.replace(/<@[^>]+>/, '').trim();

  try {
    await client.chat.postMessage({
      channel: event.channel,
      text: `🤔 Thinking...`,
    });

    const context = await queryDocs(userQuery);
    const answer = await generateAnswer(userQuery, context);

    await client.chat.postMessage({
      channel: event.channel,
      text: `💡 *Answer:* ${answer}`,
    });
  } catch (e) {
    console.error('Slack handler error:', e);
  }
});

// Optional: respond to any direct message
app.message(async ({ message, client }) => {
  if (message.channel_type === 'im' && message.text) {
    const userQuery = message.text.trim();

    try {
      await client.chat.postMessage({
        channel: message.channel,
        text: `🤔 Thinking...`,
      });

      const context = await queryDocs(userQuery);
      const answer = await generateAnswer(userQuery, context);

      await client.chat.postMessage({
        channel: message.channel,
        text: `💡 *Answer:* ${answer}`,
      });
    } catch (e) {
      console.error('DM handler error:', e);
      await client.chat.postMessage({
        channel: message.channel,
        text: `⚠️ Sorry, something went wrong while answering your question.`,
      });
    }
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Slack bot is running!');
})();