# Bossphoto Slack bot

## Slack setup
Add bot scopes: `commands`, `files:read`, `files:write`, `chat:write`, `channels:history`; add `groups:history` if the photo channel is private. Invite the bot to the photo channel and any destination channel. Reinstall the app after scope changes.

## Railway
Deploy this repo as a Worker. Add variables (never commit them):
- `SLACK_APP_TOKEN`: fresh `xapp-...` app token with `connections:write`
- `SLACK_BOT_TOKEN`: bot token from OAuth & Permissions (`xoxb-...`)
- `PHOTO_CHANNEL_ID`: `C0BRLPQ4UCW`
Start command: `python bot.py` (Procfile already sets it).

Then type `/bossphoto` in a channel where the bot is present. It cycles through images without repeating until the set is exhausted, then reshuffles.
