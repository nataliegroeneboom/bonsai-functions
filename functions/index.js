const functions = require('firebase-functions');
const app = require('express')();
const {getAllBonsais, postOneBonsai, uploadImage} = require('./handlers/bonsais');
const {getAllTopics, postOneTopic} = require('./handlers/topics');
const {signUp, login, addUserDetails} = require('./handlers/users');
const FBAuth = require('./util/fbAuth');

//==================================================================================================================================
//=========================================================BONSAI ROUTES============================================================
//==================================================================================================================================
app.get('/bonsais', getAllBonsais)
app.post('/bonsai', FBAuth, postOneBonsai);
 app.post('/bonsai/:bonsaiSlug/image', FBAuth, uploadImage);

//==================================================================================================================================
//=========================================================TOPICS ROUTES============================================================
//==================================================================================================================================

app.get('/forum', getAllTopics)
app.post('/forum/post', FBAuth, postOneTopic)

//==================================================================================================================================
//=========================================================USER ROUTES==============================================================
//==================================================================================================================================

app.post('/signup', signUp);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);


exports.api = functions.region('europe-west1').https.onRequest(app);