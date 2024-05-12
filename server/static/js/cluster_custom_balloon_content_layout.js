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
    var username = 'admin';
    var password = '9x#?XgjE1@@W';



    // Создаем элемент шапки
    var header = document.createElement('header');
    header.style.position = 'fixed';
    header.style.top = '0';
    header.style.left = '0';
    header.style.width = '100%';
    header.style.height = '40px';
    header.style.background = '#fe6d64';
    header.style.color = '#fff';
    header.style.zIndex = '2';
    header.style.paddingLeft = '10px'; // Отступ текста слева
    header.style.fontSize = '30px'; // Размер текста
    header.style.display = 'flex'; // Для выравнивания элементов по горизонтали
    header.style.alignItems = 'center'; // Выравнивание по вертикали
    header.style.justifyContent = 'space-between'; // Распределение пространства между элементами
    document.body.appendChild(header); // Добавляем шапку в body

    // Задаем название
    var title = document.createElement('div');
    title.innerText = 'ОГРЫЗКИ'; // Текст шапки
    header.appendChild(title); // Добавляем название в шапку

    // Создаем элемент "События"
    var eventsLink = document.createElement('a');
    eventsLink.href = '#'; // Ссылка на события (может быть изменена на реальный URL)
    eventsLink.style.marginRight = '10px'; // Отступ справа
    eventsLink.style.color = 'white'; // Цвет текста
    eventsLink.innerText = 'События'; // Текст ссылки
    // Замените эту функцию на фактическую обработку отображения событий
    eventsLink.onclick = function (event) {
        event.preventDefault();
        // Здесь будет код для отображения событий на карте
    };
    header.appendChild(eventsLink); // Добавляем ссылку "События" в шапку



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
                newsItem.innerHTML = '<h6>' + newsData.title + '</h6>' +
                                     '<button onclick="showFullNews(' + geoObjects.indexOf(geoObject) + ')">Подробнее</button>';
                newsList.appendChild(newsItem);
            });
            newsList.style.display = 'block';
        } else {
            showFullNews(geoObjects.indexOf(target));
        }
    });

       

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
});
