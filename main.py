# Импорт необходимых модулей
import asyncio
import logging
import datetime
from config.config import api_id, api_hash
from config.sources.sources import tg_channels
from services.event_reader import kassir
from services.news_reader import nnru, rbc
from services.tg_grabber import telegram_grabber
# Настройка логгера
logging.basicConfig(level=logging.INFO, filename="py_log.log",filemode="w",
                    format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("myGrab")


# Определение основной асинхронной функции
async def main():
    # Название сессии для Telegram
    session = "myGrab"

    # Создание нового цикла событий
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    # Собираем задачи для одновременного выполнения
    await asyncio.gather(
        nnru(logger),
        # nnru(),  # Загрузка новостей с nn.ru
        telegram_grabber(session, api_id, api_hash, logger, loop=loop, tg_channels=tg_channels),
        # Загрузка сообщений из каналов Telegram
        rbc(logger),
        # Загрузка новостей с rbc.ru
       #` kassir(logger)
        # Загрузка событиый с kassir.ru
    )




# Запуск основной функции
logger.info(f"Запуск основных задач.Время:{datetime.datetime.now()}")
asyncio.run(main())
