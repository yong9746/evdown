const express = require('express');
const http = require('http');
const https = require('https');
const url = require('url');
const app = express();

app.get('/', (req, res) => {
    // Parse the query parameters
    const queryObject = req.query;

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
            res.status(500).send('Error: ' + err.message);
        });

        // End the proxy request
        proxyRequest.end();
    } else {
        res.status(400).send('Invalid parameters.');
    }
});

// Use the environment variable PORT provided by Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
