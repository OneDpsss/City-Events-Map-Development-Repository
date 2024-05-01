ymaps.ready(function () {
    var myMap = new ymaps.Map('map', {
        center: [56.326797, 44.006516],
        zoom: 10
    }, {
        searchControlProvider: 'yandex#search'
    });

    var clusterer = new ymaps.Clusterer({
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false
    });

    var geoObjects = [];
    var $ = jQuery.noConflict();
    var username = 'admin';
    var password = 'admin';


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
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password)); 
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
                              '<img src="data:image/jpeg;base64,' + newsData.img + '" style="width: 90%; height: auto;">' 
                            ;
        fullNewsModal.innerHTML = fullNewsContent;
        fullNewsModal.style.display = 'block';
    };

    window.hideFullNews = function() {
        fullNewsModal.style.display = 'none';
    };
});