var $ = jQuery.noConflict();

var eventsLoaded = false; // Флаг для отслеживания загрузки событий
var newsLoaded = false; // Флаг для отслеживания загрузки новостей

var newsLink = document.createElement('a');
newsLink.href = '#';
newsLink.style.color = 'black';
newsLink.innerText = 'Новости';


window.clearMap = function() {
    myMap.geoObjects.removeAll();
    geoObjects = [];
    clusterer.removeAll();
}

newsLink.onclick = function (event) {
    event.preventDefault();

    if (newsLoaded) {
        // Убираем новости с карты
        clearMap();
        newsLoaded = false;
        newsList.style.display = 'none';
        fullNewsModal.style.display = 'none';
        return;
    }

    if (eventsLoaded) {
        // Если загружены события, убираем их перед загрузкой новостей
        clearMap();
        eventsLoaded = false;
        eventsList.style.display = 'none';
        fullEventModal.style.display = 'none';
        
    }
    var username = 'admin';
    var password = '9x#?XgjE1@@W';

    $.ajax({
        url: 'https://api.in-map.ru/api/news/',
        method: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        },
        success: function (data) {
            data.forEach(function (news, index) {
                ymaps.geocode(news.address)
                    .then(function (res) {
                        var coordinates = res.geoObjects.get(0).geometry.getCoordinates();
                        
                        // Цветовая маркировка
                        switch (news.priority) { 
                            case 1:
                                pointOptions = { preset: 'islands#greenCircleDotIcon' };
                                break;
                            case 2:
                                pointOptions = { preset: 'islands#yellowCircleDotIcon' };
                                break;
                            case 3:
                                pointOptions = { preset: 'islands#redCircleDotIcon' };
                                break;
                            default:
                                pointOptions = { preset: 'islands#violetCircleDotIcon' };
                                break;
                        }
                        var geoObject = new ymaps.Placemark(coordinates, null, pointOptions);
                        geoObject.properties.set('newsData', news);
                        geoObjects.push(geoObject);
                        clusterer.add(geoObject);
                        myMap.geoObjects.add(clusterer);
                        myMap.setBounds(clusterer.getBounds(), { checkZoomRange: true });
                    });

            });
            newsLoaded = true; // Устанавливаем флаг после загрузки новостей
        },
        error: function (error) {
            console.error('Error fetching news data:', error);
        }

    });

    clusterer.events.add('click', function (e) {
    var target = e.get('target');
    if (target && target.getGeoObjects) {
        var clickedObjects = target.getGeoObjects();
        var hasValidData = false; // Флаг для отслеживания наличия действительных данных

        newsList.innerHTML = '';
        clickedObjects.forEach(function (geoObject) {
            var newsData = geoObject.properties.get('newsData');

            // Проверяем, существует ли newsData и его свойства
            if (newsData && newsData.title && newsData.address) {
                hasValidData = true; // Устанавливаем флаг, если есть действительные данные

                var newsItem = document.createElement('div');
                newsItem.innerHTML = '<h6 style="cursor: pointer;" onclick="showFullNews(' + geoObjects.indexOf(geoObject) + ')">' + newsData.title + '</h6>';
                newsItem.innerHTML += '<p>' + newsData.address + '</p>';
                newsList.innerHTML += '<div style="border-bottom: 3px solid #ccc; margin-bottom: 10px;"></div>';
                newsList.innerHTML += '<div style="margin-bottom: 10px;"></div>';

                newsList.style.padding = '10px';
                newsList.style.overflowY = 'scroll';
                fullNewsModal.style.cursor = 'pointer';
                window.onclick = function(event) {
                    if (event.target == fullNewsModal && event.target != modalContent) {
                        hideFullNews();
                    }
                };
                newsList.appendChild(newsItem);
            }
        });

        if (hasValidData) {
            newsList.style.display = 'block';
        } else {
            console.error('No valid news data found.');
        }
    } else {
        showFullNews(geoObjects.indexOf(target));
    }
});

};
buttonsContainer.appendChild(newsLink);

window.showFullNews = function(index) {
    var geoObject = geoObjects[index];
    var newsData = geoObject.properties.get('newsData');
    if (!newsData || !newsData.title || !newsData.address) {
        
        console.error('News data or its properties are undefined.');
        
        return;
    }
var newsDate = new Date(newsData.news_date); 
var formattedNewsDate = newsDate.toLocaleString('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});

var fullNewsContent = '<div style="display: flex; justify-content: space-between; align-items: center;">' + 
                                '<p></p>' + 
                                '<img src="data:image/svg+xml;utf8,<svg xmlns=\%22http://www.w3.org/2000/svg\%22 width=\%2224\%22 height=\%2224\%22 viewBox=\%220 0 24 24\%22 fill=\%22none\%22 stroke=\%22%23000000\%22 stroke-width=\%222\%22 stroke-linecap=\%22round\%22 stroke-linejoin=\%22round\%22><line x1=\%2218\%22 y1=\%226\%22 x2=\%226\%22 y2=\%2218\%22/><line x1=\%226\%22 y1=\%226\%22 x2=\%2218\%22 y2=\%2218\%22/></svg>" style="cursor: pointer;" onclick="hideFullNews()">' +
                              '</div>' + '<h4>' + newsData.title + '</h4>'+ 
                              '<p style="color: #888;"><img src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'18\' height=\'18\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23000\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' class=\'feather feather-map-pin\'%3E%3Cpath d=\'M21 10c0 7.5-9 13-9 13S3 17.5 3 10a9 9 0 1118 0z\'%3E%3C/path%3E%3Ccircle cx=\'12\' cy=\'10\' r=\'3\'%3E%3C/circle%3E%3C/svg%3E" style="margin-right: 5px;">' + newsData.address + '</p>' + 
                              '<div style="position: absolute; bottom: 10px; right: 10px; color: #888;">' + formattedNewsDate + '</div>' +
                              '<div style="padding-top: 20px;">';
    
    if (newsData.img!="a") {
        fullNewsContent += '<img id="news-image" src="data:image/jpeg;base64,' + newsData.img + 
                              '" style="max-width: 80%; max-height: 80%; display: block; margin: auto;">' + 
                              '<div style="padding-top: 20px;">';
    }

    fullNewsContent += '<p>' + newsData.description + '</p>' +
                       '<div style="padding-top: 20px; text-align: left;">' + 
                       '<a href="' + newsData.url + '" target="_blank" style="color: #007bff; text-decoration: none;">Перейти к источнику</a>' +
                       '</div>';
    fullNewsModal.querySelector('.modal-content').innerHTML = fullNewsContent;
    fullNewsModal.style.display = 'block';

    
    
};




// Создаем контейнер для списка новостей
var newsList = document.createElement('div');
newsList.id = 'news-list';
document.body.appendChild(newsList);

// Создаем модальное окно для полного описания новости
var fullNewsModal = document.createElement('div');
fullNewsModal.id = 'full-news-modal';
document.body.appendChild(fullNewsModal);

// Создаем контейнер для содержимого модального окна
var modalContent = document.createElement('div');
modalContent.className = 'modal-content';
fullNewsModal.appendChild(modalContent);

window.hideFullNews = function() {
    fullNewsModal.style.display = 'none';

    
    
};

window.onclick = function(event) {
  if (event.target == fullNewsModal && event.target != modalContent) {
    fullNewsModal.style.display = 'none';
  }

};


window.onclick = function(event) {
    if (event.target == newsList) {
        hideNewsList(); // Закрываем боковое окно при клике за его пределами
    }
};

