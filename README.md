# John Pork Bot — 5 Minute Setup

Responds to real @mentions in Slack with a random canned one-liner.
No AI, no API key — just a list of lines in `index.js` you can edit anytime.

## 1. Turn on Socket Mode
In the Slack API dashboard (left sidebar) → **Socket Mode** → toggle it **On**.
It'll ask you to generate an **App-Level Token** — name it anything, add the
`connections:write` scope, click **Generate**. Copy that token
(starts with `xapp-`).

## 2. Turn on Event Subscriptions
Left sidebar → **Event Subscriptions** → toggle **On**.
Under **Subscribe to bot events**, click **Add Bot User Event** and add:
- `app_mention`

Click **Save Changes** at the bottom. (Since Socket Mode is on, it won't ask
for a Request URL.)

## 3. Reinstall the app
Left sidebar → **Install App** → click **Reinstall to Big Money Moves Inc.**
This refreshes permissions to include the new event subscription.

## 4. Get your keys
You need two values:
- `SLACK_BOT_TOKEN` — from **Install App** page, starts with `xoxb-`
- `SLACK_APP_TOKEN` — from step 1, starts with `xapp-`

Copy `.env.example` to `.env` and fill these in. No AI/API key needed —
he picks a random line from a list in `index.js`.

## 5. Install & run
```
npm install
npm start
```

You should see `🐷 John Pork is online (Socket Mode).` in your terminal.

## 6. Invite him to a channel
In Slack: `/invite @John Pork` in whatever channel you want him in.
Then just @ him: `@John Pork what's for lunch`

## Notes
- Keep this running (terminal open, or deployed to something like Railway/
  Render's free tier) for him to stay online — closing the terminal takes
  him offline since Socket Mode needs an active connection.
- Never commit `.env` or share these tokens in a public channel.
