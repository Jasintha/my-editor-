var createError = require('http-errors');
var proxy = require('http-proxy-middleware');
var express = require('express');
var path = require('path');
var browserSync = require('browser-sync').create();
 

module.exports = app; 


var DIST_DIR = path.join(__dirname, "build");
var PORT = 3000;
 

//var backend = 'http://localhost:8080';
var backend = 'http://twillo-studio-service:8080';

var wsProxy = proxy('/api', {
  target:backend,
 // pathRewrite: {'^/api' : 'admin/api'},
  changeOrigin: true, // for vhosted sites, changes host header to match to target's host
  ws: true, // enable websocket proxy
  onProxyRes,
  logLevel: 'debug'
});

var ruleProxy = proxy('/artifacts', {
  target:backend,
 pathRewrite: {'^/artifacts' : '/api/artifacts'},
  changeOrigin: true, // for vhosted sites, changes host header to match to target's host
  ws: true, // enable websocket proxy
  onProxyRes,
  logLevel: 'debug'
});



function onProxyRes(proxyRes, req, res) {
 // proxyRes.headers['x-added'] = 'foobar';
 delete proxyRes.headers['content-security-policy-report-only'];
 delete proxyRes.headers['content-security-policy'];
}
/*
browserSync.init({
  server: {
    baseDir: './',
    port: 3000,
    middleware: [jsonPlaceholderProxy]
  },
  startPath: '/'
});
*/

var app = express();
//app.use('/static', express.static(DIST_DIR)); // demo page

app.use(express.static('./build'));

//app.use('/static',express.static('./build/static'));

app.use(wsProxy); // ad

app.use(ruleProxy);
 
app.listen(PORT);

console.log('[DEMO] Server: listening on port 3000');
console.log('[DEMO] Opening: http://localhost:3000/');

//require('open')('http://localhost:3000/users');