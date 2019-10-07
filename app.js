var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var nunjucks = require('nunjucks');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();
var port = process.env.PORT || 8080;

nunjucks.configure('views', {
  express: app,
  autoescape: true
});

app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.listen(port, () => console.log(`Falala app listening on port ${port}!`));

module.exports = app;
