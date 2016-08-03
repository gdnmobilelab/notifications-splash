import 'whatwg-fetch';
var gju = require('geojson-utils');

class GeoJSONLocationService {
    fetchGeoJSON() {
        var request = new Request('countries-geojson.json');

        if(caches) {
            return caches.open('geo-json').then(function(cache) {
                return cache.match(request).then(function (response) {
                    if (response) {
                        console.log(' Found response in cache:', response);

                        return response;
                    } else {
                        return fetch(request).then((resp) => {
                            return cache.put(request, resp)
                        })
                    }
                }).catch(function (error) {
                    console.log(error);
                });
            })
        } else {
            return fetch(request);
        }
    }

    locationId(lat, long) {
        return new Promise((resolve, reject) => {
            this.fetchGeoJSON().then((resp) => {
                return resp.json();
            }).then((geoJson) => {
                let locationId = null;

                var i;
                //unroll it a bit
                for(i = 0; i < geoJson.features.length; i++) {
                    //Not 100% sure if this is accurate...
                    if(gju.pointInPolygon({"type":"Point","coordinates":[long, lat]}, geoJson.features[i].geometry)) {
                        locationId = geoJson.features[i].id;
                        break;
                    }
                }

                resolve(locationId);
            })
        });
    }
}

export default new GeoJSONLocationService()