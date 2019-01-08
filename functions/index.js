'use strict'
/** EXPORT ALL FUNCTIONS
 *
 *   Loads all `.f.js` files
 *   Exports a cloud function matching the file name
 *
 *   Based on this thread:
 *     https://github.com/firebase/functions-samples/issues/170
 */
const glob = require('glob')
const camelCase = require('camelcase')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const settings = { timestampsInSnapshots: true }
const config = functions.config().firebase
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')({ origin: true, allowedHeaders: ['Content-Type'] })
const app = express()
var jsonParser = bodyParser.json()

admin.initializeApp(config)
admin.firestore().settings(settings)
app.use(cors)
app.use(bodyParser.json())

app.get('/api/v1/jokes', async (req, res) => {
  console.log('version 15')

  const key = req.query.key

  if (key !== 'babo') {
    res.status(403).send({
      error: {
        code: 1,
        message: 'Wrong key! Do you know who the babo is?'
      }
    })
  }

  const jokes = await admin
    .database()
    .ref('/jokes')
    .once('value')

  res.send({ jokes })
})

app.delete('/api/v1/jokes', async (req, res) => {
  const key = req.query.key
  const uid = req.query.uid

  if (key !== 'babo') {
    res.status(403).send({
      error: {
        code: 1,
        message: 'Wrong key! Do you know who the babo is?'
      }
    })
    return null
  }

  if (!uid) {
    res.status(403).send({
      error: {
        code: 5,
        message: 'No joke uid provided! You know what you are doing?'
      }
    })
    return null
  }

  const jokes = await admin
    .database()
    .ref(`jokes/${uid}`)
    .set(null)

  res.send({ message: 'Joke deleted!' })
})

app.post('/api/v1/jokes', async (req, res) => {
  const key = req.query.key
  const data = req.body

  if (key !== 'babo') {
    res.status(403).send({
      error: {
        code: 1,
        message: 'Wrong key! Do you know who the babo is?'
      }
    })
    return null
  }

  const { author = false, joke = false, ...rest } = data

  if (!author) {
    res.status(403).send({
      error: {
        code: 2,
        message: 'No author set! You are shy or what?'
      }
    })
    return null
  }

  if (!joke) {
    res.status(403).send({
      error: {
        code: 3,
        message: 'No joke set! This makes no sense. You funny or not? Give me a joke.'
      }
    })
    return null
  }

  if (Object.keys(rest).length > 0) {
    res.status(403).send({
      error: {
        code: 4,
        message: 'No other props than autor and joke allowed! Do not mess with the babo.'
      }
    })
    return null
  }

  const newJoke = await admin
    .database()
    .ref('/jokes')
    .push(data)

  res.send({ uid: newJoke.key })
})

/*
app.get('*', async (req, res) => {
  res.send('what???', 404)
})
*/

exports.app = functions.https.onRequest(app)
