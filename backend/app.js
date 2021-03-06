const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const app = express();
const yup = require('yup');


const { nanoid } = require('nanoid');

require('dotenv').config({ path: '../.env' });

const u = process.env.MONGO_INITDB_ROOT_USERNAME;
const p = process.env.MONGO_INITDB_ROOT_PASSWORD;
const dbn = process.env.MONGO_INITDB_DATABASE;
const dbp = process.env.MONGO_PORT;
const dbh = process.env.MONGO_HOSTNAME || 'localhost'

const mongoUri = `${u}:${p}@${dbh}:${dbp}/${dbn}`
console.log(mongoUri)
const db = require('monk')(mongoUri)
db.then(() => {
    console.log('Connected to db')
})
const urls = db.get('urls');

urls.createIndex({ slug: 1 }, { unique: true })

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json()); // accept only json
app.use(express.static('./public'));

const schema = yup.object().shape({
    slug: yup.string().trim().matches(/^[\w]+$/),
    url: yup.string().trim().url('Invalid url!').required()
});

app.get('/:id', async (req, res) => {
    const { id: slug } = req.params;
    try {
        const url = await urls.find({ slug });
        if (url) {
            res.redirect(url[0].url)
        }
    } catch (error) {
        res.redirect('/')
    }
});

app.post('/url', async (req, res, next) => {
    let { slug, url } = req.body;
    if (!slug) {
        slug = nanoid(5)
    }

    try {
        await schema.validate({
            slug,
            url,
        })

        const existing = await urls.findOne({ slug });
        if (existing) {
            throw new Error('Slug in use.')
        }

        slug = slug.toLowerCase();
        const newUrl = { url, slug }
        const created = await urls.insert(newUrl)
        res.json(created);
    } catch (error) {
        next(error)
    }
});

// if this env var is set the route will be created
// you can get the secret from server logs
// the route returns all current url entrys
if (process.env.ENABLE_FIND_ALL_URI) {
    const secret = nanoid(255)
    console.log(`secret = ${secret}`)

    app.get(`/secret/${secret}`, async (req, res) => {
        res.json(await urls.find())
    })
}


app.use((error, req, res, next) => {
    if (error.status) {
        res.status(error.status);
    } else {
        res.status(500);
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? 'uups' : error.message
    })
})

const port = process.env.NODE_PORT || 7331
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
}) 