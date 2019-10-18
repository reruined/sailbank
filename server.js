const express = require('express')
const path = require('path')
const fetch = require('node-fetch')
const papa = require('papaparse')
const xml2js = require('xml2js')

const port = process.env.PORT || 1337
const bankDataSrc = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ0BFdfpHUGmyGD6wyw8fcgADKA-CQXIosKU-JA6k4o5mjp-oa4UDRG5cxJOyeiOpUB74tSPjCiEHa1/pub?output=csv';

const app = express()
app.set('view engine', 'pug')
app.use(express.static('public'))

app.get('/', (req, res) => {
  fetch(bankDataSrc)
    .then(res => res.text())
    .then(csv => {
      const parsedCsv = papa.parse(csv, { header: true, dynamicTyping: true })

      return Promise.all(parsedCsv.data.map(item => {
        return new Promise((resolve, reject) => {
          const itemName = item.Item.toLowerCase()
          const wowheadUrl = `https://www.classic.wowhead.com/item=${escape(itemName)}&xml`

          fetch(wowheadUrl)
            .then(res => res.text())
            .then(xml => xml2js.parseStringPromise(xml))
            .then(parsedXml => {
              const id = parsedXml.wowhead.error ? -1 : parsedXml.wowhead.item[0]['$'].id;
              const icon = parsedXml.wowhead.error ? 'inv_misc_questionmark' : parsedXml.wowhead.item[0].icon[0]._
              resolve(Object.assign({}, {name: item.Item, count: item.Count || 1, id, icon}))
            })
        })
      }))
    })
    .then(items => {
      res.render('index', { contents: items })
    })
})

app.listen(port, () => console.log(`Listening on port ${port}`))
