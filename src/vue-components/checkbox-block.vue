<template>
	<label class="alpheios-checkbox_container">{{ label }}
		<input type="checkbox" v-model="inputVal">
		<span class="alpheios-checkbox_checkmark"></span>
	</label>
</template>
<script>
  export default {
    name: 'CheckboxBlock',
    props: {
      label: {
        type: String,
        required: false,
        default: ''
      },
      value: {
        type: Boolean,
        required: false,
        default: false
      }
    },
    data() {
      return { inputVal: this.value }
    },
    watch: {
      inputVal(val) {
        this.$emit('input', val)
      }
    }
  }
</script>
<style lang="scss">
.alpheios-checkbox_container {
  display: block;
  position: relative;
  padding-left: 25px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 16px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.alpheios-checkbox_container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

/* Create a custom checkbox */
.alpheios-checkbox_checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: #eee;
}

/* On mouse-over, add a grey background color */
.alpheios-checkbox_container:hover input ~ .alpheios-checkbox_checkmark {
  background-color: #ccc;
}

/* When the checkbox is checked, add a blue background */
.alpheios-checkbox_container input:checked ~ .alpheios-checkbox_checkmark {
  background-color: #2196F3;
}

/* Create the checkmark/indicator (hidden when not checked) */
.alpheios-checkbox_checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.alpheios-checkbox_container input:checked ~ .alpheios-checkbox_checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.alpheios-checkbox_container .alpheios-checkbox_checkmark:after {
  left: 6px;
  top: 3px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
</style>