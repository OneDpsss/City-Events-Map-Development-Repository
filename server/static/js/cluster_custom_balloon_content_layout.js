
ymaps.ready(function () {
       var myMap = new ymaps.Map('map', {
  center: [56.326797, 44.006516],
  zoom: 9,
  controls: ['zoomControl'],
  behaviors: ['drag'],
  searchControlProvider: 'yandex#search'
});   
   
   myMap.options.set('minZoom', 5);
   myMap.options.set('maxZoom', 14);
   


    var clusterer = new ymaps.Clusterer({
    preset: 'islands#invertedPinkClusterIcons',
    clusterDisableClickZoom: true,
    openBalloonOnClick: false  
});



    var geoObjects = [];
    var $ = jQuery.noConflict();
    var username = '';
    var password = '';



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
    fullNewsModal.style.top = '50%';
    fullNewsModal.style.left = '50%';
    fullNewsModal.style.transform = 'translate(-50%, -50%)';
    fullNewsModal.style.background = '#fff';
    fullNewsModal.style.padding = '1em';
    fullNewsModal.style.width = '60%';
    fullNewsModal.style.height = '95%';
    fullNewsModal.style.overflowY = 'scroll';
    fullNewsModal.style.display = 'none';
    document.body.appendChild(fullNewsModal);

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
                        var pointOptions;

                        // Цветовая маркировка
                        switch (news.priority) { 
                            case 1:
                                pointOptions = { preset: 'islands#greenIcon' };
                                break;
                            case 2:
                                pointOptions = { preset: 'islands#yellowIcon' };
                                break;
                            case 3:
                                pointOptions = { preset: 'islands#redIcon' };
                                break;
                            default:
                                pointOptions = { preset: 'islands#violetIcon' };
                                break;
                        }

                        var geoObject = new ymaps.Placemark(coordinates, pointOptions);
                        geoObjects.push(geoObject);
                        clusterer.add(geoObject);
                    });
            });
        },
        success: function (data) {
            data.forEach(function (news, index) {
                ymaps.geocode(news.address)
                    .then(function (res) {
                        var coordinates = res.geoObjects.get(0).geometry.getCoordinates();
                        var pointOptions = { preset: 'islands#violetIcon' };
                        var geoObject = new ymaps.Placemark(coordinates, pointOptions);
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
        var fullNewsContent = '<button onclick="hideFullNews()">Закрыть</button>'+'<h4>' + newsData.title + '</h4>' +
                              '<p>' + newsData.description + '</p>' +
                              '<img src="data:image/jpeg;base64,' + newsData.img + '" style="width: 90%; height: 90%;">' 
                            ;
        fullNewsModal.innerHTML = fullNewsContent;
        fullNewsModal.style.display = 'block';
    };

    window.hideFullNews = function() {
        fullNewsModal.style.display = 'none';
    };
});
