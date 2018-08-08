/* eslint-env jest */
/* eslint-disable no-unused-vars */

import LexicalQuery from '@/lib/lexical-query.js'
import Vue from 'vue/dist/vue'

export default class CheckTable {
  constructor () {
    this.data = []
  }

  clear (dataController) {
    this.data = []
    this.morphData = null
    this.shortDefData = null
    this.fullDefData = null
    this.failedWords = null
    this.failedMorph = null
    this.translationsData = null
    Vue.set(dataController.vueApp, 'resulttable', this.data)
    Vue.set(dataController.vueApp, 'tableready', null)
  }

  async getData (dataController, langs = []) {
    Vue.set(dataController.vueApp, 'tableready', false)

    let sourceData = dataController.sourceData
    for (let i = 0; i < sourceData.length; i++) {
      let sourceItem = sourceData[i]
      let lexQuery = new LexicalQuery(sourceItem)

      let homonymData = await this.getMorphData(lexQuery)
      this.data.push(homonymData)

      if (lexQuery.homonym && lexQuery.homonym.lexemes) {
        lexQuery.homonym.lexemes.forEach(lex => { lex.meaning.shortDefs = [] })

        await this.getShortDefsData(lexQuery, homonymData)
        await this.getFullDefsData(lexQuery, homonymData)

        if (langs.length > 0) {
          await this.getLemmaTranslations(lexQuery, homonymData, langs)
        }
      }

      Vue.set(dataController.vueApp, 'resulttable', this.data)
    }
    Vue.set(dataController.vueApp, 'tableready', true)
  }

  async getMorphData (lexQuery) {
    let homonymData = {
      targetWord: lexQuery.targetWord,
      languageID: lexQuery.languageID,
      languageName: lexQuery.languageName,
      lexiconShortOpts: lexQuery.lexiconShortOpts,
      lexiconFullOpts: lexQuery.lexiconFullOpts,

      morphClient: false
    }

    await lexQuery.getMorphData()

    if (lexQuery.homonym && lexQuery.homonym.lexemes) {
      homonymData.morphClient = true

      homonymData.lexemes = []
      lexQuery.homonym.lexemes.forEach(lexeme => {
        let lexemeData = { lemmaWord: lexeme.lemma.word, morphData: {} }
        lexemeData.morphData.principalParts = lexeme.lemma.principalParts.join('; ')
        for (let feature in lexeme.lemma.features) {
          lexemeData.morphData[feature] = lexeme.lemma.features[feature].value
        }

        if (lexeme.meaning.shortDefs.length > 0) {
          lexemeData.morphShortDefs = lexeme.meaning.shortDefs.map(def => def.text)
        }
        homonymData.lexemes.push(lexemeData)
      })
    }

    return homonymData
  }

  async getShortDefsData (lexQuery, homonymData) {
    await lexQuery.getShortDefsData()

    lexQuery.homonym.lexemes.forEach((lexeme, index) => {
      homonymData.lexemes[index].shortDefData = { lexClient: false }
      if (lexeme.meaning.shortDefs.length > 0) {
        homonymData.lexemes[index].shortDefData.lexClient = true
        homonymData.lexemes[index].shortDefData.shortDefs = lexeme.meaning.shortDefs.map(def => { return { text: def.text, code: def.code, dict: def.dict } })
      }
    })
  }

  async getFullDefsData (lexQuery, homonymData) {
    await lexQuery.getFullDefsData()

    lexQuery.homonym.lexemes.forEach((lexeme, index) => {
      homonymData.lexemes[index].fullDefData = { lexClient: false }
      if (lexeme.meaning.fullDefs.length > 0) {
        homonymData.lexemes[index].fullDefData.lexClient = true
        homonymData.lexemes[index].fullDefData.showAll = false
        homonymData.lexemes[index].fullDefData.fullDefs = lexeme.meaning.fullDefs.map(def => { return { text: def.text, code: def.code, dict: def.dict } })
      }
    })
  }

