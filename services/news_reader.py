import asyncio
import base64

import json
import time
from datetime import datetime
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


# add existence checker and delete news after 7 days


async def send_json(img, post, url, logger):
    try:
        data = json.loads(post)
    except json.JSONDecodeError as e:
        print("err")
        return
    time = datetime.now().strftime("%Y-%m-%d %H:%M")
    data['news_date'] = time
    data['url'] = url
    time = datetime.now().strftime("%d-%m-%Y%H-%M-%S-%f")
    path = f"images/img+{time}.jpg"
    download_image(img, path)
    with open(path, "rb") as file:
        image_data = file.read()
        img = base64.b64encode(image_data).decode('utf-8')
    data['img'] = img
    logger.info(f"{json.dumps(data['url'])}")
    response_to_server_news(data)


async def nnru(logger):
    print("NN.RU:")
    site_url = 'https://www.nn.ru/text/'
    data = check_response(site_url)
    if not (data is None):
        for article in data.find_all('article', class_='OPHIx')[:news_limit]:
            try:
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
                await send_json(img, post, url, logger)
            except AttributeError as e:
                print("Error occurred while  NN RU")
            time.sleep(60)


async def rbc(logger):
    print("RBC:")
    site_url = 'https://nn.rbc.ru/nn/'
    data = check_response(site_url)
    if not (data is None):
        try:
            for article in data.find_all('div',
                                         {'class': 'item js-rm-central-column-item item_image-mob js-category-item'})[
                           :news_limit]:

                url = article.find('a', {'class': 'item__link rm-cm-item-link js-rm-central-column-item-link'}).get(
                    'href')
                img = get_after_find(article, 'img', 'src')
                response = requests.get(url)
                news_data = BeautifulSoup(response.text, 'html.parser')
                text = ""
                if news_data.find('div', {'class': 'article__text__overview'}) is not None:
                    text = news_data.find('div', {'class': 'article__text__overview'}).get_text(strip=True)
                if text == "":
                    return
                post = await SummarizeAiFunc(text)
                await send_json(img, post, url, logger)
                await asyncio.sleep(10)
        except AttributeError as e:
            print("Error occurred while parsing RBC",e)
