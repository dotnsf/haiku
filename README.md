# haiku

## Overview

**Still under development.**


## How to setup

- Install Node.js and npm

- Git clone or Download this source code.

- Login to **IBM Cloud**, and create Watson NLC service.

- Find your created NLC credential information.

- Edit **settings.js** file with your Watson NLC credential information:

  - API Key as nlc_apikey

  - API URL as nlc_url

  - You don't need to edit nlc_name and nlc_language.

- Install dependencies

  - `$ npm install`


## How to use CLI files

### generate.js

- Generate IBM Watson NLC corpus.
- Run generate.js

  - `$ node generate.js`

### classsdify.js

- Test your corpus.

- Run classify.js

  - `$ node classify.js [俳句のテキスト]`

### delete.js

- Delete your corpus.

- Run delete.js

  - `$ node delete.js`


## How to run web application

- Run app.js

  - `$ node app.js`


## Reference

http://www.haikudiary.jp/haijin/

## Copyright

2020 [K.Kimura @ Juge.Me](https://github.com/dotnsf) all rights reserved.
