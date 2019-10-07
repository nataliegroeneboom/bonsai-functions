const {db} = require('../util/admin');



//==================================================================================================================================
//========================================================= RETRIEVE TOPICS=========================================================
//==================================================================================================================================

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

//==================================================================================================================================
//========================================================= ADD A TOPIC ============================================================
//==================================================================================================================================

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

//==================================================================================================================================
//================================================= RETRIEVE COMMENT ON TOPIC ======================================================
//==================================================================================================================================

exports.getTopic = (req, res) => {
    let topicData = {};
    db.doc(`/topics/${req.params.topicId}`)
        .get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({error: 'Topic not found'})
            }
            topicData = doc.data();
            topicData.topicId = doc.id;
            return db
                .collection('comments')
                .orderBy('createdAt', 'desc')
                .where('topicId', '==', req.params.topicId)
                .get();
        })
        .then(data => {
            topicData.comments = [];
            data.forEach( doc => {
                topicData.comments.push(doc.data())
            });
            return res.json(topicData)
        })
        .catch(err =>{
            res.status(500).json({error: err.code});
            console.error(err);
        })
}

//==================================================================================================================================
//================================================= COMMENT ON TOPIC ===============================================================
//==================================================================================================================================


exports.commentOnTopic = (req, res) => {
    if(req.body.body.trim() == '') return res.status(400).json({error: 'Must not be empty'});

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        topicId: req.params.topicId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    }

    db.doc(`/topics/${req.params.topicId}`).get()
        .then(doc => {
            if(!doc.exists) return res.status(404).json({error: 'Topic not found'});
            return db.collection('comments').add(newComment)
        })
        .then(() => {
            return res.json(newComment);
        })
        .catch(err => {
            res.status(500).json({error: 'Something went wrong'});
            console.error(err);
        })
}