var pg            = require('pg');
var dbConnection  = 'postgres://localhost:5432/north_nile';

if (process.env.DATABASE_URL){
  pg.defaults.ssl = true;
  console.log('environment var');
  dbConnection = process.env.DATABASE_URL;
}

function createResource(callback) {
  pg.connect(dbConnection, function(err, client, done) {
    if(err) {
      console.log('Error connecting to DB.' + err);
      process.exit(1);
    } else {
      var query = client.query('CREATE TABLE IF NOT EXISTS "resource" (' +
        ' "id" serial PRIMARY KEY,' +
        ' "name" varchar(150) NOT NULL,' +
        ' "description" text,' +
        ' "resource_type" varchar(50) NOT NULL,' +
        ' "website" varchar(150),' +
        ' "twitter" varchar(150),' +
        ' "facebook" varchar(150),' +
        ' "instagram" varchar(150),' +
        ' "snapchat" varchar(150),' +
        ' "address_line1" varchar(150) NOT NULL,' +
        ' "address_line2" varchar(150),' +
        ' "address_line3" varchar(150),' +
        ' "city_name" varchar(100) NOT NULL,' +
        ' "state" char(2) NOT NULL,' +
        ' "zip_code" varchar(16) NOT NULL,' +
        ' "leadership" varchar(150),' +
        ' "public_phone" varchar(50),' +
        ' "public_email" varchar(150),' +
        ' "hours" text,' +
        ' "latitude" numeric,' +
        ' "longitude" numeric,' +
        ' "is_active" boolean,' +
        ' "is_pending" boolean,' +
        ' "date_created" timestamp,' +
        ' "account_id" int REFERENCES "account"(id),' +
        ' "audio_id" int REFERENCES "audio"(id),' +
        ' "image_id" int REFERENCES "image"(id),' +
        ' "video" varchar(150))');

      query.on('end', function() {
        console.log('Successfully created Resource schema.');
        done();
        callback(null);
      });

      query.on('error', function(err) {
        console.log('Error creating Resource schema.' + err);
        callback(err);
        process.exit(1);
      });
    }
  });
}

module.exports.createResource = createResource;
