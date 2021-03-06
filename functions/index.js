const functions = require('firebase-functions');
const app = require('express')();
const {getAllBonsais, postOneBonsai, uploadImage} = require('./handlers/bonsais');
const {getAllTopics, postOneTopic, getTopic, commentOnTopic} = require('./handlers/topics');
const {signUp, login, addUserDetails, getAuthenticatedUser} = require('./handlers/users');
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

app.get('/forum', getAllTopics);
app.post('/forum/post', FBAuth, postOneTopic);
app.get('/forum/:topicId', getTopic);
app.post('/forum/:topicId/comment', FBAuth, commentOnTopic)

//==================================================================================================================================
//=========================================================USER ROUTES==============================================================
//==================================================================================================================================

app.post('/signup', signUp);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);


exports.api = functions.region('europe-west1').https.onRequest(app);