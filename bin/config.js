var multipaas   = require('config-multipaas');
var autoconfig  = function (config_overrides){
  var config    = multipaas(config_overrides).add({
    table_name  : process.env.POSTGRESQL_DATABASE || process.env.TABLE_NAME || process.env.OPENSHIFT_APP_NAME || 'parks',
    collection_name : process.env.MONGODB_DATABASE || process.env.COLLECTION_NAME || process.env.OPENSHIFT_APP_NAME || 'parks',
    db_svc_name : process.env.DATABASE_SERVICE_NAME || "postgresql"
  })

  var db_config = config.get('POSTGRESQL_DB_URL');
      table     = config.get('table_name');

  //normalize db connection string
  if(db_config[db_config.length - 1] !== "/"){
    db_config += '/';
  }
  config.add({db_config: db_config+table});
  return config;
}
exports = module.exports = autoconfig();
