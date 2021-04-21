const basemode = [
  ['osu', 'std', 'standard'],
  ['taiko'],
  ['fruits', 'catch the beat', 'ctb'],
  ['mania', 'piano']
]

function translate (mode, from, to) {
  if (!mode || !from || !to) { return null }

  if (to === 'numerical') { return basemode.findIndex(m => m.find(modeName => modeName === mode)) }
  if (to === 'ppv2') { return basemode[mode][0] }
}

class Translator {
  mode (mode) {
    return translate(mode, this.from, this.to)
  }

  from (type) {
    this.from = type
    return this
  }

  to (type) {
    this.to = type
    return this
  }
}

module.exports = Translator
