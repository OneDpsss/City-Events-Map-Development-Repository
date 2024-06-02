var $ = jQuery.noConflict();

var eventsLoaded = false; // Флаг для отслеживания загрузки событий
var newsLoaded = false; // Флаг для отслеживания загрузки новостей

window.clearMap = function() {
    myMap.geoObjects.removeAll();
    geoObjects = [];
    clusterer.removeAll();
}


var eventsLink = document.createElement('a');
eventsLink.href = '#';
eventsLink.style.color = 'black';
eventsLink.style.marginRight = '20px';
eventsLink.innerText = 'События';


eventsLink.onclick = function (event) {
    event.preventDefault();

    if (eventsLoaded) {
        // Убираем события с карты
        clearMap();
        eventsLoaded = false;
        eventsList.style.display = 'none';
        fullEventModal.style.display = 'none';
        return;
    }

    if (newsLoaded) {
        // Если загружены новости, убираем их перед загрузкой событий
        clearMap();
        newsLoaded = false;
        newsList.style.display = 'none';
        fullNewsModal.style.display = 'none';
        
    }
    
    var username = 'admin';
    var password = '9x#?XgjE1@@W';

    $.ajax({
        url: 'https://api.in-map.ru/api/events/',
        method: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        },
        success: function (data) {
            data.forEach(function (event, index) {
                ymaps.geocode(event.address)
                    .then(function (res) {
                        var coordinates = res.geoObjects.get(0).geometry.getCoordinates();

                        pointOptions = { preset: 'islands#violetCircleDotIcon' };
                        var geoObject = new ymaps.Placemark(coordinates, null, pointOptions);
                        geoObject.properties.set('eventData', event);
                        geoObjects.push(geoObject);
                        clusterer.add(geoObject);
                        myMap.geoObjects.add(clusterer);
                        myMap.setBounds(clusterer.getBounds(), { checkZoomRange: true });
                    });
            });
            eventsLoaded = true;
        },
        error: function (error) {
            console.error('Error fetching event data:', error);
        }
    });

    clusterer.events.add('click', function (e) {
    var target = e.get('target');
    if (target && target.getGeoObjects) {
        var clickedObjects = target.getGeoObjects();
        var hasValidData = false; // Флаг для отслеживания наличия действительных данных

        eventsList.innerHTML = '';
        clickedObjects.forEach(function (geoObject) {
            var eventData = geoObject.properties.get('eventData');

            // Проверяем, существует ли eventData и его свойства
            if (eventData && eventData.title && eventData.address) {
                hasValidData = true; // Устанавливаем флаг, если есть действительные данные

                var eventItem = document.createElement('div');
                eventItem.innerHTML = '<h6 style="cursor: pointer;" onclick="showFullEvent(' + geoObjects.indexOf(geoObject) + ')">' + eventData.title + '</h6>';
                eventItem.innerHTML += '<p>' + eventData.address + '</p>';
                eventsList.innerHTML += '<div style="border-bottom: 3px solid #ccc; margin-bottom: 10px;"></div>';
                eventsList.innerHTML += '<div style="margin-bottom: 10px;"></div>';

                eventsList.style.padding = '10px';
                eventsList.style.overflowY = 'scroll';
                fullEventModal.style.cursor = 'pointer';
                window.onclick = function(event) {
                    if (event.target == fullEventModal && event.target != modalContent) {
                        hideFullEvent();
                    }
                };
                eventsList.appendChild(eventItem);
            }
        });

        if (hasValidData) {
            eventsList.style.display = 'block';
        } else {
            console.error('No valid event data found.');
        }
    } else {
        showFullEvent(geoObjects.indexOf(target));
    }
});


};
buttonsContainer.appendChild(eventsLink);


// Создаем контейнер для списка событий
var eventsList = document.createElement('div');
eventsList.id = 'events-list';
document.body.appendChild(eventsList);

// Создаем модальное окно для полного описания события
var fullEventModal = document.createElement('div');
fullEventModal.id = 'full-event-modal';
document.body.appendChild(fullEventModal);

// Создаем контейнер для содержимого модального окна
var modalContent = document.createElement('div');
modalContent.className = 'modal-content';
fullEventModal.appendChild(modalContent);

window.showFullEvent = function(index) {
    var geoObject = geoObjects[index];
    var eventData = geoObject.properties.get('eventData');
    // Проверяем, существует ли eventData
    if (!eventData || !eventData.title || !eventData.address) {
        
        console.error('Event data or its properties are undefined.');

        return;
    }
    var fullEventContent = '<div style="display: flex; justify-content: space-between; align-items: center;">' + 
                            '<p></p>' + 
                            '<img src="data:image/svg+xml;utf8,<svg xmlns=\%22http://www.w3.org/2000/svg\%22 width=\%2224\%22 height=\%2224\%22 viewBox=\%220 0 24 24\%22 fill=\%22none\%22 stroke=\%22%23000000\%22 stroke-width=\%222\%22 stroke-linecap=\%22round\%22 stroke-linejoin=\%22round\%22><line x1=\%2218\%22 y1=\%226\%22 x2=\%226\%22 y2=\%2218\%22/><line x1=\%226\%22 y1=\%226\%22 x2=\%2218\%22 y2=\%2218\%22/></svg>" style="cursor: pointer;" onclick="hideFullEvent()">' +
                          '</div>' + '<h4>' + eventData.title + '</h4>' + 
                          '<p style="color: #888;"><img src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'18\' height=\'18\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23000\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' class=\'feather feather-map-pin\'%3E%3Cpath d=\'M21 10c0 7.5-9 13-9 13S3 17.5 3 10a9 9 0 1118 0z\'%3E%3C/path%3E%3Ccircle cx=\'12\' cy=\'10\' r=\'3\'%3E%3C/circle%3E%3C/svg%3E" style="margin-right: 5px;">' + eventData.address + '</p>' + 
                          '<div style="padding-top: 20px;">' +
                          '<img src="data:image/jpeg;base64,' + eventData.img + 
                          '" style="max-width: 100%; max-height: 500px; display: block; margin: auto; border-radius: 10px;">' +
                          '<div style="padding-top: 20px; text-align: center;">' + 
                              '<a href="' + eventData.url + '" target="_blank" style="color: #007bff; text-decoration: none;">Перейти к событию</a>' +
                          '</div>'; 
    fullEventModal.innerHTML = fullEventContent;
    fullEventModal.style.display = 'block';

};

window.hideFullEvent = function() {
    fullEventModal.style.display = 'none';
    
};

window.onclick = function(event) {
    if (event.target == eventsList) {
        hideEventsList();
    }
};
