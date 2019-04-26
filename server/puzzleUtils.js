const axios = require('axios')
const R = require('ramda')

const readPuzzle = async puzzleUrl => {
  const config = { responseType: 'arraybuffer' }
  const response = await axios.get(puzzleUrl, config)
  return response.data
}

const parsePuzzle = bytes => {
  const width = Number(bytes[0x2c])
  const height = Number(bytes[0x2d])
  const clueCount = Number(bytes[0x2e])
  const gridOffset = 0x34
  const gridSize = width * height
  const grid = parseGrid(bytes, gridOffset, width, height)
  const stringsOffset = gridOffset + gridSize + gridSize
  const strings = parseStrings(bytes, stringsOffset, clueCount)
  return {
    width,
    height,
    grid,
    title: strings[0],
    author: strings[1],
    copyright: strings[2],
    clues: strings.slice(3)
  }
}

const parseGrid = (bytes, gridOffset, width, height) => {
  const slice = bytes.slice(gridOffset, gridOffset + width * height)
  const string = Buffer.from(slice).toString()
  return R.splitEvery(width, string)
}

const parseStrings = (bytes, stringsOffset, clueCount) => {
  const indices = Array.from(Array(3 + clueCount).keys())
  const seed = {
    strings: [],
    offset: stringsOffset
  }
  const finalAcc = indices.reduce(acc => {
    const newOffset = bytes.indexOf(0, acc.offset)
    if (newOffset < 0) {
      console.dir(`Expected to find a nul but didn't.`)
      return acc
    }      
    const slice = bytes.slice(acc.offset, newOffset)
    const string = Buffer.from(slice).toString('utf8')
    return {
      strings: [...acc.strings, string],
      offset: newOffset + 1
    }
  }, seed)
  return finalAcc.strings
}

module.exports = {
  readPuzzle,
  parsePuzzle
}
