#!/usr/bin/env node
/*import http from 'http'
import app from '../app'*/
var http=require('http');;
var app = require('../app');

//则 app=function(req.res){}
const server=http.createServer(app);
server.listen(8080);
console.log('localhost:8080');