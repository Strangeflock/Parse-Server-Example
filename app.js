var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// parse serve setup
var api = new ParseServer({
  databaseURI: 'mongodb://user:password@xxxx.mlab.com:xxx/database', // Connection string for your MongoDB database
  cloud: __dirname + '/cloud/main.js',
  appId: 'APPLICATION_ID',
  masterKey: 'MASTER_KEY', // Keep this key secret!
  fileKey: 'optionalFileKey',
  serverURL: 'https://yourdomain.com/parse', // Don't forget to change to https if needed
  appName: "Vorto",
  publicServerURL: 'https://yourdomain.com/parse',
  emailAdapter: {
    module: 'parse-server-simple-mailgun-adapter',
    options: {
      // The address that your emails come from
      fromAddress: 'youremailaddress@vyourdomain.com',
      // Your domain from mailgun.com
      domain: 'yourdomain.com',
      // Your API key from mailgun.com
      apiKey: 'API_MAILGUN_KEY'
    }
  }
});

// Parse Dashboard setup. We will host Parse Server and Parse Dashboard on one Linux Server
var dashboard = new ParseDashboard({
"apps": [
    {
      "serverURL": "https://yourdomain.com/parse/server",
      "appId": "APPLICATION_ID",
      "masterKey": "MASTER_KEY",
      "appName": "Name of your app"
    }
  ],
  "users": [
    {
      "user":"user1",
      "pass":"dashboard_password"
    }
  ]
});

// view engine setup
app.use('/server', api);
app.use('/dashboard', dashboard);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var port =  1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

module.exports = app;
