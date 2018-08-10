/* eslint-env jest */
/* eslint-disable no-unused-vars */
/* global Event */

import DataController from '@/lib/data-controller.js'

class Embedded {
  constructor (configFile, tabDelimiter) {
    this.resultsId = 'alpheios-tests-results'
    this.dataController = new DataController(configFile, tabDelimiter)
    this.dataController.initVue()
  }
}

export {Embedded}
