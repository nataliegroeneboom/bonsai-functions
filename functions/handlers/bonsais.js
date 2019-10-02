const { db, admin } = require('../util/admin');

exports.getAllBonsais = (req, res) => {
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
}

exports.postOneBonsai = (req, res) => {
    const newBonsai = {
        body: req.body.body,
        family: req.body.family,
        name: req.body.name,
        slug: slugify(req.body.name)
        
    };
   
    db.doc(`/bonsais/${newBonsai.slug}`)
        .get()
        .then(doc => {
             if(doc.exists){
                 return res.status(400).json({name: 'this tree has is already been added'});
             }else{
                 newBonsai.bonsaiId + doc.id;
                return db.doc(`/bonsais/${newBonsai.slug}`).set(newBonsai)
             }
        })
        .then(()=>{
            res.json({message: `document ${newBonsai.bonsaiId} created successfully`})
        })
  
        .catch(err => {
            console.error(err); 
            res.status(500).json({error: 'something when wrong'})
        })
   }

   exports.uploadImage = (req, res) => {
    const Busboy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');
    let imageFileName;
    let imageUpload = {};

    const busboy = new Busboy({headers: req.headers});
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        const imageExt = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(Math.random()*100000000)}.${imageExt}`;
        const filepath = path.join(os.tmpdir(),imageFileName);
        imageUpload = {filepath, mimetype};
        file.pipe(fs.createWriteStream(filepath));

    });
    busboy.on('finish', () => {
        admin.storage().bucket().upload(imageUpload.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageUpload.mimetype
                }
            }
        })
        .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
       
        })
    })
   }

  const slugify = (string) => {
    return string
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') 
  }