const express = require('express')
const bodyParser = require('body-parser')
const mustacheExpress = require('mustache-express')
const path = require('path')
const puzzleUtils = require('./puzzleUtils')

const PORT = process.env.PORT || 3020

const page1 = (req, res) => {
  res.render('page1')
}

const page2 = async (req, res) => {
  const puzzleUrl = req.body.puzzleUrl
  const bytes = await puzzleUtils.readPuzzleUrl(puzzleUrl)
  const puzzle = puzzleUtils.parsePuzzle(bytes)
  puzzle.acrossClues = puzzle.clues.slice(0, puzzle.clues.length / 2)
  puzzle.downClues = puzzle.clues.slice(puzzle.clues.length / 2)
  puzzle.acrossClues = puzzle.acrossClues.map((clue, index) => ({ clue, number: index + 1}))
  puzzle.downClues = puzzle.downClues.map((clue, index) => ({ clue, number: index + 1}))
  res.render('page2', { puzzleUrl, puzzle })
}

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.engine('html', mustacheExpress())
app.set('view engine', 'html')
app.set('views', path.join(__dirname, 'views'))
app.get('/page1.html', page1)
app.post('/page2.html', page2)
app.use('/', express.static(path.join(__dirname, 'static')))
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
