var config      = require('config'),
    restify     = require('restify'),
    fs          = require('fs'),
    pg          = require('pg')

var pg_config   = config.pg_config,
    table_name  = config.table_name;

var app         = restify.createServer()

app.use(restify.queryParser())
app.use(restify.CORS())
app.use(restify.fullResponse())

// Routes
app.get('/parks/within', function (req, res, next){
  //clean these variables:
  var query = req.query;
  var limit = (typeof(query.limit) !== "undefined") ? query.limit : 40;
  if(!(Number(query.lat1) 
    && Number(query.lon1) 
    && Number(query.lat2) 
    && Number(query.lon2)
    && Number(limit)))
  {
    res.send(500, {http_status:400,error_msg: "this endpoint requires two pair of lat, long coordinates: lat1 lon1 lat2 lon2"});
    return console.error('could not connect to postgres', err);
  }
  pg.connect(pg_config + '/' +table_name, function(err, db, done) {
    if(err) {
      res.send(500, {http_status:500,error_msg: err})
      done();
      return console.error('could not connect to postgres', err);
    }
    db.query('SELECT gid,name,ST_X(the_geom) as lon,ST_Y(the_geom) as lat FROM ' + table_name+ ' t WHERE ST_Intersects( ST_MakeEnvelope('+query.lon1+", "+query.lat1+", "+query.lon2+", "+query.lat2+", 4326), t.the_geom) LIMIT "+limit+';', function(err, result) {
      if(err) {
        res.send(500, {http_status:500,error_msg: err})
        done();
        return console.error('error running query', err);
      }
      console.dir(result);
      res.send(result.rows);
      done();
      return result.rows;
    });
  });
});
app.get('/parks', function (req, res, next){
  pg.connect(pg_config + '/' +table_name, function(err, db, done) {
    if(err) {
      res.send(500, {http_status:500,error_msg: err})
      done();
      return console.error('could not connect to postgres', err);
    }
    db.query('SELECT gid,name,ST_X(the_geom) as lon,ST_Y(the_geom) as lat FROM ' + table_name +';', function(err, result) {
      if(err) {
        res.send(500, {http_status:500,error_msg: err})
        done();
        return console.error('error running query', err);
      }
      console.dir(result);
      res.send(result.rows);
      done();
      return result.rows;
    });
  });
});

app.get('/status', function (req, res, next)
{
  res.send("{status: 'ok'}");
});

app.get('/', function (req, res, next)
{
  var data = fs.readFileSync(__dirname + '/index.html');
  res.status(200);
  res.header('Content-Type', 'text/html');
  res.end(data.toString().replace(/host:port/g, req.header('Host')));
});

app.get(/\/(css|js|img)\/?.*/, restify.serveStatic({directory: './static/'}));

app.listen(config.port, config.ip, function () {
  console.log( "Listening on " + config.ip + ", port " + config.port )
});
