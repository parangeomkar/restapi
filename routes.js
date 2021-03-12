const express = require('express');
const question = require('./src/question.js');
const auth = require('./src/auth.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const router = express.Router();
const gcsDecrypt = require('./helpers/gcs-decrypt');
const validateToken = require('./middleware/validateToken');

try {
    gcsDecrypt();
} catch (error) {
    console.trace(error);
}

router.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

router.use(bodyParser.urlencoded({
    extended: true,
    limit: '300kb'
}));

router.use(bodyParser.json({
    limit: '300kb'
}));

router.use(cookieParser());

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
    await question.addQuestion(req.body)
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.trace(err)
            res.status(400).send(err)
        });
});

router.get('/question', validateToken, async (req, res) => {
    await question.getQuestion(req.query)
        .then(data => res.status(200).send(data)
        )
        .catch(err => {
            console.trace(err)
            res.status(400).send(err)
        });
});


router.delete('/question', validateToken, async (req, res) => {
    await question.deleteQuestion(req.body)
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.trace(err)
            res.status(400).send(err)
        });
});


router.patch('/question', validateToken, async (req, res) => {
    await question.patchQuestion(req.body)
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.trace(err)
            res.status(400).send(err)
        });
});


// tests
router.post('/register', async (req, res) => {
    await auth.createUser(req.body)
        .then(data => res.status(200).send(data))
        .catch(err => {
            console.trace(err)
            res.status(400).send(err)
        });
});

router.post('/login', async (req, res) => {
    await auth.loginUser(req.body)
        .then(data => {
            const { accessToken, refreshToken } = data;
            delete data.accessToken;
            delete data.refreshToken;

            res.status(200)
            res.cookie('accessToken', accessToken, {
                maxAge: 54_000_000,
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            })
            res.cookie('refreshToken', refreshToken, {
                maxAge: 2_592_000_000,
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            })
            res.send(data);
        })
        .catch(err => {
            console.trace(err)
            res.status(400).send(err)
        });
});

router.post('/refresh', async (req, res) => {
    console.log(req.cookies)
    await auth.refreshToken(req.cookies)
        .then(data => {
            const { accessToken, refreshToken } = data;
            delete data.accessToken;
            delete data.refreshToken;

            res.status(200)
            res.cookie('accessToken', accessToken, {
                maxAge: 54_000_000,
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            })
            res.send(data)
        })
        .catch(err => {
            console.trace(err)
            res.status(400).send(err)
        });
});


router.get('/auth', validateToken, (req, res) => {
    res.send({ authSuccess: true });
});

module.exports = router;