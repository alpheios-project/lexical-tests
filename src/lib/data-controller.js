/* eslint-env jest */
/* eslint-disable no-unused-vars */

import FileController from '@/lib/file-controller.js'
import DownloadController from '@/lib/download-controller.js'
import ConfigController from '@/lib/config-controller.js'

import ResultGrid from '@/vue-components/result-grid.vue'
import Vue from 'vue/dist/vue'
import Template from '@/templates/template.htmlf'

import CheckTable from '@/lib/check-table.js'

export default class DataController {
  constructor (configFile = 'libraryConfig.json', tabDelimiter = '\t') {
    this.configC = new ConfigController(configFile)
    this.resultData = new CheckTable()
    this.tabDelimiter = tabDelimiter
    this.defaultQueueMax = 2
  }

  async initVue () {
    await this.configC.loadConfigData()
    this.createVueApp()
  }

  prepareSourceData (sourceData) {
    sourceData.queue_max = sourceData.queue_max ? parseInt(sourceData.queue_max) : this.defaultQueueMax
    sourceData.data.forEach(dataItem => {
      dataItem.languageID = this.configC.languages[dataItem.languageCode].const
      dataItem.languageName = this.configC.languages[dataItem.languageCode].name
      this.configC.prepareLexicalConfigs(dataItem.lexiconShortOpts, dataItem.languageCode)
      this.configC.prepareLexicalConfigs(dataItem.lexiconFullOpts, dataItem.languageCode)
    })
    sourceData.data.sort(function (a, b) { return a.languageCode < b.languageCode })
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
          translationlangs: dataController.configC.translationlangs
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
          dataController.resultData.getData(sourceData, this, { langs, skipShortDefs, skipFullDefs })
        },

        clearresulttable () {
          dataController.resultData.clear(dataController)
        }
      }
    })
  }
}
