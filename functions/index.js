const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

var serviceAccount = require("./serviceAccountKey.json");

const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bonsai-7041d.firebaseio.com"
});


app.get('/bonsais', (req, res) => {
    admin.firestore()
    .collection('bonsais')
    .orderBy('name')
    .get()
    .then(data => {
        let bonsais = [];
        data.forEach(doc => {
            bonsais.push({
                bonsaiId: doc.id,
                body: doc.data().body,
                name: doc.data().name,
                family: doc.data().family
            })
        });
        return res.json(bonsais);
    })
    .catch(err => console.error(err));
})

app.post('/bonsai', (req, res) => {
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
   
exports.api = functions.region('europe-west1').https.onRequest(app);