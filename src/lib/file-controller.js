/* eslint-env jest */

import axios from 'axios'
const Blob = require('blob')
const moment = require('moment')
const csvParser = require('papaparse')

export default class FileController {
  static async getFileContents (file) {
    try {
      const res = await axios.get(file)
      return res.data
    } catch (error) {
      console.error(error)
    }
  }

  static getPrintData () {
    let dt = moment(new Date())
    return dt.format('DD-MM-YYYY_HH-mm-ss')
  }

  static writeData (data, filename, mimetype) {
    if (!data) return

    let printDt = FileController.getPrintData()
    let outputFN = printDt + filename

    let blob = data.constructor !== Blob
      ? new Blob(['\ufeff', data], {type: mimetype || 'application/octet-stream'})
      : data

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, outputFN)
      return
    }

    let lnk = document.createElement('a')
    let url = window.URL
    let objectURL

    if (mimetype) {
      lnk.type = mimetype
    }

    lnk.download = outputFN || 'untitled'
    lnk.href = objectURL = url.createObjectURL(blob)
    lnk.dispatchEvent(new window.MouseEvent('click'))
    setTimeout(url.revokeObjectURL.bind(url, objectURL))
  }

  static writeCSVData (data, tabDelimiter, filename) {
    let printDt = FileController.getPrintData()
    let outputFN = printDt + filename

    FileController.writeData(csvParser.unparse(data, {delimiter: tabDelimiter, newline: '\r\n', encoding: 'utf8'}), outputFN)
  }
}
