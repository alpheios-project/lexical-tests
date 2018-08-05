<template>
  <div id="alpheios-result-grid">
    <div class="alpheios-result-grid__file_block">
        <label>
          <input type="file" id="alpheios-result-grid__file" ref="sourcefile" v-on:change="handleFileUpload()"/>
          <span>Choose file</span>
        </label>
        <p class="alpheios-result-grid__file_name" v-if="file">{{ file.name }}, {{ fileSize }}Kb</p>
        <button v-on:click="uploadFile()" class="alpheios-result-grid__upload_file" :class="disabledClass(file)">Upload data</button>
        <p class="alpheios-result-grid__file_name" v-if="sourceData">Words - {{ sourceData.length }}</p>
        <button v-on:click="checkData()" class="alpheios-result-grid__upload_file" :class="disabledClass(sourceData)">Check data</button>
      </div> 
    <ul class="alpheios-result-grid__download_list">
      <li @click="downloadMorph" :class="disabledClass(tableready)">Download Morph Data</li>
      <li @click="downloadShortDef" :class="disabledClass(tableready)">Download Short Defs</li>
      <li @click="downloadFullDef" :class="disabledClass(tableready)">Download Full Defs</li>
    </ul>
    <span v-if="tableready !== null && tableready !== true" class="alpheios-result-grid__loader"></span>
    <table id= "alpheios-result-grid__table">
          <thead>
            <tr>
              <th>Target word/LangCode</th>
              <th>Morph data</th>
              <th>Morph definitions</th>
              <th>Short def data</th>
              <th>Full def data</th>
            </tr>
          </thead>
          <tbody v-for="homonym in resulttable">
            <tr>
              <td class="alpheios-tests-results__grid__divider">{{ homonym.targetWord }} - {{ homonym.languageName }}</td>
              <td colspan="2" :class="emptyClass(homonym.morphClient)">
                <b>{{ boolenToStr(homonym.morphClient) }}</b>
              </td>
              <td>{{ homonym.lexiconShortOpts.dicts.join('; ') }}</td>
              <td>{{ homonym.lexiconFullOpts.dicts.join('; ') }}</td>
            </tr>

            <tr v-for="(lexeme, index) in homonym.lexemes">
              <td><span v-if="homonym.lexemes.length > 1">{{ index + 1 }}.</span> {{ lexeme.lemmaWord }}</td>
              <td>
                  <ul>
                    <li v-for="(value, name) in lexeme.morphData" :class="emptyClass(value)">
                      <b>{{ name }}</b> - {{ value ? value : 'no data' }}
                    </li>
                  </ul>
              </td>
              <td>
                  <span v-if="!lexeme.morphShortDefs || lexeme.morphShortDefs.length === 0" :class="emptyClass(false)">no</span>
                  <ul v-if="lexeme.morphShortDefs && lexeme.morphShortDefs.length > 0">
                    <li v-for="value in lexeme.morphShortDefs"> {{ value }}</li>
                  </ul>
              </td>
              <td>
                <div v-if="lexeme.shortDefData">
                  <p class="alpheios-tests-results__grid__result"  :class="emptyClass(lexeme.shortDefData.lexClient)"><b>{{ boolenToStr(lexeme.shortDefData.lexClient) }}</b></p>
                  <ul v-if="lexeme.shortDefData.shortDefs.length>0">
                    <li v-for="(shortDef, indexS) in lexeme.shortDefData.shortDefs">
                      <span v-if="lexeme.shortDefData.shortDefs.length > 1">{{ indexS + 1 }}.</span>
                      <b>({{ shortDef.dict }})</b>
                      
                      <span v-if="shortDef.text">{{ shortDef.text }}</span>
                      <span v-if="!shortDef.text" :class="emptyClass(false)">No data</span>
                    </li>
                  </ul>
                </div>
              </td>
              <td>
                <div v-if="lexeme.fullDefData">
                  <p class="alpheios-tests-results__grid__result" :class="emptyClass(lexeme.fullDefData.lexClient)">{{ boolenToStr(lexeme.fullDefData.lexClient) }}</p>
                   <a class="alpheios-tests-results__grid__showLink" href="#" @click.stop="showAllClick(lexeme)">{{showAllText(lexeme)}}</a>
                  <div class="alpheios-tests-results__grid__fulldefs" 
                       v-for="fullDef in lexeme.fullDefData.fullDefs" 
                       :class="{showAll: lexeme.fullDefData.showAll}">
                    <p><b>{{ fullDef.dict }}</b></p>
                    <div v-if="fullDef.text" v-html="fullDef.text"></div>
                    <div v-if="!fullDef.text" :class="emptyClass(false)">no</div>
                  </div>
                </div>
              </td>
             </tr>
             <tr><td colspan="5" class="alpheios-tests-results__grid__divider"></td></tr>
          </tbody>
    </table>
  </div>
