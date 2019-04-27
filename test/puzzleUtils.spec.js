const path = require('path')
const expect = require('chai').expect
const puzzleUtils = require('../server/puzzleUtils')

describe('puzzleUtils tests', () => {
  it('correctly parses a Private Eye .puz file', async () => {
    const fileName = path.join(__dirname, '649.puz')
    const bytes = await puzzleUtils.readPuzzleFile(fileName)
    const puzzle = puzzleUtils.parsePuzzle(bytes)
    expect(puzzle.title).to.equal('Eye 649/1494')
    expect(puzzle.author).to.equal('Cyclops')
    expect(puzzle.squares).to.have.length(15)
    expect(puzzle.squares[0]).to.have.length(15)
    expect(puzzle.acrossClues).to.have.length(14)
    expect(puzzle.downClues).to.have.length(13)
  })
})
