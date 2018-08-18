/* eslint-env jest */
/* eslint-disable no-unused-vars */
/* global Event */

import DataController from '@/lib/data-controller.js'

class Embedded {
  constructor (resultsId, configFile, tabDelimiter) {
    this.resultsId = resultsId || 'alpheios-tests-results'
    this.dataController = new DataController(configFile, tabDelimiter)
    this.dataController.initVue()
  }
}

export {Embedded}
