var express = require('express');
var exam = require('./src/exam.js');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const router = express.Router();
router.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
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
router.post('/question', async (req, res) => {
    exam.addQuestion(req.body)
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.log(err)
            res.status(400).send(err)
        });
});

router.get('/question', async (req, res) => {
    exam.getQuestion(req.query)
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.log(err)
            res.status(400).send(err)
        });
});


router.delete('/question', async (req, res) => {
    exam.deleteQuestion(req.body)
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.log(err)
            res.status(400).send(err)
        });
});


router.patch('/question', async (req, res) => {
    exam.patchQuestion(req.body)
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.log(err)
            res.status(400).send(err)
        });
});

function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

module.exports = router;