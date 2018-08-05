/* eslint-env jest */
/* eslint-disable no-unused-vars */
/* global Event */

import DataController from '@/lib/data-controller.js'

class Embedded {
  constructor () {
    this.resultsId = 'alpheios-tests-results'
    this.dataController = new DataController()
    this.dataController.initVue()
  }
}

export {Embedded}
