const express = require('express');
const question = require('./src/question.js');
const auth = require('./src/auth.js');
const bodyParser = require('body-parser');
const validateToken = require('./middleware/validateToken');

const router = express.Router();

router.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

router.use(bodyParser.urlencoded({
    extended: true,
    limit: '300kb'
}));

router.use(bodyParser.json({
    limit: '300kb'
}));

// default
router.get('/', async (req, res) => {
    res.sendStatus(403);
});

// default
router.post('/', async (req, res) => {
    res.sendStatus(403);
});


// tests
router.post('/question', validateToken, async (req, res) => {
    question.addQuestion(req.body)
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.trace(err)
            res.status(400).send(err)
        });
});

router.get('/question', validateToken, async (req, res) => {
    question.getQuestion(req.query)
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.trace(err)
            res.status(400).send(err)
        });
});


router.delete('/question', validateToken, async (req, res) => {
    question.deleteQuestion(req.body)
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.trace(err)
            res.status(400).send(err)
        });
});


router.patch('/question', validateToken, async (req, res) => {
    question.patchQuestion(req.body)
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.trace(err)
            res.status(400).send(err)
        });
});


// tests
router.post('/register', async (req, res) => {
    auth.createUser(req.body)
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.trace(err)
            res.status(400).send(err)
        });
});

router.post('/login', async (req, res) => {
    auth.loginUser(req.body)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(err => {
            console.trace(err)
            res.status(400).send(err)
        });
});

router.post('/refresh', async (req, res) => {
    auth.refreshToken(req.body)
        .then(data => {
            res.status(200).send(data)
        })
        .catch(err => {
            console.trace(err)
            res.status(400).send(err)
        });
});

module.exports = router;