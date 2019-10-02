const functions = require('firebase-functions');
const app = require('express')();
const {getAllBonsais, postOneBonsai} = require('./handlers/bonsais');
const {signUp, login, uploadImage} = require('./handlers/users');
const FBAuth = require('./util/fbAuth');

//==================================================================================================================================
//=========================================================BONSAI ROUTES============================================================
//==================================================================================================================================
app.get('/bonsais', getAllBonsais)
app.post('/bonsai', FBAuth, postOneBonsai);
 app.post('/bonsai/:bonsaiSlug/image', FBAuth, uploadImage);

//==================================================================================================================================
//=========================================================USER ROUTES==============================================================
//==================================================================================================================================

app.post('/signup', signUp);
app.post('/login', login)

exports.api = functions.region('europe-west1').https.onRequest(app);