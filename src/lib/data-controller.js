/* eslint-env jest */
/* eslint-disable no-unused-vars */

import FileController from '@/lib/file-controller.js'
import DownloadController from '@/lib/download-controller.js'

import { Constants } from 'alpheios-data-models'

import ResultGrid from '@/vue-components/result-grid.vue'
import Vue from 'vue/dist/vue'
import Template from '@/templates/template.htmlf'

import CheckTable from '@/lib/check-table.js'

export default class DataController {
  constructor (configFile = 'libraryConfig.json', tabDelimiter = '\t') {
    this.configFile = configFile
    this.resultData = new CheckTable()
    this.tabDelimiter = tabDelimiter
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
    if (defOpts) {
      if (!defOpts.codes) { defOpts.codes = [] }
      if (defOpts.codes.length === 0) {
        defOpts.codes = Object.keys(this.dictionaries).filter(key => this.dictionaries[key].languageCode === languageCode)
      }

      defOpts.allow = defOpts.codes.map(code => this.dictionaries[code].url)
      defOpts.dicts = defOpts.codes.map(code => `${code} (${this.dictionaries[code].name})`)
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
          tableready: null,
          translationlangs: dataController.translationlangs
        }
      },
      methods: {
        downloadmorph () {
          DownloadController.downloadMorph(dataController)
        },
        downloadshortdef () {
          DownloadController.downloadShortDef(dataController)
        },
        downloadfulldef () {
          DownloadController.downloadFullDef(dataController)
        },
        downloadtranslations () {
          DownloadController.downloadTranslations(dataController)
        },

        downloadfailedmorph () {
          DownloadController.downloadFailedMorph(dataController)
        },

        downloadfailedshortdef () {
          DownloadController.downloadFailedShortDef(dataController)
        },
        downloadfailedfulldef () {
          DownloadController.downloadFailedFullDef(dataController)
        },
        downloadfailedtranslations () {
          DownloadController.downloadFailedTranslations(dataController)
        },
        downloadfailedanything () {
          DownloadController.downloadFailedAnything(dataController)
        },

        getdata (sourceData, langs, skipShortDefs, skipFullDefs) {
          dataController.prepareSourceData(sourceData)
          dataController.resultData.getData(dataController, langs, skipShortDefs, skipFullDefs)
        },

        clearresulttable () {
          dataController.resultData.clear(dataController)
        }
      }
    })
  }
}
