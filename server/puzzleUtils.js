const axios = require('axios')
const R = require('ramda')
const fs = require('fs').promises

const readPuzzleFile = fileName => fs.readFile(fileName)

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
  const title = strings[0]
  const author = strings[1]
  const copyright = strings[2]
  const clues = strings.slice(3)
  const { acrossClues, downClues } = partitionClues(clues, squares)
  return {
    squares,
    title,
    author,
    copyright,
    acrossClues,
    downClues
  }
}

const parseGrid = (bytes, gridOffset, width, height) => {
  const slice = bytes.slice(gridOffset, gridOffset + width * height)
  const string = Buffer.from(slice).toString()
  return R.splitEvery(width, string)
}

const NUL = 0

const parseStrings = (bytes, stringsOffset, clueCount) => {
  const indices = R.range(0, 3 + clueCount)
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
      const suffix = () => {
        if (rowIndex === LAST_ROW_INDEX && colIndex === LAST_COL_INDEX) return 4
        if (colIndex === LAST_COL_INDEX) return 3
        if (rowIndex === LAST_ROW_INDEX) return 2
        return ''
      }
      const leftIsBlackSquare = isBlackSquare(rowIndex, colIndex - 1)
      const rightIsBlackSquare = isBlackSquare(rowIndex, colIndex + 1)
      const aboveIsBlackSquare = isBlackSquare(rowIndex - 1, colIndex)
      const belowIsBlackSquare = isBlackSquare(rowIndex + 1, colIndex)
      const type = col === DOT ? BLACK_SQUARE : WHITE_SQUARE
      const maybeAcrossClue = leftIsBlackSquare && !rightIsBlackSquare ? { acrossClue: true } : undefined
      const maybeDownClue = aboveIsBlackSquare && !belowIsBlackSquare ? { downClue: true } : undefined
      const maybeNumber = type == WHITE_SQUARE && (maybeAcrossClue || maybeDownClue)
        ? { number: currentClueNumber++ }
        : undefined
      const imageSrc = () => {
        if (type === BLACK_SQUARE) return 'black_cell.gif'
        if (maybeNumber) return `${maybeNumber.number}_number${suffix()}.gif`
        return `white_cell${suffix()}.gif`
      }
      return {
        type,
        ...maybeNumber,
        ...maybeAcrossClue,
        ...maybeDownClue,
        imageSrc
      }
    })
  })
}

const partitionClues = (clues, squares) => {
  const numberedSquares = R.unnest(
    squares.map(row => row.filter(col => col.number))
  )
  const seed = {
    clueIndex: 0,
    acrossClues: [],
    downClues: []
  }
  return numberedSquares.reduce((acc, numberedSquare) => {
    const acrossClues = numberedSquare.acrossClue
      ? [{
        number: numberedSquare.number,
        clue: clues[acc.clueIndex]
      }]
      : []
    const downClues = numberedSquare.downClue
      ? [{
        number: numberedSquare.number,
        clue: clues[acc.clueIndex + acrossClues.length]
      }]
      : []
    return {
      clueIndex: acc.clueIndex + acrossClues.length + downClues.length,
      acrossClues: [...acc.acrossClues, ...acrossClues],
      downClues: [...acc.downClues, ...downClues]
    }
  }, seed)
}

module.exports = {
  readPuzzleFile,
  readPuzzleUrl,
  parsePuzzle
}
