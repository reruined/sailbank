const express = require('express')
const path = require('path')
const fetch = require('node-fetch')
const papa = require('papaparse')

const port = 1337
const bankDataSrc = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ0BFdfpHUGmyGD6wyw8fcgADKA-CQXIosKU-JA6k4o5mjp-oa4UDRG5cxJOyeiOpUB74tSPjCiEHa1/pub?output=csv';

const app = express()
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  fetch(bankDataSrc)
    .then(data => data.text())
    .then(body => {
      const bankData = papa.parse(body, { header: true, dynamicTyping: true })
      res.render('index', bankData.data)
    })
})

app.listen(port, () => console.log(`Listening on port ${port}`))
