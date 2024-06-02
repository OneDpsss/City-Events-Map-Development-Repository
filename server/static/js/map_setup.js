ymaps.ready(function () {
    var myMap = new ymaps.Map('map', {
        center: [56.326797, 44.006516],
        zoom: 9,
        searchControlProvider: 'yandex#search'
    });

    myMap.options.set('minZoom', 5);
    var clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedBlueClusterIcons',
        openBalloonOnClick: false
    });

    var geoObjects = [];
    window.geoObjects = geoObjects; 
    window.clusterer = clusterer; 
    window.myMap = myMap; 
});
