import asyncio

import requests
from bs4 import BeautifulSoup
import time
# from models import News
# from django.http import JsonResponse

import g4f

from g4f.Provider import (
    Bard,
    Bing,
    HuggingChat,
    OpenAssistant,
    OpenaiChat,
)

# Сделаю ветку с django которая не работает друзья

news_limit = 1

promt = """На русском языке:
       "1) Опишите заголовок события, уделяя внимание ключевым аспектам.
        2)  Укажите место события в формате Город, улица (при наличии), дом (при наличии), и исключите лишние локационные детали.(Все события происходят В Нижнем Новгороде)
        3) Переформулируйте информацию, предоставив более точный контекст."""


async def parsing_func(input_text):
    response = await g4f.ChatCompletion.create_async(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": promt + input_text}],
        # stream=True,
    )
    output_text = ""
    for msg in response:
        output_text += msg
    return output_text


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


# вот тут вообще не понял как это должно работать друзья
# def add_to_database(request):
#     if request.method == 'POST':
#         id = request.POST.get('id')
#         title = request.POST.get('title')
#         description = request.POST.get('description')
#         date = request.POST.get('date')
#         place = request.POST.get('place')
#         url = request.POST.get('url')
#         img = request.POST.get('img')
#
#         new_data = News(id=id, title=title, description=description, date=date, place=place, url=url, img=img)
#         new_data.save()
#
#         return JsonResponse({'message': 'Data added to database'})
#     else:
#         return JsonResponse({'error': 'Error'}, status=405)


# def pass_news(id, title, description, date, place, url, img):
#     server = 'http://kerilserver.com/add_data/'  # адрес сервера Керила
#     news = {
#         'id': id,
#         'title': title,
#         'description': description,
#         'date': date,
#         'place': place,
#         'url': url,
#         'img': img
#     }
#
#     response = requests.post(server, data=news)
#     print(response.json())

async def nnru():
    site_url = 'https://www.nn.ru/text/'
    data = check_response(site_url)
    if data is None:
        return

    for article in data.find_all('article', class_='OPHIx')[:news_limit]:
        title = None
        tag = article.find('h2')
        if tag:
            title = tag.a['title']

        date = get_after_find(article, 'time', 'datetime')
        url = 'https://www.nn.ru/' + article.a['href']
        img = get_after_find(article, 'img', 'src')

        response = requests.get(url)
        news_data = BeautifulSoup(response.text, 'html.parser')
        text = ''
        if news_data.find('div', {'class': 'qQq9J'}) is not None:
            text = news_data.find('div', {'class': 'qQq9J'}).text

        post = await parsing_func(text)
        print(post)

        print(title, '\n', text, '\n', date, '\n', url, '\n', img, '\n\n\n')
        #pass_news(0, title, '', date, '', url, img)

async def rbc():
    site_url = 'https://nn.rbc.ru/nn/'
    data = check_response(site_url)
    if data is None:
        return


    for article in data.find_all('div', {'class': 'item js-rm-central-column-item item_image-mob js-category-item'})[:news_limit]:
        title = article.find('span', {'class': 'normal-wrap'}).text
        date = article.find('span', {'class': 'item__category'}).text
        url = article.find('a', {'class': 'item__link rm-cm-item-link js-rm-central-column-item-link'}).get('href')
        img = get_after_find(article, 'img', 'src')

        response = requests.get(url)
        news_data = BeautifulSoup(response.text, 'html.parser')
        text = ''
        if news_data.find('p') is not None:
            text = news_data.find('p').text

        post = await parsing_func(text)
        print(post)

        print(title, '\n', text, '\n', date, '\n', url, '\n', img, '\n\n\n')
        #pass_news(0, title, '', date, '', url, img)



while True:
    print("NN.RU:\n")
    asyncio.run(nnru())
    print("RBC:\n")
    asyncio.run(rbc())
    time.sleep(60)
