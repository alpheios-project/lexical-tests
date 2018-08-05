/* eslint-env jest */
/* eslint-disable no-unused-vars */

import FileController from '@/lib/file-controller.js'
import { Constants } from 'alpheios-data-models'

import ResultGrid from '@/vue-components/result-grid.vue'
import Vue from 'vue/dist/vue'
import Template from '@/templates/template.htmlf'

import CheckTable from '@/lib/check-table.js'

const csvParser = require('papaparse')

export default class DataController {
  constructor (dataFile = 'data.json', configFile = 'libraryConfig.json') {
    this.dataFile = dataFile
    this.configFile = configFile
    this.resultData = new CheckTable()
  }

  async initVue () {
    await this.loadConfigData()
    await this.loadSourceData()
    this.createVueApp()
    // this.resultData.getData(this)
  }

  async loadConfigData () {
    if (this.configFile) {
      try {
        let config = await FileController.getFileContents(this.configFile)

        this.languages = this.prepareLanguagesConfig(config.languages)
        this.dictionaries = config.dictionaries
      } catch (err) {
        console.error('Some problems with loading config data', err.message)
      }
    }
  }

  prepareLanguagesConfig (languagesRaw) {
    let langRes = {}
    for (let lang in languagesRaw) {
      langRes[lang] = {
        const: Constants['LANG_' + languagesRaw[lang].toUpperCase()],
        name: languagesRaw[lang]
      }
    }
    return langRes
  }

  async loadSourceData () {
    if (this.dataFile) {
      try {
        let sourceData = await FileController.getFileContents(this.dataFile)
        this.prepareSourceData(sourceData)
      } catch (err) {
        console.error('Some problems with loading source data', err.message)
      }
    }
  }

  prepareSourceData (sourceData) {
    sourceData.forEach(dataItem => {
      dataItem.languageID = this.languages[dataItem.languageCode].const
      dataItem.languageName = this.languages[dataItem.languageCode].name
      this.prepareLexicalConfigs(dataItem.lexiconShortOpts, dataItem.languageCode)
      this.prepareLexicalConfigs(dataItem.lexiconFullOpts, dataItem.languageCode)
    })
    sourceData.sort(function (a, b) { return a.languageCode < b.languageCode })
    this.sourceData = sourceData
    console.info('********************prepareSourceData', this.sourceData)
  }

  prepareLexicalConfigs (defOpts, languageCode) {
    if (!defOpts.codes) { defOpts.codes = [] }
    if (defOpts.codes.length === 0) {
      defOpts.codes = Object.keys(this.dictionaries).filter(key => this.dictionaries[key].languageCode === languageCode)
    }

    defOpts.allow = defOpts.codes.map(code => this.dictionaries[code].url)
    defOpts.dicts = defOpts.codes.map(code => `${code} (${this.dictionaries[code].name})`)
  }

  downloadMorph () {
    if (!this.resultData.morphData) {
      this.resultData.createMorphDataDownload()
    }

    let dt = new Date()
    let printDt = dt.toLocaleString('en-GB').replace(/\//g, '-').replace(/:/g, '-')
    FileController.saveFile(csvParser.unparse(this.resultData.morphData, {delimiter: ';'}), printDt + ' - morphData.csv')
  }

  downloadShortDef () {
    if (!this.resultData.shortDefData) {
      this.resultData.createShortDefDownload()
    }

    let dt = new Date()
    let printDt = dt.toLocaleString('en-GB').replace(/\//g, '-').replace(/:/g, '-')
    FileController.saveFile(csvParser.unparse(this.resultData.shortDefData, {delimiter: ';'}), printDt + ' - shortDefData.csv')
  }

  downloadFullDef () {
    if (!this.resultData.fullDefData) {
      this.resultData.createFullDefDownload()
    }

    let dt = new Date()
    let printDt = dt.toLocaleString('en-GB').replace(/\//g, '-').replace(/:/g, '-')

    for (let tbl in this.resultData.fullDefData) {
      FileController.saveFile(this.resultData.fullDefData[tbl], `${printDt}-fullDefData-${tbl}.html`, 'text/html')
    }
  }

  createVueApp () {
    const dataController = this
    this.vueApp = new Vue({
      el: '#alpheios-tests-results',
      template: Template,
      components: {
        resultgrid: ResultGrid
      },
      data () {
        return {
          resulttable: [],
          tableready: null
        }
      },
      methods: {
        downloadmorph () {
          dataController.downloadMorph()
        },
        downloadshortdef () {
          dataController.downloadShortDef()
        },
        downloadfulldef () {
          dataController.downloadFullDef()
        },
        getdata (sourceData) {
          dataController.prepareSourceData(sourceData)
          dataController.resultData.getData(dataController)
        },
        clearresulttable () {
          dataController.resultData.clear(dataController)
        }
      }
    })
  }
}