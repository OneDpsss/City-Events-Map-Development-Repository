import asyncio
import base64
import requests
from requests.auth import HTTPBasicAuth
import json
from datetime import datetime
import time
from dateutil import parser
from bs4 import BeautifulSoup
from internal.function import check_response, get_after_find

event_limit = 5


# дата удаляется сразу после ивента
auth = HTTPBasicAuth('admin', 'admin')


async def send_json(title, date, address, url, img,logger):
    data = {}
    data['title'] = title
    data['event_date'] = date
    data['address'] = address
    data['url'] = url
    data['img'] = img
    print(data)
    logger.info(f"{data["url"]}")
    response_to_server(data)


def response_to_server(post):
    response_post = requests.post(url='https://api.in-map.ru/api/events/', json=post, auth=auth)
    print("POST-запрос:", response_post.json())

async def kassir(logger):
    prev_data = None
    #while True:
    site_url = 'https://nn.kassir.ru/selection/luchshee-v-nijnem-novgorode'
    data = check_response(site_url)
    if not (data is None or prev_data == data):
        for event in data.find_all('li', class_='my-4.5 xl:my-4 lg:my-2 md:my-5 sm:my-3 xs:my-2')[:event_limit]:
            url = 'https://nn.kassir.ru' + event.find('a', {'class': 'recommendation-item_img-block compilation-tile__img-block'}).get('href')
            img = get_after_find(event, 'img', 'src')
            img = base64.b64encode(requests.get(img).content).decode('utf-8')
            title = event.find('h2').get_text()
            address = event.find('a', {'class': 'recommendation-item_venue compilation-tile__venue hover:underline'}).get_text()
            date = get_after_find(event, 'time', 'datetime')
            date = parser.parse(date).strftime("%Y-%m-%d %H:%M")

            #print(title, '\n', date, '\n', address, '\n', url, '\n', img, '\n\n\n')
            await send_json(title, date, address, url, img,logger)


def run_events():
    print("Kassir:\n")
    asyncio.run(kassir())