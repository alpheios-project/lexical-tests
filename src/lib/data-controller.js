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
  constructor (configFile = 'libraryConfig.json', tabDelimiter = '\t') {
    this.configFile = configFile
    this.resultData = new CheckTable()
    this.tabDelimiter = tabDelimiter

    console.info('********************constructor', JSON.stringify(tabDelimiter), JSON.stringify(this.tabDelimiter))
  }

  async initVue () {
    await this.loadConfigData()
    this.createVueApp()
  }

  async loadConfigData () {
    if (this.configFile) {
      try {
        let config = await FileController.getFileContents(this.configFile)

        this.languages = this.prepareLanguagesConfig(config.languages)
        this.dictionaries = config.dictionaries
        this.translationlangs = config.translationlangs
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

  prepareSourceData (sourceData) {
    sourceData.forEach(dataItem => {
      dataItem.languageID = this.languages[dataItem.languageCode].const
      dataItem.languageName = this.languages[dataItem.languageCode].name
      this.prepareLexicalConfigs(dataItem.lexiconShortOpts, dataItem.languageCode)
      this.prepareLexicalConfigs(dataItem.lexiconFullOpts, dataItem.languageCode)
    })
    sourceData.sort(function (a, b) { return a.languageCode < b.languageCode })
    this.sourceData = sourceData
  }

  prepareLexicalConfigs (defOpts, languageCode) {
    if (!defOpts.codes) { defOpts.codes = [] }
    if (defOpts.codes.length === 0) {
      defOpts.codes = Object.keys(this.dictionaries).filter(key => this.dictionaries[key].languageCode === languageCode)
    }

    defOpts.allow = defOpts.codes.map(code => this.dictionaries[code].url)
    defOpts.dicts = defOpts.codes.map(code => `${code} (${this.dictionaries[code].name})`)
  }

  static getPrintData () {
    let dt = new Date()
    return dt.toLocaleString('en-GB').replace(/\//g, '-').replace(/:/g, '-').replace(' ', '')
  }

  downloadMorph () {
    if (!this.resultData.morphData) {
      this.resultData.createMorphDataDownload()
    }

    let printDt = DataController.getPrintData()
    console.info('*******************downloadMorph', JSON.stringify(this.tabDelimiter), this.resultData.morphData)
    FileController.saveFile(csvParser.unparse(this.resultData.morphData, {delimiter: this.tabDelimiter}), printDt + '-morphData.csv')
  }

  downloadShortDef () {
    if (!this.resultData.shortDefData) {
      this.resultData.createShortDefDownload()
    }

    let printDt = DataController.getPrintData()
    FileController.saveFile(csvParser.unparse(this.resultData.shortDefData, {delimiter: this.tabDelimiter}), printDt + '-shortDefData.csv')
  }

  downloadFullDef () {
    if (!this.resultData.fullDefData) {
      this.resultData.createFullDefDownload()
    }

    let printDt = DataController.getPrintData()

    for (let tbl in this.resultData.fullDefData) {
      FileController.saveFile(this.resultData.fullDefData[tbl], `${printDt}-fullDefData-${tbl}.html`, 'text/html')
    }
  }

  downloadTranslations () {
    if (!this.resultData.translationsData) {
      this.resultData.createTranslationsDataDownload()
    }

    let printDt = DataController.getPrintData()
    FileController.saveFile(csvParser.unparse(this.resultData.translationsData, {delimiter: this.tabDelimiter}), printDt + '-translationsData.csv')
  }

  downloadFailedMorph () {
    if (!this.resultData.failedMorph) {
      this.resultData.createFailedMorphDownload()
    }

    let printDt = DataController.getPrintData()
    FileController.saveFile(csvParser.unparse(this.resultData.failedMorph, {delimiter: this.tabDelimiter}), printDt + '-failedMorph.csv')
  }

  downloadFailedShortDef () {
    if (!this.resultData.failedShortDef) {
      this.resultData.createFailedShortDefDownload()
    }

    let printDt = DataController.getPrintData()
    FileController.saveFile(csvParser.unparse(this.resultData.failedShortDef, {delimiter: this.tabDelimiter}), printDt + '-failedShortDef.csv')
  }

  downloadFailedFullDef () {
    if (!this.resultData.failedFullDef) {
      this.resultData.createFailedFullDefDownload()
    }

    let printDt = DataController.getPrintData()
    FileController.saveFile(csvParser.unparse(this.resultData.failedFullDef, {delimiter: this.tabDelimiter}), printDt + '-failedFullDef.csv')
  }

  downloadFailedTranslations () {
    if (!this.resultData.failedTranslations) {
      this.resultData.createFailedTranslationsDownload()
    }

    let printDt = DataController.getPrintData()
    FileController.saveFile(csvParser.unparse(this.resultData.failedTranslations, {delimiter: this.tabDelimiter}), printDt + '-failedTranslations.csv')
  }

  downloadFailedAnything () {
    if (!this.resultData.failedAnything) {
      this.resultData.createFailedAnythingDownload()
    }

    let printDt = DataController.getPrintData()
    FileController.saveFile(csvParser.unparse(this.resultData.failedAnything, {delimiter: this.tabDelimiter}), printDt + '-failedAnything.csv')
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
          tableready: null,
          translationlangs: dataController.translationlangs
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
        downloadtranslations () {
          dataController.downloadTranslations()
        },

        downloadfailedmorph () {
          dataController.downloadFailedMorph()
        },

        downloadfailedshortdef () {
          dataController.downloadFailedShortDef()
        },
        downloadfailedfulldef () {
          dataController.downloadFailedFullDef()
        },
        downloadfailedtranslations () {
          dataController.downloadFailedTranslations()
        },
        downloadfailedanything () {
          dataController.downloadFailedAnything()
        },

        getdata (sourceData, langs) {
          dataController.prepareSourceData(sourceData)
          dataController.resultData.getData(dataController, langs)
        },
        clearresulttable () {
          dataController.resultData.clear(dataController)
        }
      }
    })
  }
}
