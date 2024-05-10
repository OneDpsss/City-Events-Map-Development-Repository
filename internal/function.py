import requests
from shuttleai import ShuttleAsyncClient
from requests.auth import HTTPBasicAuth
from PIL import Image
from config.config import SHUTTLE_KEY, prompt
from io import BytesIO
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv

load_dotenv()


async def SummarizeAiFunc(input_text):
    print(input_text)
    async with ShuttleAsyncClient(SHUTTLE_KEY, timeout=60) as shuttle:
        response = await shuttle.chat_completion(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": input_text + prompt}],
            stream=False,
            plain=False,
            internet=False,
            max_tokens=100,
            temperature=0.1,
        )
        return response.choices[0].message.content


def filter_func(string):
    words = string.lower().split()
    key_words = [
        "реклам",
        "розыгрыш",
        "друз",
        "рекоменд",
        "показ",
        "бесплат",
        "кешбек",
        " мы ",
        "опрос",
        "мнен",
        "рейтинг",
        "акция",
        "скидк",
        "подпис",
        "рассылк",
        "конкурс",
        "анализ",
        "стать",
        "комментари",
        "опубликова",
        "обзор",
        "обсужден",
        "исследован",
        "интервью",
        "видеообзор",
        "объявлен",
        "эксперт",
        "взгляд",
        "промо",
        "партнер"
    ]
    for word in words:
        for key in key_words:
            if key in word:
                return False
    return True


def get_after_find(article, par1, par2):
    tag = article.find(par1)
    if tag:
        return tag[par2]
    else:
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


def check_response(url):
    response = requests.get(url)
    if response.status_code == 200:
        html = response.text
        return BeautifulSoup(html, 'html.parser')
    else:
        print('Failed to send request. Status code:', response.status_code)
        return None


auth = HTTPBasicAuth(os.getenv('NAME'), os.getenv('PASSWORD'))


def response_to_server_event(post):
    response_post = requests.post(url="https://api.in-map.ru/api/event/", auth=auth, json=post)
    print("POST-запрос:", response_post.status_code)


def response_to_server_news(post):
    response_post = requests.post(url='https://api.in-map.ru/api/news/', json=post, auth=auth)
    print("POST-запрос:", response_post.status_code)
