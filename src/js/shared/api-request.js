import 'whatwg-fetch';
import config from './config';

export default function(endpoint, method = 'GET', body = '') {
    
    let headers = new Headers();
    headers.set('x-api-key', config.API_KEY);
    headers.set('Content-Type', 'application/json');
    
    return fetch(config.API_HOST + endpoint, {
        method: method,
        mode: 'cors',
        headers: headers,
        body: JSON.stringify(body)
    })
    .then((response) => response.json())
}