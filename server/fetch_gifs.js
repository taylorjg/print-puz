const axios = require('axios')
const path = require('path')
const fs = require('fs').promises
const R = require('ramda')

const fetchGif = async gif => {
  const config = { responseType: 'arraybuffer' }
  const url = `https://puzzles.telegraph.co.uk/_admin/printing/images/${gif}`
  console.log(`fetching ${url}`)
  const response = await axios.get(url, config)
  const data = response.data
  const fileName = path.join(__dirname, 'static', gif)
  console.log(`writing ${url}`)
  await fs.writeFile(fileName, data)
}

const main = async () => {
  await fetchGif('black_cell.gif')
  await fetchGif('white_cell.gif')
  await fetchGif('white_cell2.gif')
  await fetchGif('white_cell3.gif')
  await fetchGif('white_cell4.gif')
  const numbers = R.range(1, 41)
  for (const number of numbers) {
    await fetchGif(`${number}_number.gif`)
    await fetchGif(`${number}_number2.gif`)
    await fetchGif(`${number}_number3.gif`)
    await fetchGif(`${number}_number4.gif`)
  }
}

main()
