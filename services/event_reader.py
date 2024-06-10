import asyncio
import base64
import time

import requests
import json
from dateutil import parser
from internal.function import check_response, get_after_find, response_to_server_event

event_limit = 20


async def send_json(title, date, address, url, img, logger):
    data = {'title': title, 'event_date': date, 'address': address, 'url': url, 'img': img}
    logger.info(f"{json.dumps(data['url'])}")
    print(data["title"])
    response_to_server_event(data)


async def kassir(logger):
    prev_data = None
    site_url = 'https://nn.kassir.ru/selection/luchshee-v-nijnem-novgorode'
    data = check_response(site_url)
    if not (data is None or prev_data == data):
        for event in data.find_all('li', class_='my-4.5 xl:my-4 lg:my-2 md:my-5 sm:my-3 xs:my-2')[:event_limit]:
            try:
                url = 'https://nn.kassir.ru' + event.find('a', {
                    'class': 'recommendation-item_img-block compilation-tile__img-block'}).get('href')
                img = get_after_find(event, 'img', 'src')
                img = base64.b64encode(requests.get(img).content).decode('utf-8')
                title = event.find('h2').get_text()
                date = get_after_find(event, 'time', 'datetime')
                date = parser.parse(date).strftime("%Y-%m-%d %H:%M")

                data = check_response(url)
                address = data.find('p', class_='mb-2').get_text()
                await send_json(title, date, address, url, img, logger)
            except AttributeError as e:
                print("Error occurred while parsing event")
            await asyncio.sleep(10)


def run_events():
    print("Kassir:\n")
    asyncio.run(kassir())
