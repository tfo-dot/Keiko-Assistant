const http = require('http'), url = require('url');

module.exports = {
    get(url, headers) { return this._makeRequest(url, headers); },

    _makeRequest(urlString, headers) {
        return new Promise((resolve, reject) => {
            const request = http.get(this._createOptions(url.parse(urlString), headers),
                res => this._onResponse(res, resolve, reject));
            request.on('error', reject);
            request.end();
        });
    },

    _createOptions(url, headers) {
        return requestOptions = {
            hostname: url.hostname, path: url.path,
            port: url.port, headers: headers
        };
    },

    _onResponse(response, resolve, reject) {
        var responseBody = '';
        if (response.status >= 400) reject(`Request to ${response.url} failed with HTTP ${response.status}`);
        response.on('data', chunk => responseBody += chunk.toString());
        response.on('end', () => resolve(responseBody));
    }
};