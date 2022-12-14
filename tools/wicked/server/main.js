const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const engine = require('./engine');

const DIST = path.join(__dirname, '../../../dist/linkedom-angular/browser/');
const index = fs.readFileSync(DIST + '/index.html', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
});

const app = express();

app.get(/.*\.(?!.*html)|.*(index\.html)$/, express.static(DIST, {
    maxAge: '1y',
    fallthrough: false,
}));

app.get('*', (req, res, next) => {
    new Promise((resolve, reject) => resolve(new engine.Engine().render(index)))
        .then(html => res.send(html))
        .catch(err => next(err))
});

module.exports = app;