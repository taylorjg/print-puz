const scrapeRadioButton = document.getElementById('scrapeRadioButton')
const explicitRadioButton = document.getElementById('explicitRadioButton')
const puzzleUrlField = document.getElementById('puzzleUrlField')

const initialisePuzzleUrlField = () => {
  const source = scrapeRadioButton.checked
    ? scrapeRadioButton.value
    : explicitRadioButton.value
  updatePuzzleUrlField(source)
}

const updatePuzzleUrlField = source => {
  puzzleUrlField.style.display = source === scrapeRadioButton.value ? 'none' : ''
}

const onRadioButtonChange = e => {
  const source = e.target.value
  updatePuzzleUrlField(source)
}

scrapeRadioButton.addEventListener('change', onRadioButtonChange)
explicitRadioButton.addEventListener('change', onRadioButtonChange)

initialisePuzzleUrlField()
