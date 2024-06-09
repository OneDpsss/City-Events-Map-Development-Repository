import asyncio
import base64
import json
import time
import os
from datetime import datetime
from internal.function import *

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Django_config.settings")

news_limit = 5


def get_after_find(article, par1, par2):
    tag = article.find(par1)
    if tag:
        return tag[par2]
    else:
        return None


async def send_json(img, post, url, logger):
    try:
        data = json.loads(post)
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
        return
    time_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    data['news_date'] = time_str
    data['url'] = url
    time_str = datetime.now().strftime("%d-%m-%Y%H-%M-%S-%f")
    path = f"images/img+{time_str}.jpg"
    download_image(img, path)
    with open(path, "rb") as file:
        image_data = file.read()
        img = base64.b64encode(image_data).decode('utf-8')
    data['img'] = img
    logger.info(f"Sending news to server: {json.dumps(data['url'])}")
    response_to_server_news(data)


async def nnru(logger):
    logger.info("Starting NN.RU scraping")
    site_url = 'https://www.nn.ru/text/'
    data = check_response(site_url)
    if data:
        for article in data.find_all('article', class_='OPHIx')[:news_limit]:
            try:
                rubrics = article.find_all(attrs={"slot": "rubrics"})
                city_news = any(r['title'] in ['Город', 'Дороги и транспорт'] for r in rubrics)
                if not city_news:
                    continue

                title = article.find('h2').a['title'] if article.find('h2') else None
                url = 'https://www.nn.ru/' + article.a['href']
                img = get_after_find(article, 'img', 'src')
                response = requests.get(url)
                news_data = BeautifulSoup(response.text, 'html.parser')
                text = title or ""
                overview = news_data.find('div', {'class': 'qQq9J'})
                if overview:
                    text += ". " + overview.get_text(strip=True)

                if not text:
                    continue

                post = await SummarizeAiFunc(text)
                await send_json(img, post, url, logger)
                await asyncio.sleep(40)
            except AttributeError as e:
                logger.error(f"Error occurred while processing NN.RU article: {e}")
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
            finally:
                await asyncio.sleep(60)


async def rbc(logger):
    logger.info("Starting RBC scraping")
    site_url = 'https://nn.rbc.ru/nn/'
    data = check_response(site_url)
    if data:
        try:
            for article in data.find_all('div',
                                         {'class': 'item js-rm-central-column-item item_image-mob js-category-item'})[
                           :news_limit]:
                url = article.find('a', {'class': 'item__link rm-cm-item-link js-rm-central-column-item-link'}).get(
                    'href')
                img = get_after_find(article, 'img', 'src')
                response = requests.get(url)
                news_data = BeautifulSoup(response.text, 'html.parser')
                text = news_data.find('div', {'class': 'article__text__overview'}).get_text(
                    strip=True) if news_data.find('div', {'class': 'article__text__overview'}) else ""

                if not text:
                    continue

                post = await SummarizeAiFunc(text)
                await send_json(img, post, url, logger)
                await asyncio.sleep(40)
        except AttributeError as e:
            logger.error(f"Error occurred while parsing RBC article: {e}")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
