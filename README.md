Alpheios Lexical Tests - command line versiom

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://travis-ci.org/alpheios-project/lexicon-client.svg?branch=master)](https://travis-ci.org/alpheios-project/lexicon-client)
[![Coverage Status](https://coveralls.io/repos/github/alpheios-project/lexicon-client/badge.svg?branch=master)](https://coveralls.io/github/alpheios-project/lexicon-client?branch=master)

# Usage

## Prerequisites

* Node >= 7

## Install Dependencies

```
npm install
```

## Adding to html page (server side)

Add to the head stylesheet link, script link

```
 <link rel="stylesheet" href="dist/style/style.min.css"/>`
 <script src="../dist/alpheios-lexical-tests.js"></script>`
```

Add a div for rendering the application:

```
<div id="alpheios-tests-results"></div>
```

Add a script tag for initializing the code:

```
<script type="text/javascript">
        document.addEventListener("DOMContentLoaded", function(event) {
          new Alpheios.Embedded();
        });
    </script>
```

Embedded class has the following parameters:

| Name | Type | Obligatory | Default | Description |
|------|------|------------|---------|-------------|
| **resultsId** | String | | "alpheios-tests-results" | The id of the tag for rendering an application |
| **configFile** | String | | "libraryConfig.json" | The name of the config file (description below) |
| **tabDelimiter** | String | | "\t" | Delimiter is used in .csv files |


## Data File Formats

### dataFile (variant 1) - Object:

| Name | Type | Obligatory | Default | Description |
|------|------|------------|---------|-------------|
| **queue_max** | Integer | | 2 | The amount of parallel requests (by target word) |
| **data** | Array of Objects | + |  | The array ob objects, each one defines a word and it's options for collecting data, The object structure should be the same as desacribed in the **dataFile (variant 2)** |


### dataFile (variant 2) - Array of Objects:

| Name | Type | Obligatory | Default | Description |
|------|------|------------|---------|-------------|
| **targetWord** | String | + |  | A word for collecting data about |
| **languageCode** | String | + |  | A language identifier of the target word - variants are defined in configFile - lat, grc, per, ara |
| **lexiconShortOpts** | Object |  |  | There are 3 variants of defining this parameter: <br> * no data at all, fetch for short definitions will be skipped <br>* empty object or `{ "codes": [] }`, fetch for short definitions will be done for all available dictionaries <br>* `{ "codes": ["lsj"] }` - with defined dictionary codes in `code` array, fetch for short definitions will be done for pointed dictionaries |
| **lexiconFullOpts** | Object |  |  | It is the same as for **lexiconShortOpts** but specifies the dictionary or dictionaries from which to retrieve full definitions |

### configFile format (should be in the same folder with index.html):

| Name | Type | Obligatory | Default | Description |
|------|------|------------|---------|-------------|
| **languages** | Object | + | | Object defines available languages for getting morph data.<br>It has the following structure:<br>`key` - languageCode (lat, grc, per, ara)<br>`value` - the name of the language, the same as it called in Constants - latin, greek, persian, arabic |
| **dictionaries** | Object | + | | Object defines available dictionaries for getting lexical data.<br>It has the following structure:<br>`key` - dictionaryCode<br>`value` - Object with the following structure:<br><br> - `url` - url of getting data from the dictionary,<br> - `name` - dictionary name for using it in the printed results,<br> - `languageCode` - languageCode of the dictionary |
| **translationlangs** | Object | + | | Object defines available languages for getting translations from lemma-client.<br>It has the following structure:<br>`key` - languageCode (browser language)<br>`value` - languageCode (translation language) |
