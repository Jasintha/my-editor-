

const path = require('path');
const historyApiFallback = require("connect-history-api-fallback");

const port = process.env.PORT;
const bcp = process.env.BCP;
const bch = process.env.BCH;

const express = require('express');
const http = require('http');
const httpProxy = require('http-proxy');
var proxy = require('http-proxy-middleware');
const forwardHost = bch;
const forwardPort = bcp;

const ruleNodeUiforwardHost = bch;
const ruleNodeUiforwardPort = bcp;

const app = express();
const server = http.createServer(app);

const PORT = port;


app.use(historyApiFallback());


const root = path.join(__dirname, '/build');

app.use( express.static(root));

const apiProxy = httpProxy.createProxyServer({

    target: {
        host: forwardHost,
        port: forwardPort,
    }
});



const ruleNodeUiApiProxy = httpProxy.createProxyServer({

    target: {
        host: ruleNodeUiforwardHost,
        port: ruleNodeUiforwardPort
    }
});




apiProxy.on('error', function (err, req, res) {
    console.warn('API proxy error: ' + err);
    res.end('Error.');
});

ruleNodeUiApiProxy.on('error', function (err, req, res) {
    console.warn('RuleNode UI API proxy error: ' + err);
    res.end('Error.');
});

//console.info(`Forwarding API requests to http://${forwardHost}:${forwardPort}`);
//console.info(`Forwarding Rule Node UI requests to http://${ruleNodeUiforwardHost}:${ruleNodeUiforwardPort}`);

app.all('/api/*', (req, res) => {

    apiProxy.web(req, res)
});

app.all('/static/rulenode/*', (req, res) => {
    ruleNodeUiApiProxy.web(req, res);
});

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build/index.html'));
});

server.on('upgrade', (req, socket, head) => {
    apiProxy.ws(req, socket, head);
});

server.listen(PORT, '0.0.0.0', (error) => {
    if (error) {
        console.error(error);
    } else {
        console.info(`==> 🌎  Listening on port ${bch}:${bcp}`);
    }
});
