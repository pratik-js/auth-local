const express = require('express');
const apiRoutes = require('./api');

const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// res.header("Access-Control-Allow-Credentials", true);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    res.header('Access-Control-Allow-Methods', 'GET,PATCH,POST,DELETE,OPTIONS');
    next();
});
app.use(apiRoutes);

const server = require('http').createServer(app);
const port = process.env.PORT || 8000;
const ip = process.env.IP || 'localhost';
setImmediate(() => {
    server.listen(port, ip, () => {
        console.log('Express server listening on http://%s:%d, in %s mode', ip, port, process.env.NODE_ENV || 'dev')
    })
});

module.exports = { app };