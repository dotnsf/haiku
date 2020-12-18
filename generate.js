//. generate.js
var nlcapi = require( './api/nlc' );
var client = require( 'cheerio-httpcli' );

var settings = require( './settings' );

setTimeout( async function(){
  var ids = await nlcapi.getClassifierIds();
  var classifier_id1 = ids.classifier_id1;
  var classifier_id2 = ids.classifier_id2;

  var obj = await getLinksByWriter();
  var haikus_by_season = { '春': [], '夏': [], '秋': [], '冬': [], '新年': [] };
  var haikus_by_writer = {};
  if( obj.linknames && obj.linknames.length ){
    var j = 0;
    for( var i = 0; i < obj.linknames.length; i ++ ){
      var linkname = obj.linknames[i];
      var linkurl = obj.linkurls[i];
      var haikus = await getHaikusByURL( linkurl, linkname );
        //console.log( JSON.stringify( haikus, null, 2 ) );
        /*
        {
          name: "芥川龍之介",
          haikus: [
            {
              season: "春",
              list: [
                "竹の芽も 茜さしたる 彼岸かな"
              ]
            },
            {
              season: "夏",
              list: [
                 "青簾(すだれ) 裏畠の花を 幽(かすか)にす",
                 "蝶の舌 ゼンマイに似る 暑さかな",
                 "さみだれや 青柴積める 軒の下",
                 "青蛙 おのれもペンキ ぬりたてか"
              ]
            },
               :
               :
            {
              season: "新年",
              list: [
                "元日や 手を洗ひたる 夕ごころ"
              ]
            }
          ]
        }
        */

      var writer = haikus.name;
      haikus_by_writer[writer] = [];
      haikus.haikus.forEach( function( o ){
        o.list.forEach( function( text ){
          //. by_writer
          haikus_by_writer[writer].push( text );

          //. by_season
          haikus_by_season[o.season].push( text );
        });
      });

      j ++;
      if( j == obj.linknames.length ){
        //console.log( JSON.stringify( haikus_by_writer, null, 2 ) );
        //console.log( JSON.stringify( haikus_by_season, null, 2 ) );
        await nlcapi.createClassifiers( classifier_id1, classifier_id2, haikus_by_writer, haikus_by_season );
        console.log( 'Processing createClassifiers() ...' );
      }
    }
  }
}, 2000 );

//. 要 Promise 対応
async function getLinksByWriter(){
  return new Promise( async function( resolve, reject ){
    var url = 'http://www.haikudiary.jp/haijin/';

    var linknames = [];
    var linkurls = [];
    client.fetch( url, {}, 'UTF-8', function( err, $, res, body ){
      $('body div.menubox ul li a').each( function(){
        var linkname = $(this).text();  //. ○○○の俳句
        var linkurl = $(this).attr( 'href' );

        linkname = linkname.substr( 0, linkname.length - 3 );

        linknames.push( linkname );
        linkurls.push( url + linkurl );
      });
      resolve( { linknames: linknames, linkurls: linkurls } );
    });
  });
}

async function getHaikusByURL( url, name ){
  return new Promise( async function( resolve, reject ){
    client.fetch( url, {}, 'UTF-8', function( err, $, res, body ){
      var haikus = [];
      for( var idx = 0; idx < 5; idx ++ ){
        haikus.push( { season: '', list: [] } );

        var i = 0;
        $('body div.menubox').each( function(){
          if( i == idx ){
            $(this).children('ul').children('li').each( function(){
              var text = $(this).text();
              var classname = $(this).attr( 'class' );
              if( classname == 'navi' ){
                text = text.substr( 0, text.length - 3 );
                haikus[idx].season = text;
              }else{
                haikus[idx].list.push( text );
              }
            });

            if( idx == 4 ){
              resolve( { name: name, haikus: haikus } );
            }
          }
          i ++;
        });
      }
    });
  });
}

