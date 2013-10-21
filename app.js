
/**
 * Module dependencies.
 */

var express = require('express');
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
var routes = require('./routes');
var path = require('path');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./test.db');


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


io.sockets.on('connection', function (socket) {
  db.all("SELECT * FROM machines ORDER BY id;", function (err, rows) {
  	console.log(rows);
	socket.emit('machines', rows);
  });
  socket.on('update_machine', function (data) {
    console.log(data);
	db.parallelize(function () {
		db.run("UPDATE machines SET status = ? WHERE name = ?", 
			data.status, 
			data.name);
	});
	socket.broadcast.emit('updated_machine', data);
  });
});