  async getLemmaTranslations (lexQuery, homonymData, langs) {
    homonymData.langs = langs
    await lexQuery.getLemmaTranslations(langs)

    lexQuery.homonym.lexemes.forEach((lexeme, index) => {
      homonymData.lexemes[index].translations = {}
      for (let lang of langs) {
        let curTrans = lexeme.lemma.translations.filter(trans => trans.languageCode === lang.property)

        if (curTrans.length === 0) {
          homonymData.lexemes[index].translations[lang.property] = { languageCode: lang.property }
        } else {
          homonymData.lexemes[index].translations[lang.property] = curTrans[0]
        }
      }
    })

    console.info('*****************getLemmaTranslations', homonymData)
  }

  getFeaturesList () {
    let featuresList = []
    this.data.forEach(homonym => {
      if (homonym.lexemes) {
        homonym.lexemes.forEach(lexeme => {
          for (let feature in lexeme.morphData) {
            if (featuresList.indexOf(feature) === -1) { featuresList.push(feature) }
          }
        })
      }
    })
    return featuresList
  }

  createMorphDataDownload () {
    let table = []
    let featuresList = this.getFeaturesList()

    let header = ['TargetWord', 'Language', 'MorphClient', 'LemmaWord']
    header = header.concat(featuresList)
    header.push('MorphShortDef')
    table.push(header)

    this.data.forEach(homonym => {
      let targetWord = homonym.targetWord
      let langCode = homonym.languageName
      let hasMorphData = homonym.morphClient ? 'yes' : 'no'

      if (homonym.lexemes) {
        homonym.lexemes.forEach(lexeme => {
          let row = []
          row.push(targetWord, langCode, hasMorphData)
          row.push(lexeme.lemmaWord)

          for (let feature of featuresList) {
            row.push(lexeme.morphData[feature])
          }

          let defs = lexeme.morphShortDefs ? lexeme.morphShortDefs.map((item, index) => (lexeme.morphShortDefs.length > 1 ? ((index + 1) + '. ') : '') + item).join(';\r\n') : 'no'
          row.push(defs)
          table.push(row)
        })
      } else {
        let row = []
        row.push(targetWord, langCode, hasMorphData)
        table.push(row)
      }
    })

    this.morphData = table
  }

  getDictsList (subArr1, subArr2) {
    let dictsList = []

    this.data.forEach(homonym => {
      if (homonym.lexemes) {
        homonym.lexemes.forEach(lexeme => {
          if (lexeme[subArr1][subArr2]) {
            lexeme[subArr1][subArr2].forEach(def => {
              if (dictsList.indexOf(def.dict) === -1) {
                dictsList.push(def.dict)
              }
            })
          }
        })
      }
    })

    return dictsList
  }

  createShortDefDownload () {
    let table = []

    let dictsList = this.getDictsList('shortDefData', 'shortDefs')

    let header = ['TargetWord', 'Language', 'LexClient', 'LemmaWord']
    header = header.concat(dictsList)
    table.push(header)

    this.data.forEach(homonym => {
      let targetWord = homonym.targetWord
      let langCode = homonym.languageName

      if (homonym.lexemes) {
        homonym.lexemes.forEach(lexeme => {
          let row = []
          row.push(targetWord)
          row.push(langCode)
          row.push(lexeme.shortDefData.lexClient ? 'yes' : 'no')
          row.push(lexeme.lemmaWord)

          if (lexeme.shortDefData.shortDefs) {
            dictsList.forEach(dict => {
              let dictValue = []
              lexeme.shortDefData.shortDefs.forEach(def => {
                if (def.dict === dict) { dictValue.push(def.text ? def.text : 'no') }
              })
              row.push(dictValue.length > 0 ? dictValue.map((item, index) => (dictValue.length > 1 ? (index + 1) + '. ' : '') + item).join(';\r\n') : null)
            })
          }
          table.push(row)
        })
      } else {
        let row = []
        row.push(targetWord)
        row.push(langCode)
        row.push('no')
        table.push(row)
      }
    })

    this.shortDefData = table
  }

