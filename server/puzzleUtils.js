const axios = require('axios')
const R = require('ramda')

const readPuzzleUrl = async puzzleUrl => {
  const config = { responseType: 'arraybuffer' }
  const response = await axios.get(puzzleUrl, config)
  return response.data
}

const parsePuzzle = bytes => {
  const buffer = Buffer.from(bytes)
  const width = buffer.readUInt8(0x2c)
  const height = buffer.readUInt8(0x2d)
  const clueCount = buffer.readUInt16LE(0x2e)
  const gridOffset = 0x34
  const gridSize = width * height
  const grid = parseGrid(bytes, gridOffset, width, height)
  const squares = calculateSquareDetails(grid)
  const stringsOffset = gridOffset + gridSize + gridSize
  const strings = parseStrings(bytes, stringsOffset, clueCount)
  return {
    squares,
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

const NUL = 0

const parseStrings = (bytes, stringsOffset, clueCount) => {
  const indices = Array.from(Array(3 + clueCount).keys())
  const seed = {
    strings: [],
    offset: stringsOffset
  }
  const finalAcc = indices.reduce(acc => {
    const newOffset = bytes.indexOf(NUL, acc.offset)
    if (newOffset < 0) {
      console.dir(`Expected to find a NUL but didn't.`)
      return acc
    }
    const slice = bytes.slice(acc.offset, newOffset).map(convertEnDashToHyphenMinus)
    const string = Buffer.from(slice).toString()
    return {
      strings: [...acc.strings, string],
      offset: newOffset + 1
    }
  }, seed)
  return finalAcc.strings
}

const EN_DASH = 0x96
const HYPHEN_MINUS = 0x2d

// I'm not sure what encoding the .puz file is in (Windows-1250 ?)
// but there are several occurrences of 0x96 which I think is meant
// to be EN DASH. However, they seem to come out funny so I am
// converting them to ASCII 0x2d.
const convertEnDashToHyphenMinus = ch => ch === EN_DASH ? HYPHEN_MINUS : ch

const calculateSquareDetails = rows => {

  const DOT = '.'
  const BLACK_SQUARE = 'B'
  const WHITE_SQUARE = 'W'
  const LAST_ROW_INDEX = rows.length - 1
  const LAST_COL_INDEX = rows[0].length - 1

  const isBlackSquare = (rowIndex, colIndex) =>
    rowIndex < 0 || rowIndex > LAST_ROW_INDEX ||
    colIndex < 0 || colIndex > LAST_COL_INDEX ||
    rows[rowIndex][colIndex] === DOT

  let currentClueNumber = 1

  return rows.map((row, rowIndex) => {
    const cols = row.split('')
    return cols.map((col, colIndex) => {
      const leftIsBlackSquare = isBlackSquare(rowIndex, colIndex - 1)
      const rightIsBlackSquare = isBlackSquare(rowIndex, colIndex + 1)
      const aboveIsBlackSquare = isBlackSquare(rowIndex - 1, colIndex)
      const belowIsBlackSquare = isBlackSquare(rowIndex + 1, colIndex)
      const type = col === DOT ? BLACK_SQUARE : WHITE_SQUARE
      const acrossClue = leftIsBlackSquare && !rightIsBlackSquare ? true : undefined
      const downClue = aboveIsBlackSquare && !belowIsBlackSquare ? true : undefined
      const number = type == WHITE_SQUARE && (acrossClue || downClue) ?
        currentClueNumber++
        : undefined
      const imageSrc = () => {
        if (type === BLACK_SQUARE) return 'black_cell.gif'
        if (number) return `${number}_number.gif`
        return 'white_cell.gif'
      }
      return {
        type,
        number,
        acrossClue,
        downClue,
        imageSrc
      }
    })
  })
}

module.exports = {
  readPuzzleUrl,
  parsePuzzle
}
