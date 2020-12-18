//. app.js
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    ejs = require( 'ejs' ),
    fs = require( 'fs' ),
    app = express();
var settings = require( './settings' );

var nlcapi = require( './api/nlc' );
app.use( '/api', nlcapi );

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );

app.get( '/', function( req, res ){
  res.render( 'index', {} );
});


var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server stating on " + port + " ..." );
