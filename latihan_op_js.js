// Inisialisasi peta
var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM() // Peta dasar OpenStreetMap
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([110.38310352425505, -7.795505117287234]), // Koordinat pusat peta (0, 0)
        zoom: 11 // Level zoom awal
    })
});

// GEOLOCATION
var geolocation = new ol.Geolocation({
    trackingOptions: {
        enableHighAccuracy: true
    },
    projection: map.getView().getProjection()
});

var geolocationButton = document.getElementById('geolocation-button');
geolocationButton.addEventListener('click', function () {
    geolocation.setTracking(true);
});

geolocation.on('change:position', function () {
    var coordinates = geolocation.getPosition();
    if (coordinates) {
        map.getView().animate({ center: coordinates, zoom: 16 });
        geolocation.setTracking(false);

        // Tambahkan fitur marker di lokasi pengguna
        var markerFeature = new ol.Feature(new ol.geom.Point(coordinates));
        var markerSource = new ol.source.Vector({
            features: [markerFeature]
        });
        var markerLayer = new ol.layer.Vector({
            source: markerSource,
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7, // Atur ukuran titik sesuai kebutuhan Anda
                    fill: new ol.style.Fill({
                        color: 'blue' // Atur warna titik sesuai kebutuhan Anda
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'white', // Atur warna garis tepi titik sesuai kebutuhan Anda
                        width: 3 // Atur lebar garis tepi titik sesuai kebutuhan Anda
                    })
                })
            })
        });
        map.addLayer(markerLayer);
    }
});

// Memuat file GeoJSON
var vectorSource = new ol.source.Vector({
    url: 'Data/data.geojson',
    format: new ol.format.GeoJSON()
});

var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: new ol.style.Style({
        // Atur gaya vektor sesuai kebutuhan Anda
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 0, 0, 0.1)'
        })
    })
});
map.addLayer(vectorLayer);

var overlay = new ol.Overlay({
    element: document.getElementById('popup'),
    autoPan: true,
    autoPanAnimation: {
        duration: 150
    }
});
map.addOverlay(overlay);

var popupContent = document.getElementById('popup-content');
var popupCloser = document.getElementById('popup-closer');

var popupProperties = ['Nama'];
var propertyAliases = {
    Nama: 'Nama'
};

map.on('singleclick', function (evt) {
    overlay.setPosition(undefined);
    map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        var coordinates = evt.coordinate;
        var properties = feature.getProperties();
        var content = '<ul>';
        for (var property in properties) {
            if (properties.hasOwnProperty(property) && popupProperties.includes(property)) {
                var alias = propertyAliases[property] || property;
                content += '<li><b>' + alias + ':</b> ' + properties[property] + '</li>';
            }
        }
        content += '</ul>';
        popupContent.innerHTML = content;
        overlay.setPosition(coordinates);

        // Setel properti 'clicked' pada fitur yang diklik
        feature.set('clicked', true);
    });
});

popupCloser.onclick = function () {
    overlay.setPosition(undefined);
    popupCloser.blur();

    // Reset properti 'clicked' pada semua fitur
    vectorSource.forEachFeature(function (feature) {
        feature.set('clicked', false);
    });

    return false;
};


// Tambahkan OL Ext Search Control
var searchControl = new ol.control.Search({
    layer: vectorLayer.getSource(), // Gunakan layer vectorLayer sebagai layer pencarian
    property: 'Nama', // Ganti 'Nama' dengan atribut yang ingin Anda gunakan sebagai pencarian
    circleRadius: 5,
    collapsed: false,
    zoom: 14,
  });
  map.addControl(searchControl);