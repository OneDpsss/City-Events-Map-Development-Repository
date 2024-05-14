import base64
import json
from datetime import datetime
from telethon import TelegramClient, events
from internal.function import response_to_server_news, filter_func, SummarizeAiFunc


async def telegram_grabber(session, api_id, api_hash, logger, loop=None, tg_channels=None, ):
    # Инициализация клиента Telegram
    client = TelegramClient(session, api_id, api_hash, system_version="4.16.30-vxCUSTOM", loop=loop)
    await client.start()

    # Обработчик новых сообщений
    @client.on(events.NewMessage(chats=tg_channels))
    async def check_events(event):
        new_text = event.raw_text.replace("\n", "")
        if new_text == "":
            logger.info(f"Empty text: {event.raw_text}");
            return

        if not filter_func(new_text):
            print("Фильтрация не пройдена")

        # Создание ссылки на сообщение
        message_link = f"https://t.me/{event.chat.username}/{event.id}"

        # Суммаризация текста сообщения
        post = await SummarizeAiFunc(new_text)
        if not post:
            return

        # Обработка полученной суммаризации
        try:
            data = json.loads(post)
        except json.JSONDecodeError as e:
            print("err")
            return
        data['url'] = message_link
        data['img'] = ""

        # Установка даты публикации
        time = datetime.now().strftime("%Y-%m-%d")
        data['news_date'] = time

        # Обработка изображения, если оно есть
        if event.message.photo:
            time = datetime.now().strftime("%d-%m-%Y%H-%M-%S-%f")
            path = f"images/img+{time}"
            await event.download_media(path)
            with open(path + ".jpg", "rb") as file:
                image_data = file.read()
                img = base64.b64encode(image_data).decode('utf-8')
            data['img'] = img
        if data["priority"] == 0:
            return
        # Отправка данных на сервер
        logger.info(f"{json.dumps(data['url'])}")
        print(data["title"])
        response_to_server_news(data)
        # send_message_func(data)

    # Запуск клиента Telegram
    await client.run_until_disconnected()


# сделать функиию для эвентов