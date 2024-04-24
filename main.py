from config.config import api_id, api_hash
from config.sources.sources import tg_channels
from services.tg_grabber import telegram_grabber
from services.news_reader import nnru, rbc
import asyncio

session = "myGrab"
amount_messages = 10
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)


async def main():
    await asyncio.gather(nnru(), telegram_grabber(session, api_id, api_hash, loop=loop, tg_channels=tg_channels))


asyncio.run(main())
