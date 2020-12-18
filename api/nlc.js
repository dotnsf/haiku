//. nlc.js
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    os = require( 'os' );
var router = express.Router();

var settings = require( '../settings' );

var nlcv1 = require( 'ibm-watson/natural-language-classifier/v1' );
var { IamAuthenticator } = require( 'ibm-watson/auth' );

router.use( bodyParser.urlencoded( { extended: true } ) );
router.use( bodyParser.json() );

var nlc = null;
var classifier_id1 = null;
var classifier_id2 = null;
if( settings.nlc_apikey ){
  var url = ( settings.nlc_url ? settings.nlc_url : 'https://gateway.watsonplatform.net/natural-language-classifier/api/' );
  nlc = new nlcv1({
    authenticator: new IamAuthenticator( { apikey: settings.nlc_apikey } ),
    version: '2018-03-19',
    url: url
  });

  //var body0 = await nlc.listClassifiers();
  nlc.listClassifiers().then( async function( body0 ){
  if( body0 && body0.result && body0.result.classifiers && body0.result.classifiers.length ){
    //console.log( body1.result );
    body0.result.classifiers.forEach( async function( classifier ){
      if( classifier.name == ( settings.nlc_name + '_by_writer' ) ){
        var body1 = await nlc.getClassifier( { classifierId: classifier.classifier_id } );
        if( body1 && body1.result && body1.result.status == 'Available' ){
          classifier_id1 = classifier.classifier_id;
        }
      }else if( classifier.name == ( settings.nlc_name + '_by_season' ) ){
        var body2 = await nlc.getClassifier( { classifierId: classifier.classifier_id } );
        if( body2 && body2.result && body2.result.status == 'Available' ){
          classifier_id2 = classifier.classifier_id;
        }
      }
    });
  }
  });

  router.getClassifierIds = async function(){
    return new Promise( async function( resolve, reject ){
      resolve( { classifier_id1: classifier_id1, classifier_id2: classifier_id2 } );
    });
  };

  router.getClassifierDetail = async function( classifier_id ){
    return new Promise( async function( resolve, reject ){
      var params1 = { classifierId: classifier_id };
      var body1 = await nlc.getClassifier( params1 );

      resolve( body1.result );
    });
  };

  router.createClassifiers = async function( classifier_id1, classifier_id2, haikus_by_writer, haikus_by_season ){
    var training_lang = ( settings.nlc_language ? settings.nlc_language : 'en' );
    var training_data1 = '';
    var training_data2 = '';
    var training_metadata1 = '{"language":"' + training_lang + '","name":"' + settings.nlc_name + '_by_writer"}';
    var training_metadata2 = '{"language":"' + training_lang + '","name":"' + settings.nlc_name + '_by_season"}';

    if( haikus_by_writer ){
      Object.keys( haikus_by_writer ).forEach( function( writer ){
        haikus_by_writer[writer].forEach( function( text ){
          var line1 = text + "," + writer + os.EOL;
          training_data1 += line1;
        });
      });
    }

    if( haikus_by_season ){
      Object.keys( haikus_by_season ).forEach( function( season ){
        haikus_by_season[season].forEach( function( text ){
          var line2 = text + "," + season + os.EOL;
          training_data2 += line2;
        });
      });
    }

    if( classifier_id1 ){
      nlc.deleteClassifier( { classifier_id: classifier_id1 }, ( err2, body1 ) => {
        if( err2 ){
          console.log( err2 );
        }else{
          var params3 = {
            trainingMetadata: new Buffer( training_metadata1, 'UTF-8' ),
            trainingData: new Buffer( training_data1, 'UTF-8' )
          };
          nlc.createClassifier( params3, ( err3, body3 ) => {
            if( err3 ){
              console.log( err3 );
            }else{
              console.log( body3 );
            }
          });
        }
      });
    }else{
      var params3 = {
        trainingMetadata: new Buffer( training_metadata1, 'UTF-8' ),
        trainingData: new Buffer( training_data1, 'UTF-8' )
      };
      nlc.createClassifier( params3, ( err3, body3 ) => {
        if( err3 ){
          console.log( err3 );
        }else{
          console.log( body3 );
        }
      });
    }
    if( classifier_id2 ){
      nlc.deleteClassifier( { classifier_id: classifier_id2 }, ( err2, body1 ) => {
        if( err2 ){
          console.log( err2 );
        }else{
          var params3 = {
            trainingMetadata: new Buffer( training_metadata2, 'UTF-8' ),
            trainingData: new Buffer( training_data2, 'UTF-8' )
          };
          nlc.createClassifier( params3, ( err3, body3 ) => {
            if( err3 ){
              console.log( err3 );
            }else{
              console.log( body3 );
            }
          });
        }
      });
    }else{
      var params3 = {
        trainingMetadata: new Buffer( training_metadata2, 'UTF-8' ),
        trainingData: new Buffer( training_data2, 'UTF-8' )
      };
      nlc.createClassifier( params3, ( err3, body3 ) => {
        if( err3 ){
          console.log( err3 );
        }else{
          console.log( body3 );
        }
      });
    }
  };

  router.classify = async function( classifier_id, text ){
    return new Promise( async function( resolve, reject ){
      var params1 = { classifierId: classifier_id, text: text };
      var body1 = await nlc.classify( params1 );

      resolve( body1.result );
    });
  };

  router.deleteClassifier = async function( classifier_id ){
    return new Promise( async function( resolve, reject ){
      var params1 = { classifierId: classifier_id };
      var body1 = await nlc.deleteClassifier( params1 );

      resolve( body1.result );
    });
  };

  
  router.get( '/status', async function( req, res ){
    res.contentType( 'application/json; charset=utf-8' );

    if( classifier_id1 && classifier_id2 ){
      res.write( JSON.stringify( { status: true } ) );
      res.end();
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false } ) );
      res.end();
    }
  });

  router.post( '/classify', async function( req, res ){
    res.contentType( 'application/json; charset=utf-8' );

    var text = req.body.text;
    if( text ){
      if( classifier_id1 && classifier_id2 ){
        var result1 = await nlc.classify( { classifierId: classifier_id1, text: text } );
        var result2 = await nlc.classify( { classifierId: classifier_id2, text: text } );
        if( result1 && result1.result && result1.result.classes && result2 && result2.result && result2.result.classes ){
          res.write( JSON.stringify( { status: true, classes1: result1.result.classes, classes2: result2.result.classes } ) );
          res.end();
        }else{
          res.status( 400 );
          res.write( JSON.stringify( { status: false, error: { result1: result1, result2: result2 } } ) );
          res.end();
        }
      }else{
        res.status( 400 );
        res.write( JSON.stringify( { status: false, error: { classifier_id1: classifier_id1, classifier_id2: classifier_id2 } } ) );
        res.end();
      }
    }else{
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: 'parameter text is mandatory.' } ) );
      res.end();
    }
  });
}

module.exports = router;

