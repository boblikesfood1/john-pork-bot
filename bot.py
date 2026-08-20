import os, random, tempfile, time
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
    result = app.client.conversations_history(
        channel=PHOTO_CHANNEL_ID,
        limit=100,
    )

    files = []
    for message in result.get("messages", []):
        for f in message.get("files", []):
            if f.get("mimetype", "").startswith("image/"):
                files.append(f)

    # Remove duplicate file IDs while preserving order.
    files = list({f["id"]: f for f in files}.values())
    if not files:
        raise RuntimeError(
            f"No image attachments found in {PHOTO_CHANNEL_ID}"
        )

    valid_ids = {f["id"] for f in files}
    remaining = [f for f in remaining if f["id"] in valid_ids]
    if not remaining:
        remaining = files[:]
    return remaining.pop(random.randrange(len(remaining)))

    if not files:
        raise RuntimeError(f"No image files found in {PHOTO_CHANNEL_ID}")

    valid_ids = {f["id"] for f in files}
    remaining = [f for f in remaining if f["id"] in valid_ids]
    if not remaining:
        remaining = files[:]
    return remaining.pop(random.randrange(len(remaining)))

@app.command("/bossphoto")
def bossphoto(ack, respond, command, client, logger):
    ack()
    try:
        photo = get_photo()
        with tempfile.TemporaryDirectory() as d:
            path = Path(d) / photo.get("name", "boss-photo.jpg")
            resp = requests.get(photo["url_private"], headers={"Authorization": f"Bearer {BOT_TOKEN}"}, timeout=30)
            resp.raise_for_status(); path.write_bytes(resp.content)
            client.files_upload_v2(channel=command["channel_id"], file=str(path), filename=path.name, title="Boss photo")
    except Exception as e:
        logger.exception("bossphoto failed")
        respond(f"Couldn’t fetch a Boss photo: {e}")

if __name__ == "__main__":
    SocketModeHandler(app, APP_TOKEN).start()
