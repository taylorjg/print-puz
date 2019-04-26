const express = require('express')
const mustacheExpress = require('mustache-express')
const path = require('path')

const PORT = process.env.PORT || 3020

const page1 = (req, res) => {
  res.render('page1')
}

const page2 = (req, res) => {
  res.render('page2')
}

const app = express()
app.engine('html', mustacheExpress())
app.set('view engine', 'html')
app.set('views', path.join(__dirname, 'views'))
app.get('/page1.html', page1)
app.post('/page2.html', page2)
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
