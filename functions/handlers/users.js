const {db} = require('../util/admin');
const config = require('../util/config');
const {validateSignup, validateLogin} = require('../util/validators');

const firebaseLib = require('firebase');
firebaseLib.initializeApp(config);
 
exports.signUp = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
        admin: false
    }

   const {valid, errors} =  validateSignup(newUser);
   if(!valid) return res.status(400).json(errors)

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
}

exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    const {valid, errors} =  validateLogin(user);
    if(!valid) return res.status(400).json(errors)

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
}