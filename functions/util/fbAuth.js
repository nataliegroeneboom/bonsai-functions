const {db, admin} = require('./admin');

module.exports = (req, res, next) => {
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken = req.headers.authorization.split('Bearer ')[1];
     
    }else{
        console.error('No token found');
        return res.status(403).json({error: 'Unauthorised'});   
    }
        admin.auth().verifyIdToken(idToken)
            .then(decodedToken => {
                console.log(decodedToken);
                req.user = decodedToken;
                return db.collection('users')
                    .where('userId', '==', req.user.uid)
                    .limit(1)
                    .get()
            })
            .then(data => {
                req.user.handle = data.docs[0].data().handle; 
                req.user.imageUrl = data.docs[0].data().imageUrl;
                req.user.admin = data.docs[0].data().admin; 
                return next();
            })
            .catch(err => {
                console.error('Error while verifying token');
                return res.status(403).json({error: 'error while verifing token'});
            });
    
    }