const {db} = require('../util/admin');


exports.getAllTopics = (req, res) => {
    db.collection('topics')
        .get()
        .then(data => {
            let topics = [];
            data.forEach(doc => {
                topics.push(doc.data());
            });
            return res.json(topics);
        })
        .catch(err => {
            console.error(err);
            }
        )
}

exports.postOneTopic = (req, res) => {
    const newTopic = {
        subject: req.body.subject,
        category: req.body.category,
        message: req.body.message,
        userHandle: req.user.handle,
        createdAt: new Date()
    }

    db.collection('topics')
        .add(newTopic)
        .then(doc => {
            res.json({message: `document ${doc.id} created successfully`})
        })
        .catch(err => {
            res.status(500).json({error: err.code});
            console.error(err);
        })

}