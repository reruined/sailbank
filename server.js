const express = require('express')
const fetch = require('node-fetch')
const papa = require('papaparse')
const DOMParser = require('xmldom').DOMParser

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
          const wowheadUrl = `https://classic.wowhead.com/item=${escape(itemName)}&xml`

          fetch(wowheadUrl)
            .then(res => res.text())
            .then(xml => {
              const doc = new DOMParser().parseFromString(xml)
              const error = doc.getElementsByTagName('error').length > 0
              error && console.log('error')

              const id = error ? -1 : doc.getElementsByTagName('item')[0].getAttribute('id')

              const iconNode = doc.getElementsByTagName('icon')[0]
              const icon = iconNode.firstChild ? iconNode.firstChild.nodeValue : 'inv_misc_questionmark'
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
