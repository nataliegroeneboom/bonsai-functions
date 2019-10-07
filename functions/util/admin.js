const serviceAccount = require("../serviceAccountKey.json");
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://bonsai-7041d.firebaseio.com",
    storageBucket: "bonsai-7041d.appspot.com"
  });

  const db = admin.firestore();

  module.exports = { admin, db};