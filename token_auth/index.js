const uuid = require('uuid');
const express = require('express');
const onFinished = require('on-finished');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const fs = require('fs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'jwt-secret-key';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SESSION_KEY = 'authorization';

app.use((req, res, next) => {
    const token = req.headers[SESSION_KEY];
    console.log(token, token?.length);
    if (token?.length) {
        req.session = jwt.verify(token, JWT_SECRET);
        console.log(req.session)
    }

    next();
});

app.get('/', (req, res) => {
    if (req.session?.username) {
        return res.json({
            exp: req.session.exp,
            username: req.session.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/logout', (req, res) => {
    res.redirect('/');
});

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
    },
    {
        login: 'Login1',
        password: 'Password1',
        username: 'Username1',
    }
]

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    const user = users.find((user) => {
        if (user.login == login && user.password == password) {
            return true;
        }
        return false
    });

    if (user) {
        const accessToken = jwt.sign({ userId: user.login, username: user.username }, JWT_SECRET, {expiresIn: '5m'})
        console.log(accessToken)
        res.json({ token: accessToken });
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
