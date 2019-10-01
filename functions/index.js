const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

const serviceAccount = require("./serviceAccountKey.json");



const firebaseConfig = {
    apiKey: "AIzaSyBrs2uuJWyn3jC3ROb3gVh9pHeds3OCLJU",
    authDomain: "bonsai-7041d.firebaseapp.com",
    databaseURL: "https://bonsai-7041d.firebaseio.com",
    projectId: "bonsai-7041d",
    storageBucket: "bonsai-7041d.appspot.com",
    messagingSenderId: "13325179480",
    appId: "1:13325179480:web:197746bd90938831ff882d",
    measurementId: "G-8P23B54DLT"
  };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bonsai-7041d.firebaseio.com"
});

const firebaseLib = require('firebase');
firebaseLib.initializeApp(firebaseConfig);

const db = admin.firestore();


//==================================================================================================================================
//=========================================================HELPER METHODS===========================================================
//==================================================================================================================================
const isEmpty = (string) => {
if(string.trim() === '') return true;
else return false;
}

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)) return true;
    else return false;
}

//==================================================================================================================================
//=========================================================GET BONSAIS==============================================================
//==================================================================================================================================
app.get('/bonsais', (req, res) => {
    db
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
//==================================================================================================================================
//=========================================================POST BONSAI==============================================================
//==================================================================================================================================
app.post('/bonsai', (req, res) => {
    const newBonsai = {
        body: req.body.body,
        family: req.body.family,
        name: req.body.name
    };
    db
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

//==================================================================================================================================
//=========================================================SIGN UP==================================================================
//==================================================================================================================================

app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
        admin: false
    }

    let errors = {};

    if(isEmpty(newUser.email)){
        errors.email = 'Must not be empty';
    }else if(!isEmail(newUser.email)){
        errors.email = 'Must be a valid email address'
    }

    if(isEmpty(newUser.password)) errors.password = 'Must not be empty';
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match';
    if(isEmpty(newUser.handle)) errors.handle = 'Must not be empty';

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    let token, userId; 
    db.doc(`/users/${newUser.handle}`)
        .get()
        .then(doc => {
             if(doc.exists){
                 return res.status(400).json({handle: 'this username is already taken'});
             }else{
                return firebaseLib.auth()
                .createUserWithEmailAndPassword(newUser.email, newUser.password)
             }
        })
        .then(data => {
            // we have our user created, we can get the token
            userId = data.user.uid;
           return data.user.getIdToken()

        })
        .then(tokenId => {
            token = tokenId;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                admin: newUser.admin,
                userId
            };
           return db.doc(`/users/${newUser.handle}`).set(userCredentials)
           
           
        })
        .then(() => {
            return res.status(201).json({token}); 
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/email-already-in-use'){
                return res.status(400).json({email: 'Email already in use'})    
            }
            else if(err.code === 'auth/invalid-email'){
                return res.status(400).json({email: 'Email address invalid'})    
            }
            else{
                return res.status(500).json({error: err.code})
            }
              
        });

});

   
//==================================================================================================================================
//=========================================================LOG IN===================================================================
//==================================================================================================================================

app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    let errors = {};

    if(isEmpty(user.email)) errors.email = 'Must not be empty';
    if(isEmpty(user.password)) errors.password = 'Must not be empty';
    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebaseLib.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken()
        })
        .then(token => {
            return res.json({token});
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'){
                return res.status(403).json({general : 'Unknown login credentials'})    
            }else return res.status(500).json({error: err.code});
            
            
        })
})

exports.api = functions.region('europe-west1').https.onRequest(app);