ymaps.ready(function () {
       var myMap = new ymaps.Map('map', {
  center: [56.326797, 44.006516],
  zoom: 9,
  
  
  searchControlProvider: 'yandex#search'
});   
   
   myMap.options.set('minZoom', 5);
   
   


    var clusterer = new ymaps.Clusterer({
    preset: 'islands#invertedBlueClusterIcons',
    
    openBalloonOnClick: false,  // Added this line

});

   


    var geoObjects = [];
    var $ = jQuery.noConflict();
    


     

    

    // Создаем элемент шапки
var header = document.createElement('header');
header.style.position = 'fixed';
header.style.top = '0';
header.style.left = '0';
header.style.width = '100%';
header.style.height = '40px';
header.style.background = '#fff';
header.style.color = '#000';
header.style.zIndex = '2';
header.style.padding = '0 10px'; // Отступы слева и справа
header.style.display = 'flex'; // Используем flexbox для выравнивания элементов
header.style.alignItems = 'center'; // Выравнивание по вертикали
header.style.justifyContent = 'space-between'; // Равномерное распределение пространства между элементами
document.body.appendChild(header); // Добавляем шапку в body

// Создаем контейнер для изображений
var imagesContainer = document.createElement('div');
imagesContainer.style.display = 'flex'; // Используем flexbox для выравнивания изображений
imagesContainer.style.alignItems = 'center'; // Выравнивание по вертикали
imagesContainer.style.marginRight = '20px'; // Отступ справа
header.appendChild(imagesContainer); // Добавляем контейнер в шапку

// Создаем первое изображение
var img1 = document.createElement('img');
img1.src = 'img/title.png'; // URL изображения
img1.style.height = '30px'; // Высота изображения
img1.style.width = 'auto'; // Ширина изображения
imagesContainer.appendChild(img1); // Добавляем изображение в контейнер

// Создаем второе изображение
var img2 = document.createElement('img');
img2.src = 'img/title2.png'; // URL изображения
img2.style.height = '30px'; // Высота изображения
img2.style.width = 'auto'; // Ширина изображения
imagesContainer.appendChild(img2); // Добавляем изображение в контейнер

// Создаем контейнер для кнопок
var buttonsContainer = document.createElement('div');
buttonsContainer.style.display = 'flex'; // Используем flexbox для выравнивания кнопок
buttonsContainer.style.alignItems = 'center'; // Выравнивание по вертикали
header.appendChild(buttonsContainer); // Добавляем контейнер в шапку







// Создаем кнопку "События"
var eventsLink = document.createElement('a');
eventsLink.href = '#'; 
eventsLink.style.marginRight = '20px'; // Отступ справа
eventsLink.style.color = 'black'; // Цвет текста
eventsLink.innerText = 'События'; // Текст ссылки

/*
eventsLink.onclick = function (event) {
    
    event.preventDefault();
    var username = '';
    var password = '';
    $.ajax({
        url: 'https://api.in-map.ru/api/events/',
        method: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        },
        
        success: function (data) {
            data.forEach(function (events, index) {
                ymaps.geocode(events.address)
                    .then(function (res) {
                        var coordinates = res.geoObjects.get(0).geometry.getCoordinates();
                        
                        
                        var geoObject = new ymaps.Placemark(coordinates, null, pointOptions);
                        geoObject.properties.set('eventsData', events);
                        geoObjects.push(geoObject);
                        clusterer.add(geoObject);
                        myMap.geoObjects.add(clusterer);
                        myMap.setBounds(clusterer.getBounds(), { checkZoomRange: true });
                    });

            });
        },
        error: function (error) {
            console.error('Error fetching events data:', error);
        }


    });

    
    clusterer.events.add('click', function (e) {
        var target = e.get('target');
        if (target && target.getGeoObjects) {
            var clickedObjects = target.getGeoObjects();
            eventsList.innerHTML = '';
            clickedObjects.forEach(function (geoObject) {
                var eventsItem = document.createElement('div');
                var eventsData = geoObject.properties.get('eventsData');
                eventsItem.innerHTML = '<h6>' + eventsData.title + '</h6>' +
                                     '<button onclick="showFullEvents(' + geoObjects.indexOf(geoObject) + ')">Подробнее</button>';
                eventsList.appendChild(eventsItem);
            });
            eventsList.style.display = 'block';
        } else {
            showFullEvents(geoObjects.indexOf(target));
        }
    });
};*/
buttonsContainer.appendChild(eventsLink); // Добавляем кнопку "События" в контейнер









// Создаем кнопку "Новости"
var newsLink = document.createElement('a');
newsLink.href = '#'; // Ссылка на новости (может быть изменена на реальный URL)
newsLink.style.color = 'black'; // Цвет текста
newsLink.innerText = 'Новости'; // Текст ссылки


// Замените эту функцию на фактическую обработку отображения новостей
newsLink.onclick = function (event) {
    
    event.preventDefault();
    var username = '';
    var password = ''
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
        },
        error: function (error) {
            console.error('Error fetching news data:', error);
        }


    });

    
    clusterer.events.add('click', function (e) {
        var target = e.get('target');
        if (target && target.getGeoObjects) {
            var clickedObjects = target.getGeoObjects();
            newsList.innerHTML = '';
            clickedObjects.forEach(function (geoObject) {
                var newsItem = document.createElement('div');
                var newsData = geoObject.properties.get('newsData');
                newsItem.innerHTML = '<h6 style="cursor: pointer;" onclick="showFullNews(' + geoObjects.indexOf(geoObject) + ')">' + newsData.title + '</h6>';
                // В функции newsLink.onclick после добавления новости добавим разделитель и отступы
                newsList.innerHTML += '<div style="border-bottom: 3px solid #ccc; margin-bottom: 10px;"></div>'; // Разделитель
                newsList.innerHTML += '<div style="margin-bottom: 10px;"></div>'; // Отступ

                // Добавим стилизацию для разделителя и отступов между новостями
                newsList.style.padding = '10px'; // Отступы внутри списка новостей
                newsList.style.overflowY = 'scroll'; // Добавим вертикальную прокрутку, если новостей много

                // Добавим стилизацию для закрытия окна при клике за его пределами
                fullNewsModal.style.cursor = 'pointer'; // Указатель при наведении на модальное окно

// Проверим, что окно закрывается при клике за его пределами
window.onclick = function(event) {
  if (event.target == fullNewsModal && event.target != modalContent) {
    hideFullNews();
  }
};

                newsList.appendChild(newsItem);
            });
            newsList.style.display = 'block';
        } else {
            showFullNews(geoObjects.indexOf(target));
        }
    });
};
buttonsContainer.appendChild(newsLink); // Добавляем кнопку "Новости" в контейнер




    var newsList = document.createElement('div');
    newsList.id = 'news-list';
    newsList.style.position = 'fixed';
    newsList.style.right = '0';
    newsList.style.top = '40px';
    newsList.style.width = '20%';
    newsList.style.height = '90%';
    newsList.style.overflowY = 'scroll';
    newsList.style.display = 'none';
    document.body.appendChild(newsList);




