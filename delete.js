//. delete.js
var nlcapi = require( './api/nlc' );

setTimeout( async function(){
  var ids = await nlcapi.getClassifierIds();
  //console.log( 'ids', ids );
  var classifier_id1 = ids.classifier_id1;
  var classifier_id2 = ids.classifier_id2;

  if( classifier_id1 ){
    var body1 = await nlcapi.deleteClassifier( classifier_id1 );
    console.log( JSON.stringify( body1.classes, null, 2 ) );
  }
  if( classifier_id2 ){
    var body2 = await nlcapi.deleteClassifier( classifier_id2 );
    console.log( JSON.stringify( body2.classes, null, 2 ) );
  }
}, 2000 );
