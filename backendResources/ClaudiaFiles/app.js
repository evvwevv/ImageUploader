var ApiBuilder = require('claudia-api-builder');
var pgp = require('pg-promise')();
//var pg = require('pg');

api = new ApiBuilder();
module.exports = api;
  
//info could be stored more securely
var dbConnect = {

            host: 'rds-postgresql-imageuploader.czk4rdagmdid.us-west-1.rds.amazonaws.com',

            user: 'imageuploader_admin',

            password: 'ux_billbiz', //change this before repository is made public!

            database: 'imageuploader_webapp_db',
			
			port: 5430

};

var connection = pgp(dbConnect);
  
api.get('/getAllUsers', function(event, request) {

	//assuming there already exists a table called User_Account
	var sql = 'SELECT * FROM User_Account';
	
	return connection.any(sql).then(function (data) {

      pgp.end();

      console.log('Lambda :: params :: ' + JSON.stringtify(data));

      var resp = {
         name: data[0].name,
         linkToBucketOfImages: data[0].linkToBucketOfImages
      };

     return resp;
	})
   .catch(function (error) {
      console.log("Lambda :: Error: " + error);
      pgp.end();
	});
		
});
  
api.get('/getUser', function(event, request) {
	
	var sql = "SELECT * FROM User_Account WHERE name = " + event.name;

    return connection.any(sql).then(function (data) {

      pgp.end();

      console.log('Lambda :: params :: ' + JSON.stringtify(data));

      var resp = {
         name: data[0].name,
         linkToBucketOfImages: data[0].linkToBucketOfImages
      };

     return resp;
	})
   .catch(function (error) {
      console.log("Lambda :: Error: " + error);
      pgp.end();
	});
});

api.put('/updateUser', function(event, request) {
	
	sql = "UPDATE User_Account SET ";

	sql = sql + "linkToBucketOfImages = '" + event.linkToBucketOfImages + "'";

	sql = sql + " WHERE name = " + event.name;

	return connection.any(sql).then(function (data) {

      pgp.end();

      console.log('Lambda :: params :: ' + JSON.stringtify(data));

      var resp = {
         name: data[0].name,
         linkToBucketOfImages: data[0].linkToBucketOfImages
      };

     return resp;
	})
   .catch(function (error) {
      console.log("Lambda :: Error: " + error);
      pgp.end();
	});
	
});


api.get('/hello', function () {
  return 'WilsonL';
});
