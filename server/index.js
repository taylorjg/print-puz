const express = require('express')
const bodyParser = require('body-parser')
const mustacheExpress = require('mustache-express')
const path = require('path')
const axios = require('axios')
const puzzleUtils = require('./puzzleUtils')

const PORT = process.env.PORT || 3020
const staticFolder = path.join(__dirname, 'static')

const renderForm = (res, source, puzzleUrl, error) => {
  console.log(`[renderForm] source: ${source}; puzzleUrl: ${puzzleUrl}; error: ${error}`)
  res.render('form', {
    source,
    scrapeChecked: source === 'scrape',
    explicitChecked: source === 'explicit',
    puzzleUrl,
    error
  })
}

const getRoot = (_, res) => {
  console.log(`[getRoot] rendering form`)
  renderForm(res, 'scrape')
}

const postRoot = async (req, res) => {
  console.log(`[postRoot] source: ${req.body.source}; puzzleUrl: ${req.body.puzzleUrl}`)
  try {
    const source = req.body.source
    const puzzleUrl = source === 'scrape'
      ? await scrapePuzzleUrl()
      : req.body.puzzleUrl
    const bytes = await puzzleUtils.readPuzzleUrl(puzzleUrl)
    const puzzle = puzzleUtils.parsePuzzle(bytes)
    res.render('crossword', { puzzleUrl, puzzle })
  } catch (error) {
    console.log(`[postRoot] ERROR: ${error.message}`)
    renderForm(res, req.body.source, req.body.puzzleUrl, error)
  }
}

const scrapePuzzleUrl = async () => {
  const response = await axios.get('http://www.private-eye.co.uk/crossword')
  const data = response.data
  const regex = /(pictures\/crossword\/download\/[\d]+\.puz)/
  const match = regex.exec(data)
  const puzzleUrl = match
    ? `http://www.private-eye.co.uk/${match[1]}`
    : null
  console.log(`[scrapePuzzleUrl] puzzleUrl: ${puzzleUrl}`)
  return puzzleUrl
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
