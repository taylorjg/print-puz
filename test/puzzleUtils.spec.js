const path = require('path')
const expect = require('chai').expect
const puzzleUtils = require('../server/puzzleUtils')

describe('puzzleUtils tests', () => {

  const SAMPLE_PUZZLE = path.join(__dirname, '649.puz')

  it('correctly parses a Private Eye .puz file', async () => {
    const bytes = await puzzleUtils.readPuzzleFile(SAMPLE_PUZZLE)
    const puzzle = puzzleUtils.parsePuzzle(bytes)
    expect(puzzle.title).to.equal('Eye 649/1494')
    expect(puzzle.author).to.equal('Cyclops')
    expect(puzzle.squares).to.have.length(15)
    expect(puzzle.squares[0]).to.have.length(15)
    expect(puzzle.acrossClues).to.have.length(14)
    expect(puzzle.downClues).to.have.length(13)
  })

  it('correctly partitions across clues', async () => {
    const expected = [
      { number: 1, clue: `Love and the endless need (6)` },
      { number: 4, clue: `Dim as Corbyn and his team (7)` },
      { number: 8, clue: `Loaded travellers' definitive black plonk (3,3,3)` },
      { number: 10, clue: `(& 15dn.) One's who obsessed - with not passing motions? (4)` },
      { number: 11, clue: `(& 22ac.) Press finished? Make the troubles go away! (6)` },
      { number: 12, clue: `Plonker husband in grand dress (8)` },
      { number: 13, clue: `A foreign leader surrounded by useless bastards, uh? That would be stupid! (4,2,1,5)` },
      { number: 17, clue: `Frantic calls from Tom: "Tory party is also torn apart - what's that to Jeremy?" (5,7)` },
      { number: 19, clue: `Executed in USA over Zen activity - utterly mad (8)` },
      { number: 21, clue: `Sketch showing Trump colleague almost inadvertently leaking sources (6)` },
      { number: 22, clue: `see 11ac. (4)` },
      { number: 23, clue: `Organ has zero protection when love goes "Close shave?" (4,5)` },
      { number: 24, clue: `Fight contrived by western leader: "all others against the French!" (7)` },
      { number: 25, clue: `One who's affected when Europe's broken up, with no end of trouble (6)` }
    ]
    const bytes = await puzzleUtils.readPuzzleFile(SAMPLE_PUZZLE)
    const puzzle = puzzleUtils.parsePuzzle(bytes)
    expect(puzzle.acrossClues).to.deep.equal(expected)
  })

  it('correctly partitions down clues', async () => {
    const expected = [
      { number: 1, clue: `Party stalemate, without May's lead, is to be confined (2,4)` },
      { number: 2, clue: `As Kenneth Williams bade Eno (I'd allow, to some extent) (9)` },
      { number: 3, clue: `Force alien into the 'camp' (5)` },
      { number: 5, clue: `It's very controversial, Lancashire offering a Tory 50% off (3,6)` },
      { number: 6, clue: `see 21dn. (5)` },
      { number: 7, clue: `Wake in an excited state, wanting head - and failing (8)` },
      { number: 9, clue: `Party aimed to reform - giving a collective voice for right-wing bigots? (6,5)` },
      { number: 14, clue: `Court with independent, outspoken heads crushed by ultimate in fake news description (9)` },
      { number: 15, clue: `see 10ac. (9)` },
      { number: 16, clue: `Apprentice politician in Ireland 'terminated' (8)` },
      { number: 18, clue: `Underwear that is to be removed - don't rush (6)` },
      { number: 20, clue: `Prats getting Blair finally to appear in Loose Ends (5)` },
      { number: 21, clue: `(& 6dn.) Wasted, stupid pot head - tut! (3,2)` }
    ]
    const bytes = await puzzleUtils.readPuzzleFile(SAMPLE_PUZZLE)
    const puzzle = puzzleUtils.parsePuzzle(bytes)
    expect(puzzle.downClues).to.deep.equal(expected)
  })
})
