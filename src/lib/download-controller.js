import FileController from '@/lib/file-controller.js'

export default class DownloadController {
  static downloadMorph (dc) {
    if (!dc.resultData.morphData) {
      dc.resultData.createMorphDataDownload()
    }
    FileController.writeCSVData(dc.resultData.morphData, dc.tabDelimiter, '-morphData.csv')
  }

  static downloadShortDef (dc) {
    if (!dc.resultData.shortDefData) {
      dc.resultData.createShortDefDownload()
    }
    FileController.writeCSVData(dc.resultData.shortDefData, dc.tabDelimiter, '-shortDefData.csv')
  }

  static downloadFullDef (dc) {
    if (!dc.resultData.fullDefData) {
      dc.resultData.createFullDefDownload()
    }

    for (let tbl in dc.resultData.fullDefData) {
      FileController.writeData(dc.resultData.fullDefData[tbl], `-fullDefData-${tbl}.html`)
    }
  }

  static downloadTranslations (dc) {
    if (!dc.resultData.translationsData) {
      dc.resultData.createTranslationsDataDownload()
    }

    FileController.writeCSVData(dc.resultData.translationsData, dc.tabDelimiter, '-translationsData.csv')
  }

  static downloadFailedMorph (dc) {
    if (!dc.resultData.failedMorph) {
      dc.resultData.createFailedMorphDownload()
    }
    FileController.writeCSVData(dc.resultData.failedMorph, dc.tabDelimiter, '-failedMorph.csv')
  }

  static downloadFailedShortDef (dc) {
    if (!dc.resultData.failedShortDef) {
      dc.resultData.createFailedShortDefDownload()
    }
    FileController.writeCSVData(dc.resultData.failedShortDef, dc.tabDelimiter, '-failedShortDef.csv')
  }

  static downloadFailedFullDef (dc) {
    if (!dc.resultData.failedFullDef) {
      dc.resultData.createFailedFullDefDownload()
    }
    FileController.writeCSVData(dc.resultData.failedFullDef, dc.tabDelimiter, '-failedFullDef.csv')
  }

  static downloadFailedTranslations (dc) {
    if (!dc.resultData.failedTranslations) {
      dc.resultData.createFailedTranslationsDownload()
    }
    FileController.writeCSVData(dc.resultData.failedTranslations, dc.tabDelimiter, '-failedTranslations.csv')
  }

  static downloadFailedAnything (dc) {
    if (!dc.resultData.failedAnything) {
      dc.resultData.createFailedAnythingDownload()
    }
    FileController.writeCSVData(dc.resultData.failedAnything, dc.tabDelimiter, '-failedAnything.csv')
  }
}