  createFullDefDownload () {
    let dictsList = this.getDictsList('fullDefData', 'fullDefs')
    let dictsTables = {}

    for (let dict of dictsList) {
      let table = ''
      let allWords = ''
      this.data.forEach(homonym => {
        let checkDict = homonym.lexemes ? homonym.lexemes.some(lexeme => lexeme.fullDefData && lexeme.fullDefData.fullDefs.some(def => def.dict === dict)) : false

        if (checkDict) {
          allWords = allWords + `<li><a href="#${homonym.targetWord}">${homonym.targetWord}</a></li>`
          table = table + `<h1 id="${homonym.targetWord}">${homonym.targetWord} - ${homonym.languageName}</h1>`

          if (homonym.lexemes) {
            homonym.lexemes.forEach((lexeme, index) => {
              let curIndex = homonym.lexemes.length > 1 ? (index + 1) + '. ' : ''
              table = table + `<h2>${curIndex}${lexeme.lemmaWord}</h2>`
              if (lexeme.fullDefData.fullDefs) {
                lexeme.fullDefData.fullDefs.filter(fullDef => fullDef.dict === dict).forEach(fullDef => { table = table + (fullDef.text ? fullDef.text : 'No data') })
              }
            })
          } else {
            table = table + `<h2>No data</h2>`
          }
          table = table + `<p><a href="#content">to start</a></p>`
        }
      })

      table = '<!doctype html><html><head></head><body><ol id="content">' + allWords + '</ol>' + table + '</body></html>'
      dictsTables[dict] = table
    }

    this.fullDefData = dictsTables
  }

  createFailedWordsDownload () {
    let table = []
    let header = ['TargetWord', 'Language', 'MorphClient', 'LemmaWord', 'ShortLexical', 'FullLexical']
    table.push(header)

    let dictsListShort = this.getDictsList('shortDefData', 'shortDefs')
    let dictsListFull = this.getDictsList('fullDefData', 'fullDefs')

    this.data.forEach(homonym => {
      let targetWord = homonym.targetWord
      let langCode = homonym.languageName
      let hasMorphData = homonym.morphClient ? 'yes' : 'no'

      if (!homonym.morphClient) {
        table.push([targetWord, langCode, hasMorphData])
      } else {
        homonym.lexemes.forEach(lexeme => {
          let shortDefsResult = []
          let fullDefsResult = []

          if (lexeme.shortDefData.shortDefs) {
            dictsListShort.forEach(dict => {
              let dictValue = []
              lexeme.shortDefData.shortDefs.forEach(def => {
                if (def.dict === dict && !def.text) { shortDefsResult.push(dict + ' - no') }
              })
              lexeme.fullDefData.fullDefs.forEach(def => {
                if (def.dict === dict && !def.text) { fullDefsResult.push(dict + ' - no') }
              })
            })
          }

          if (shortDefsResult.length > 0 || fullDefsResult.length > 0) {
            table.push([targetWord, langCode, hasMorphData, lexeme.lemmaWord, shortDefsResult.join(',\r\n'), fullDefsResult.join(',\r\n')])
          }
        })
      }
    })

    this.failedWords = table
  }

  createFailedMorphDownload () {
    let table = []
    let header = ['TargetWord', 'Language', 'MorphClient']
    table.push(header)

    this.data.forEach(homonym => {
      let targetWord = homonym.targetWord
      let langCode = homonym.languageName
      let hasMorphData = homonym.morphClient ? 'yes' : 'no'

      if (!homonym.morphClient) {
        table.push([targetWord, langCode, hasMorphData])
      }
    })

    this.failedMorph = table
  }

  createTranslationsDataDownload () {
    let langs = this.data[0].langs.map(lang => lang.property)

    let table = []
    let header = ['TargetWord', 'Language', 'Lemma', ...langs]

    table.push(header)

    this.data.forEach(homonym => {
      let targetWord = homonym.targetWord
      let langCode = homonym.languageName

      if (homonym.lexemes) {
        homonym.lexemes.forEach(lexeme => {
          let langsData = []
          let lemma = lexeme.lemmaWord
          for (let lang of langs) {
            if (lexeme.translations[lang].glosses) {
              langsData.push(lexeme.translations[lang].glosses.join('; '))
            }
          }
          table.push([targetWord, langCode, lemma, ...langsData])
        })
      }
    })
    this.translationsData = table
  }
}
