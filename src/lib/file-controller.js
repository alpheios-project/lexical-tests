/* eslint-env jest */

import axios from 'axios'
const Blob = require('blob')

export default class FileController {
  static async getFileContents (file) {
    try {
      const res = await axios.get(file)
      return res.data
    } catch (error) {
      console.error(error)
    }
  }

  static saveFile (data, filename, mimetype) {
    if (!data) return

    let blob = data.constructor !== Blob
      ? new Blob(['\ufeff', data], {type: mimetype || 'application/octet-stream'})
      : data

    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename)
      return
    }

    let lnk = document.createElement('a')
    let url = window.URL
    let objectURL

    if (mimetype) {
      lnk.type = mimetype
    }

    lnk.download = filename || 'untitled'
    lnk.href = objectURL = url.createObjectURL(blob)
    lnk.dispatchEvent(new window.MouseEvent('click'))
    setTimeout(url.revokeObjectURL.bind(url, objectURL))
  }
}
