import asyncio
import base64

import json
from datetime import datetime
import time
from bs4 import BeautifulSoup
from internal.function import *

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Django_config.settings")

news_limit = 5


def get_after_find(article, par1, par2):
    tag = article.find(par1)
    if tag:
        return tag[par2]
    else:
        return None

#add existence checker and delete news after 7 days


async def send_json(img, post, url,logger):
    try:
        data = json.loads(post)
    except json.JSONDecoder as e:
        print("err")
        return
    time = datetime.now().strftime("%Y-%m-%d")
    data['news_date'] = time
    data['url'] = url
    data['img'] = img
    data['news_date'] = time
    logger.info(f"{data["url"]}")
    response_to_server(data)


async def nnru(logger):
    prev_data = None
    while True:
        site_url = 'https://www.nn.ru/text/'
        data = check_response(site_url)
        if not (data is None or prev_data == data):
            for article in data.find_all('article', class_='OPHIx')[:news_limit]:

                rubrics = article.find_all(attrs={"slot": "rubrics"})
                city_news = False
                for r in rubrics:
                    if r['title'] == 'Город' or r['title'] == 'Дороги и транспорт':
                        city_news = True

                if not city_news:
                    continue

                title = None
                tag = article.find('h2')
                if tag:
                    title = tag.a['title']

                url = 'https://www.nn.ru/' + article.a['href']
                img = get_after_find(article, 'img', 'src')
                img = base64.b64encode(requests.get(img).content).decode('utf-8')
                response = requests.get(url)
                news_data = BeautifulSoup(response.text, 'html.parser')
                text = title
                if news_data.find('div', {'class': 'qQq9J'}) is not None:
                    text += ". " + news_data.find('div', {'class': 'qQq9J'}).get_text(strip=True)
                if text == "":
                    return

                post = await SummarizeAiFunc(text)
                await send_json(img, post, url,logger)
                prev_data = data
                time.sleep(600)


async def rbc(logger):
    prev_data = None
    while True:
        site_url = 'https://nn.rbc.ru/nn/'
        data = check_response(site_url)
        if not (data is None or prev_data == data):
            for article in data.find_all('div', {'class': 'item js-rm-central-column-item item_image-mob js-category-item'})[
                           :news_limit]:

                url = article.find('a', {'class': 'item__link rm-cm-item-link js-rm-central-column-item-link'}).get('href')
                img = get_after_find(article, 'img', 'src')
                img = base64.b64encode(requests.get(img).content).decode('utf-8')
                response = requests.get(url)
                news_data = BeautifulSoup(response.text, 'html.parser')
                text = ""
                if news_data.find('div', {'class': 'article__text__overview'}) is not None:
                    text = news_data.find('div', {'class': 'article__text__overview'}).get_text(strip=True)
                if text == "":
                    return
                post = await SummarizeAiFunc(text)
                await send_json(img, post, url,logger)
                prev_data = data
                time.sleep(600)


def run_news():
    #print("NN.RU:\n")
    #asyncio.run(nnru())
    print("RBC:\n")
    asyncio.run(rbc())