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

Papa.parse(BANK_DATA_SRC, {
  download: true,
  header: true,
  dynamicTyping: true,
  complete: result => app.items = result.data.map(item => ({
    id: item.id,
    name: item.Item,
    count: item.Count
  }))
})