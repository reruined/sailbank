const BANK_DATA_SRC = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ0BFdfpHUGmyGD6wyw8fcgADKA-CQXIosKU-JA6k4o5mjp-oa4UDRG5cxJOyeiOpUB74tSPjCiEHa1/pub?output=csv'

const app = new Vue({
  el: '#app',
  data: {
    items: [],
    filter: ""
  },
  computed: {
    filteredItems: function() {
      const lowercaseFilter = this.filter.toLowerCase()
      return this.items.filter(item => item.name.toLowerCase().includes(lowercaseFilter))
    }
  },
  updated: function() {
    console.log('updated')
    this.$nextTick(function() {
      console.log('refreshLinks()')
      $WowheadPower.refreshLinks()
    })
  },
})

new Promise((resolve, reject) => {
  Papa.parse(BANK_DATA_SRC, {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: result => resolve(result.data.map(item => ({
      id: item.id,
      name: item.Item,
      count: item.Count
    })))
  })
})
  .then(items => Promise.all(items.map(item => new Promise((resolve, reject) => {
    fetch(`https://cors-anywhere.herokuapp.com/https://classic.wowhead.com/item=${item.id}&xml`)
      .then(res => res.text())
      .then(rawXml => {
        const doc = new DOMParser().parseFromString(rawXml, 'text/xml')
        console.log(item.name, doc)
        resolve(item)
      })
  }))))
  .then(items => app.items = items)