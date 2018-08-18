import FileController from '@/lib/file-controller.js'
import { Constants } from 'alpheios-data-models'

export default class ConfigController {
  constructor (configFile) {
    this.configFile = configFile
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
}
