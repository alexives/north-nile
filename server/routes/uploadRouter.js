var router = require('express').Router();
var multer = require('multer');
var pg = require('pg');
var dbConnectionString = require('../db/dbConnection.js').dbConnectionString;

var storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './server/public/assets/img/uploads');
  },
  filename: function(req, file, cb){
    console.log('upload file:', file);
    var fileName = file.originalname.split('.')[0];
    var datetimestamp = Date.now();
    cb(null, fileName + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
  }
});

var upload = multer({
  storage: storage
}).array('file');

router.post('/audio', function(request, response){
  upload(request, response, function(err){
    if(err){
      response.json({error_code:1, err_desc:err});
      return;
    }
    // console.log('uploading audio request:', request);
    pg.connect(dbConnectionString, function(err, client, done){
      if(err){
        console.log('Error connecting to database to save audio path:', err);
        response.sendStatus(500);
      } else {
        var audio_id;
        var filePath = request.files[0].path.substring(14);

        var queryString = 'INSERT INTO audio (audio_reference) VALUES ($1) RETURNING id';

        var query = client.query(queryString, [filePath], function(err, result){
          if (err){
            console.log('Error returning audio id:', err);
          } else {
            audio_id = result.rows[0].id;
          }
        });

        query.on('error', function(err){
          console.log('Error saving audio paths:', err);
          client.end();
        });

        query.on('end', function(){
          console.log('Saved audio path successfully.');
          response.send({audio_id: audio_id});
        });
      }
    });
  });
});

router.post('/image', function(request, response){
  var filePaths = [];
  upload(request, response, function(err){
    // console.log('upload files:', request);
    if(err){
      response.json({error_code:1, err_desc:err});
      return;
    }
    //response.json({error_code:0, err_desc:null});

    // insert file paths to database, insert image key to resource row
    request.files.map(function(file){
      var filePath = file.path.substring(14); // remove server/public/ from the file path
      filePaths.push(filePath); // add file paths to array
    });

    pg.connect(dbConnectionString, function(err, client, done){
      if (err){
        console.log('Error connecting to database to save image paths.', err);
        response.sendStatus(500);
      } else {
        var image_id;

        // var queryString = 'INSERT INTO "image" (path1, path2, path3, path4, path5) VALUES ($1, $2, $3, $4, $5) RETURNING id;';

        // build query string based on number of inputs
        var queryBase = 'INSERT INTO "image" (path1';
        var queryEnd = ') VALUES ($1';
        for(var i = 2; i < filePaths.length+1; i++){
          queryBase += ', path' + i;
          queryEnd += ', $' + i;
        }
        queryEnd += ') RETURNING id;';
        queryString = queryBase + queryEnd;
        // console.log('queryString:', queryString);

        var query = client.query(queryString, filePaths, function(err, result){
          if(err){
            console.log('Error returning image id:', err);
          } else {
            // console.log('Image return result:', result);
            image_id = result.rows[0].id;
          }
        });

        query.on('error', function(err){
          console.log('Error saving image paths:', err);
          client.end();
        });

        query.on('end', function(){
          console.log('Saved image paths.');
          done();
          response.send({image_id:image_id});
        });
      }
    });
  });
});

module.exports = router;
