var config      = require('config'),
    restify     = require('restify'),
    fs          = require('fs'),
    postgresql  = require('pg')

var pg_config   = config.pg_config,
    table_name  = config.table_name;

var app         = restify.createServer()
var pg          = new postgresql.Client( pg_config + '/' +table_name );

app.use(restify.queryParser())
app.use(restify.CORS())
app.use(restify.fullResponse())

// Routes
app.get('/parks/within', function (req, res, next){
  //points = [{"lat": 42.359999999999999, "gid": 54, "lon": -71.064539999999994, "name": "Boston African American National Historic Site"}, {"lat": 42.31861, "gid": 55, "lon": -70.945650000000001, "name": "Boston Harbor Islands National Recreation Area"}, {"lat": 42.359999999999999, "gid": 56, "lon": -71.056169999999995, "name": "Boston National Historical Park"}, {"lat": 42.325000000000003, "gid": 181, "lon": -71.132050000000007, "name": "Frederick Law Olmsted National Historic Site"}, {"lat": 42.345829999999999, "gid": 281, "lon": -71.124279999999999, "name": "John Fitzgerald Kennedy National Historic Site"}, {"lat": 42.376669999999997, "gid": 323, "lon": -71.126230000000007, "name": "Longfellow National Historic Site"}];
  //res.send(points);
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
  pg.connect(function(err) {
    if(err) {
      res.send(500, {http_status:500,error_msg: err})
      return console.error('could not connect to postgres', err);
    }
    pg.query('SELECT gid,name,ST_X(the_geom) as lon,ST_Y(the_geom) as lat FROM ' + table_name+ ' WHERE ST_Intersects( ST_MakeEnvelope('+query.lon1+", "+query.lat1+", "+query.lon2+", "+query.lat2+", 4326), t.the_geom) LIMIT "+limit+';', function(err, result) {
      if(err) {
        res.send(500, {http_status:500,error_msg: err})
        return console.error('error running query', err);
      }
      //console.log(result.rows[0].theTime);
      console.dir(result);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      res.send(result);
      pg.end();
    });
  });
});
app.get('/parks', function (req, res, next){
  pg.connect(function(err) {
    if(err) {
      res.send(500, {http_status:500,error_msg: err})
      return console.error('could not connect to postgres', err);
    }
    pg.query('SELECT gid,name,ST_X(the_geom) as lon,ST_Y(the_geom) as lat FROM ' + table_name, function(err, result) {
      if(err) {
        res.send(500, {http_status:500,error_msg: err})
        return console.error('error running query', err);
      }
      //console.log(result.rows[0].theTime);
      console.dir(result);
      //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
      res.send(result);
      pg.end();
    });
  });
  //res.send("{search:'all'}");
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
