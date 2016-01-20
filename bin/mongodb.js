var config      = require('./config.js'),
    mongojs     = require('mongojs'),
    path        = require('path');

var db_config   = config.get('db_config'),
    collection  = config.get('collection_name');

console.log("DB connection: " + db_config);
var db = mongojs(db_config, [collection] );

db.on('error', function (err) {
  console.log('database error', err)
})
 
db.on('connect', function () {
  console.log('database connected')
})

function init_db(persist_db_connection){
  var points = require(path.resolve('./parkcoord.json'));
  db[collection].ensureIndex({'pos':"2d"}, function(err, doc){
    if(err){
      console.log(err);
      return persist_db_connection || db.close();
    }else{
      console.log("index added on 'pos'");
      db[collection].count(function(errr, count){
        if(errr){
          console.log(errr);
          return persist_db_connection || db.close();
        }else if(count > 0){
          console.log("data already exists - bypassing db initialization work...");
          return persist_db_connection || db.close();
        }else{
          console.log("Importing map points...");
          db[collection].insert(points, function(errrr){
            if(errr){
              console.log(errr);
            }else{
              console.log("points imported");
            }
            return persist_db_connection || db.close();
          });
        }
      });
    }
  });
}

function flush_db(persist_db_connection){
  console.log("Dropping the DB...");
  db[collection].drop(function(err){
    if(err){
      console.log(err);
    }
    return persist_db_connection || db.close();
  });
} 

function select_box(req, res, next){
  //clean these variables:
  var query = req.query;
  var lat1 = Number(query.lat1),
      lon1 = Number(query.lon1),
      lat2 = Number(query.lat2),
      lon2 = Number(query.lon2);
  var limit = (typeof(query.limit) !== "undefined") ? query.limit : 40;
  if(!(Number(query.lat1) 
    && Number(query.lon1) 
    && Number(query.lat2) 
    && Number(query.lon2)
    && Number(limit)))
  {
    res.send(500, {http_status:400,error_msg: "this endpoint requires two pair of lat, long coordinates: lat1 lon1 lat2 lon2\na query 'limit' parameter can be optionally specified as well."});
    return console.error('could not connect to the database', err);
  }
  db[collection].find( {"pos" : {'$geoWithin': { '$box': [[lon1,lat1],[lon2,lat2]]}}}).limit(limit).toArray(function(err,rows){
    if(err) {
      res.send(500, {http_status:500,error_msg: err})
      return console.error('error running query', err);
    }
    res.send(rows);
    return rows;
  });
};
function select_all(req, res, next){
  console.log(db);
  db[collection].find(function(err, rows){
    if(err) {
      res.send(500, {http_status:500,error_msg: err})
      return console.error('error running query', err);
    }
    res.send(rows);
    return rows;
  });
};

module.exports = exports = {
  selectAll: select_all,
  selectBox: select_box,
  flushDB:   flush_db,
  initDB:    init_db
};
