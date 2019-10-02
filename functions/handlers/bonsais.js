const { db } = require('../util/admin');

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
        name: req.body.name
    };
    console.log(req);
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
   }