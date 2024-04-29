import asyncio
import base64

import requests
from PIL import Image
from io import BytesIO

import json
from datetime import datetime
import time
from bs4 import BeautifulSoup
from internal.function import response_to_server, filter_func, SummarizeAiFunc

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Django_config.settings")

news_limit = 1


def get_after_find(article, par1, par2):
    tag = article.find(par1)
    if tag:
        return tag[par2]
    else:
        return None


def check_response(url):
    response = requests.get(url)
    if response.status_code == 200:
        html = response.text
        return BeautifulSoup(html, 'html.parser')
    else:
        print('Failed to send request. Status code:', response.status_code)
        return None


def download_image(url, save_path):
    response = requests.get(url)
    if response.status_code == 200:
        image_content = response.content
        image = Image.open(BytesIO(image_content))
        image.save(save_path)
        return image
    else:
        print("Error downloading image")
        return None


#add existence checker and delete news after 7 days

async def send_json(img, post, url):
    try:
        data = json.loads(post)
    except json.JSONDecoder as e:
        print("err")
        return
    time = datetime.now().strftime("%Y-%m-%d")
    data['news_date'] = time
    time = datetime.now().strftime("%d-%m-%Y%H-%M-%S-%f")
    path = f"images/img+{time}.jpg"
    download_image(img, path)
    with open(path, "rb") as file:
        image_data = file.read()
        img = base64.b64encode(image_data).decode('utf-8')
    data['url'] = url
    data['img'] = img
    data['news_date'] = time
    response_to_server(data)


async def nnru():
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

                response = requests.get(url)
                news_data = BeautifulSoup(response.text, 'html.parser')
                text = title
                if news_data.find('div', {'class': 'qQq9J'}) is not None:
                    text += ". " + news_data.find('div', {'class': 'qQq9J'}).get_text(strip=True)
                if text == "":
                    return

                post = await SummarizeAiFunc(text)
                await send_json(img, post, url)
                prev_data = data
                time.sleep(600)


async def rbc():
    prev_data = None
    while True:
        site_url = 'https://nn.rbc.ru/nn/'
        data = check_response(site_url)
        if not (data is None or prev_data == data):
            for article in data.find_all('div', {'class': 'item js-rm-central-column-item item_image-mob js-category-item'})[
                           :news_limit]:

                url = article.find('a', {'class': 'item__link rm-cm-item-link js-rm-central-column-item-link'}).get('href')
                img = get_after_find(article, 'img', 'src')

                response = requests.get(url)
                news_data = BeautifulSoup(response.text, 'html.parser')
                text = ""
                if news_data.find('div', {'class': 'article__text__overview'}) is not None:
                    text = news_data.find('div', {'class': 'article__text__overview'}).get_text(strip=True)
                if text == "":
                    return
                post = await SummarizeAiFunc(text)
                await send_json(img, post, url)
                prev_data = data
                time.sleep(600)


def run():
    print("NN.RU:\n")
    asyncio.run(nnru())
    print("RBC:\n")
    asyncio.run(rbc())
