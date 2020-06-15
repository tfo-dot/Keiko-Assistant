const { https } = require('follow-redirects'), url = require('url');

module.exports = {
    get(url, headers) { return this._makeRequest(url, headers); },

    _makeRequest(urlString, headers) {
        return new Promise((resolve, reject) => {
            const request = https.get(this._createOptions(url.parse(urlString), headers),
                res => this._onResponse(res, resolve, reject));
            request.on('error', reject);
            request.end();
        });
    },

    _createOptions(url, headers) {
        return {
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