</template>
<script>
  // import axios from 'axios'
  export default {
    name: 'ResultGrid',
    props: {
      resulttable: {
        type: Array,
        required: false
      },
      tableready: {
        type: Boolean,
        required: false,
        default: false
      }
     },
    data () {
      return {
        file: null,
        sourceData: null
      }
    },
    computed: {
      fileSize () {
      	return this.file ? Math.round(this.file.size/1024*100)/100 : null
      }
    },
    watch: {
      file () {
      	this.sourceData = null
      	if (this.resulttable) {
      	  this.$emit('clearresulttable')
      	}
      }
    },
    methods: {
      handleFileUpload () {
        this.file = this.$refs.sourcefile.files[0];
      },
      
      async uploadFile () {
      	let vm = this
      	if (this.file) {
	      let reader = new FileReader()
	      reader.onload = function(event) {
	        let dataUri = event.target.result
	        try {
	          vm.sourceData = JSON.parse(dataUri)
	        } catch (err) {
	          console.error('***************some problems with converting the file', err.message)
	        }
	      }
	     
	      reader.onerror = function(event) {
	        console.error("Fail " + event.target.error.message);
	      }
	     
	      reader.readAsText(this.file)
	    }
      },

      boolenToStr (bool) {
        return bool ? 'yes' : 'no'
      },
      emptyClass (value, subValue = null) {
        if (!subValue) {
          return { 'alpheios-tests-results__grid__empty': !value }
        } else {
          return { 'alpheios-tests-results__grid__empty': !value || !value[subValue] }
        }
      },
      disabledClass (value) {
        return { 'alpheios-result-grid__download_list_disabled' : !value }
      },
      showAllClick (lexeme) {
        lexeme.fullDefData.showAll = !lexeme.fullDefData.showAll
      },
      showAllText (lexeme) {
        return lexeme.fullDefData.showAll ? 'Hide' : 'Show'
      },
      downloadMorph () {
        if (this.tableready) {
          this.$emit('downloadmorph')
        }
      },
      downloadShortDef () {
        if (this.tableready) {
          this.$emit('downloadshortdef')
        }
      },
      downloadFullDef () {
        if (this.tableready) {
          this.$emit('downloadfulldef')
        }
      },
      checkData () {
        if (this.sourceData) {
          this.$emit('getdata', this.sourceData)
        }
      }
    }
  }
</script>
<style lang="scss">
    .alpheios-result-grid__loader {
        border: 8px solid #eaf4fb;
        border-top: 8px solid #3498db;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        animation: spin 2s linear infinite;
        display: inline-block;
        vertical-align: middle;

        position: absolute;
        left:0; top:0; right:0; bottom: 0;
        margin: auto auto;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    #alpheios-result-grid__table {
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;

        tr:nth-child(even){background-color: #f2f2f2;}

        tr:hover {background-color: #ddd;}

        td, th {
          border: 1px solid #ddd;
            padding: 8px;
            vertical-align: top;
        }

        th {
            padding-top: 12px;
            padding-bottom: 12px;
            text-align: left;
            background-color: #3498db;
            color: white;
        }

        ul {
          list-style: inside;
          padding: 0;
          margin: 0;
        }
    }


    .alpheios-tests-results__grid__divider {
        background-color: #3498db;
        color: white;
    }

    .alpheios-tests-results__grid__empty {
      color: #dd0000;
    }

    .alpheios-tests-results__grid__fulldefs {
      max-height: 100px;
      overflow: hidden;
      margin-top: 25px;
    }

    .alpheios-tests-results__grid__fulldefs.showAll {
      max-height: none;
    }

    .alpheios-tests-results__grid__result {
      margin-top: 0;
      font-weight: bold;
    }

    .alpheios-tests-results__grid__showLink {
      display: block;
      margin: 5px 0 0;
      text-transform: lowercase;
      font-weight: bold;
    }

    .alpheios-result-grid__download_list {
      list-style: none;
      margin : 10px 0;
      padding: 0;

      li {
        display: inline-block;
        cursor: pointer;
        padding: 8px;
        background: #db7734;
        color: #fff;
        font-weight: bold;
        border-radius: 5px;
        margin-right: 10px;
        vertical-align: middle;

        -webkit-user-select: none; /* Safari 3.1+ */
        -moz-user-select: none; /* Firefox 2+ */
        -ms-user-select: none; /* IE 10+ */
        user-select: none; /* Standard syntax */
      }
    }

    li.alpheios-result-grid__download_list_disabled,
    button.alpheios-result-grid__download_list_disabled {
      cursor: default;
      background: #f0c8ad;
    }

    .alpheios-result-grid__upload_file {
      display: inline-block;
      cursor: pointer;
      padding: 10px;
      background: #db7734;
      color: #fff;
      font-weight: bold;
      border-radius: 5px;
      vertical-align: middle;
      border-width: 0;
    }

    .alpheios-result-grid__file_block input[type="file"] {
      display: none;
    }

	.alpheios-result-grid__file_block {
	  label {
		display: inline-block;
		background: #3498db;
	  	border-radius: 5px;
	  	color: #fff;
	  	text-align: center;
	  	padding: 8px 12px;
		cursor: pointer;
		vertical-align: middle;
	  }

	  span {
		font-weight:bold;
	  }
	}

	.alpheios-result-grid__file_name {
	  display: inline-block;
	  padding: 8px 12px;
	  margin: 0 12px;
	  vertical-align: middle;
	}

</style>