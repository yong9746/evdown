const http = require('http');
const https = require('https');
const url = require('url');

// Create an HTTP server
http.createServer((req, res) => {
    // Parse the request URL
    const queryObject = url.parse(req.url, true).query;

    if (queryObject.link && queryObject.zapp_url_stream === '1') {
        const decodedUrl = decodeURIComponent(queryObject.link);
        const parsedUrl = url.parse(decodedUrl);

        // Determine whether to use HTTP or HTTPS
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        // Set up the request options
        const requestOptions = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.path,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        // Make the request to the target URL
        const proxyRequest = protocol.request(requestOptions, (proxyRes) => {
            // Set the status code and headers from the response
            res.writeHead(proxyRes.statusCode, proxyRes.headers);

            // Pipe the data from the proxy response to the client response
            proxyRes.pipe(res);
        });

        // Handle errors in the proxy request
        proxyRequest.on('error', (err) => {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error: ' + err.message);
        });

        // End the proxy request
        proxyRequest.end();
    } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid parameters.');
    }
})