var fullNewsModal = document.createElement('div');
fullNewsModal.id = 'full-news-modal';
fullNewsModal.style.position = 'fixed';
fullNewsModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
fullNewsModal.style.top = '50%';
fullNewsModal.style.left = '50%';
fullNewsModal.style.transform = 'translate(-50%, -50%)';
fullNewsModal.style.background = '#fff';
fullNewsModal.style.padding = '1em';
fullNewsModal.style.width = '45%'; 
fullNewsModal.style.height = '85%'; 
fullNewsModal.style.display = 'none';
fullNewsModal.style.borderRadius = '10px'; 
document.body.appendChild(fullNewsModal);



var modalContent = document.createElement('div');  // создаем контейнер для контента модального окна
modalContent.style.position = 'relative';
modalContent.style.width = '100%';
modalContent.style.height = '100%';
fullNewsModal.appendChild(modalContent);

/*
    window.showFullEvents = function(index) {
    var geoObject = geoObjects[index];
    var newsData = geoObject.properties.get('newsData');
    var fullNewsContent = '<div style="display: flex; justify-content: space-between; align-items: center;">' + 
                            '<p></p>' + 
                            '<img src="data:image/svg+xml;utf8,<svg xmlns=\%22http://www.w3.org/2000/svg\%22 width=\%2224\%22 height=\%2224\%22 viewBox=\%220 0 24 24\%22 fill=\%22none\%22 stroke=\%22%23000000\%22 stroke-width=\%222\%22 stroke-linecap=\%22round\%22 stroke-linejoin=\%22round\%22><line x1=\%2218\%22 y1=\%226\%22 x2=\%226\%22 y2=\%2218\%22/><line x1=\%226\%22 y1=\%226\%22 x2=\%2218\%22 y2=\%2218\%22/></svg>" style="cursor: pointer;" onclick="hideFullNews()">' +
                          '</div>' + '<h4>' + newsData.title + '</h4>'+ '<div style="padding-top: 20px;">' +
                          '<img src="data:image/jpeg;base64,' + newsData.img + 
                          '" style="max-width: 90%; max-height: 90%; display: block; margin: auto;">' +
                          '<div style="padding-top: 20px;">'  +
                          '</div>'; 
    fullNewsModal.innerHTML = fullNewsContent;
    fullNewsModal.style.display = 'block';
    
};*/

   window.showFullNews = function(index) {
    var geoObject = geoObjects[index];
    var newsData = geoObject.properties.get('newsData');
    var fullNewsContent = '<div style="display: flex; justify-content: space-between; align-items: center;">' + 
                            '<p></p>' + 
                            '<img src="data:image/svg+xml;utf8,<svg xmlns=\%22http://www.w3.org/2000/svg\%22 width=\%2224\%22 height=\%2224\%22 viewBox=\%220 0 24 24\%22 fill=\%22none\%22 stroke=\%22%23000000\%22 stroke-width=\%222\%22 stroke-linecap=\%22round\%22 stroke-linejoin=\%22round\%22><line x1=\%2218\%22 y1=\%226\%22 x2=\%226\%22 y2=\%2218\%22/><line x1=\%226\%22 y1=\%226\%22 x2=\%2218\%22 y2=\%2218\%22/></svg>" style="cursor: pointer;" onclick="hideFullNews()">' +
                          '</div>' + '<h4>' + newsData.title + '</h4>'+ '<div style="padding-top: 20px;">' +
                          '<img src="data:image/jpeg;base64,' + newsData.img + 
                          '" style="max-width: 90%; max-height: 90%; display: block; margin: auto;">' +
                          '<div style="padding-top: 20px;">' + 
                               
                              '<p>' + newsData.description + '</p>' +
                          '</div>'; 
    fullNewsModal.innerHTML = fullNewsContent;
    fullNewsModal.style.display = 'block';
    
};


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


});
