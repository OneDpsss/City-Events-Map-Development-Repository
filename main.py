import asyncio
import logging
import datetime
import threading
import time
from config.config import api_id, api_hash
from config.sources import tg_channels
from services.event_reader import kassir
from services.news_reader import nnru, rbc
from services.tg_grabber import telegram_grabber

# Настройка логгера
logging.basicConfig(level=logging.INFO, filename="py_log.log", filemode="w",
                    format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("myGrab")


async def safe_execute(task, task_name, semaphore):
    async with semaphore:
        try:
            await task
        except Exception as e:
            logger.error(f"Ошибка при выполнении {task_name}: {e}")


async def main():
    semaphore = asyncio.Semaphore(5)
    tasks = [
        safe_execute(nnru(logger), "nnru", semaphore),
        safe_execute(rbc(logger), "rbc", semaphore),
        safe_execute(kassir(logger), "kassir", semaphore)
    ]

    await asyncio.gather(*tasks)


def run_telegram_grabber():
    asyncio.run(telegram_grabber("myGrab", api_id, api_hash, logger, tg_channels=tg_channels))


async def periodic_main():
    while True:
        logger.info(f"Запуск основных задач. Время: {datetime.datetime.now()}")
        await main()
        await asyncio.sleep(1800)  # Ждем 30 минут перед следующим запуском


def run_main_periodically():
    asyncio.run(periodic_main())


# Запуск telegram_grabber в отдельном потоке
telegram_thread = threading.Thread(target=run_telegram_grabber)
telegram_thread.start()

# Запуск main периодически в основном потоке
run_main_periodically()
