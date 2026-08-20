import os, random, tempfile
from pathlib import Path

import requests
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

BOT_TOKEN = os.environ["SLACK_BOT_TOKEN"]
APP_TOKEN = os.environ["SLACK_APP_TOKEN"]
PHOTO_CHANNEL_ID = os.environ["PHOTO_CHANNEL_ID"]

app = App(token=BOT_TOKEN)
remaining = []


def get_photo():
    global remaining
    response = app.client.files_list(channel=PHOTO_CHANNEL_ID, count=1000)
    files = [
        file for file in response.get("files", [])
        if file.get("mimetype", "").startswith("image/")
        and not file.get("is_external")
    ]
    if not files:
        raise RuntimeError("No image files found in PHOTO_CHANNEL_ID")

    file_ids = {file["id"] for file in files}
    remaining = [file for file in remaining if file["id"] in file_ids]
    if not remaining:
        remaining = files[:]
    return remaining.pop(random.randrange(len(remaining)))


def send_photo(client, channel_id, thread_ts, respond, logger):
    try:
        photo = get_photo()
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / photo.get("name", "boss-photo.jpg")
            response = requests.get(
                photo["url_private"],
                headers={"Authorization": f"Bearer {BOT_TOKEN}"},
                timeout=30,
            )
            response.raise_for_status()
            path.write_bytes(response.content)

            upload = {
                "channel": channel_id,
                "file": str(path),
                "filename": path.name,
                "title": "Boss photo",
            }
            if thread_ts:
                upload["thread_ts"] = thread_ts
            client.files_upload_v2(**upload)
    except Exception as error:
        logger.exception("bossphoto failed")
        respond(f"Couldn’t fetch a Boss photo: {error}")


@app.command("/bossphoto")
def bossphoto(ack, respond, command, client, logger):
    ack()
    send_photo(client, command["channel_id"], command.get("thread_ts"), respond, logger)


@app.event("message")
def bossphoto_message(event, client, logger):
    text = (event.get("text") or "").strip().lower()
    if event.get("subtype") or event.get("bot_id"):
        return
    if text not in {"boss photo now", "📸bossphoto"}:
        return

    thread_ts = event.get("thread_ts") or event.get("ts")
    send_photo(
        client,
        event["channel"],
        thread_ts,
        lambda message: client.chat_postMessage(
            channel=event["channel"],
            thread_ts=thread_ts,
            text=message,
        ),
        logger,
    )


if __name__ == "__main__":
    SocketModeHandler(app, APP_TOKEN).start()
