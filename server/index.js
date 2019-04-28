const express = require('express')
const bodyParser = require('body-parser')
const mustacheExpress = require('mustache-express')
const path = require('path')
const puzzleUtils = require('./puzzleUtils')

const PORT = process.env.PORT || 3020
const staticFolder = path.join(__dirname, 'static')

const renderForm = (res, error) => {
  res.render('form', { error })
}

const getRoot = (_, res) => {
  console.log(`[GET /] rendering form`)
  renderForm(res)
}

const postRoot = async (req, res) => {
  try {
    const puzzleUrl = req.body.puzzleUrl
    console.log(`[POST /] rendering crossword - puzzleUrl: ${puzzleUrl}`)
    const bytes = await puzzleUtils.readPuzzleUrl(puzzleUrl)
    const puzzle = puzzleUtils.parsePuzzle(bytes)
    res.render('crossword', { puzzleUrl, puzzle })
  } catch (error) {
    console.log(`[POST /] ERROR: ${error.message}`)
    renderForm(res, error)
  }
}

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.engine('html', mustacheExpress())
app.set('view engine', 'html')
app.set('views', path.join(__dirname, 'views'))
app.get('/', getRoot)
app.post('/', postRoot)
app.use(express.static(staticFolder))
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
