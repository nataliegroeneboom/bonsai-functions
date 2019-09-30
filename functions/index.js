const functions = require('firebase-functions');
const admin = require('firebase-admin');

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bonsai-7041d.firebaseio.com"
});

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

exports.getBonsais = functions.https.onRequest((req, res) => {
 admin.firestore().collection('bonsais').get()
    .then(data => {
        let bonsais = [];
        data.forEach(doc => {
            bonsais.push(doc.data())
        });
        return res.json(bonsais);
    })
    .catch(err => console.error(err));
});

exports.createBonsai = functions.https.onRequest((req, res) => {
    const newBonsai = {
        body: req.body.body,
        family: req.body.family,
        name: req.body.name
    };
    admin.firestore()
        .collection('bonsais')
        .add(newBonsai)
        .then(doc => {
            res.json({message: `document ${doc.id} created successfully`})
        })
        .catch(err => {
            console.error(err); 
            res.status(500).json({error: 'something when wrong'})
        })
   });
   
