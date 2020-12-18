//. classify.js
var nlcapi = require( './api/nlc' );

var text = "我が家では　最強スクラム　妻・娘";
if( process.argv.length > 2 ){
  text = process.argv[2];
}

setTimeout( async function(){
  var ids = await nlcapi.getClassifierIds();
  //console.log( 'ids', ids );
  var classifier_id1 = ids.classifier_id1;
  var classifier_id2 = ids.classifier_id2;

  if( classifier_id1 && classifier_id2 ){
    [ classifier_id1, classifier_id2 ].forEach( async function( id ){
      var body1 = await nlcapi.getClassifierDetail( id );
      if( body1 && body1.status ){
        if( body1.status == 'Available' ){
          var body2 = await nlcapi.classify( body1.classifier_id, text );
          if( body2 && body2.classes ){
            console.log( JSON.stringify( body2.classes, null, 2 ) );
          }
        }
      }
    });
  }
}, 2000 );
