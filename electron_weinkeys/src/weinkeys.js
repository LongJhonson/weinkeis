const q = (selector) => document.querySelector(selector)

const text_div = q('#text')
const input = q('#inputText')
const timer_display = q('#timerText')
const score_display = q('#scoreText')
const position_display = q('#positionText')
const error_display = q('#errorText')
const audio_control = q('#audio_control')
const mute_line_1 = q('#mute_line_1')
const mute_line_2 = q('#mute_line_2')

//init
input.value = ''
input.focus()

const api_url = 'https://baconipsum.com/api/?type=meat-and-filler'

//audio
const key_sound = q('#myAudio')
let muted

let actual_position = 0
let text = ''
let buffer = []
let timer = 0
let timer_started = false
let errors = 0

console.log('api_url', api_url)

const setMutedState = () => {
  let storage = localStorage.getItem('muted')
  if (storage == 'true') {
    muted = true
    mute_line_1.classList.remove('mute_line')
    mute_line_2.classList.remove('mute_line')
  } else {
    muted = false
    mute_line_1.classList.add('mute_line')
    mute_line_2.classList.add('mute_line')
  }
}

;(async () => {
  setMutedState()
  const response = await fetch(api_url)
  const data = await response.json()
  console.log('data', data[0].split(''))
  text = data[0].split('')
  const p = document.createElement('p')
  let offset = 0
  //search in the array for the double spaces and remove one of them
  text = text.filter((letter, index) => {
    if (letter === ' ' && text[index + 1] === ' ') {
      return false
    }
    return true
  })
  text.forEach((letter, index) => {
    const span = document.createElement('span')
    span.innerHTML = letter
    span.style.setProperty('id', `letter${index}`)
    span.classList.add(`letter${index}`)
    p.appendChild(span)
  })
  text_div.appendChild(p)
  console.log('text', text[0])
})()

function refreshDisplay() {
  //calculate score based words per minute
  let score = actual_position / 5
  score_display.innerHTML = `Score: ${score}`
  position_display.innerHTML = `Position: ${actual_position}`
  error_display.innerHTML = `Errors: ${errors}`

  let minutes = Math.floor(timer / 60)
  let seconds = timer % 60
  if (minutes < 10) minutes = '0' + minutes
  if (seconds < 10) seconds = '0' + seconds
  timer_display.innerHTML = `Timer: ${minutes}:${seconds}`
  timer++
}

function timerStart() {
  timer = setInterval(() => {
    refreshDisplay()
  }, 1000)
}

const ignoreKeys = ['Shift', 'Alt', 'Control', 'Meta', 'AltGraph']

window.addEventListener('keydown', (e) => {
  console.log('e.key', e.key)

  if (ignoreKeys.includes(e.key)) return
  if (e.key === 'Backspace') {
    console.log('Entra backspace')
    if (actual_position === 0) return
    actual_position--
    document.querySelector(`.letter${actual_position}`).classList.remove('finished')
    document.querySelector(`.letter${actual_position}`).classList.remove('wrong')
    if (text[actual_position] === ' ') {
      let last = buffer.pop()
      input.value = last
    }
    return
  }
  if (e.key === text[actual_position]) {
    if (e.key === ' ') {
      buffer.push(input.value + ' ')
      input.value = ''
    }
    !muted && key_sound.play()
    console.log('actual_position', actual_position)
    document.querySelector(`.letter${actual_position}`).classList.add('finished')
  } else {
    document.querySelector(`.letter${actual_position}`).classList.add('wrong')
    !muted && key_sound.play()
    console.log('wrong')
    errors++
  }
  actual_position++
  if (timer_started === false) {
    timerStart()
    timer_started = true
  }
})

window.addEventListener('keyup', (e) => {
  key_sound.pause()
  key_sound.currentTime = 0
})

audio_control.addEventListener('click', (e) => {
  if (muted) {
    muted = false
    mute_line_1.classList.add('mute_line')
    mute_line_2.classList.add('mute_line')
    localStorage.setItem('muted', false)
    input.focus()
  } else {
    muted = true
    mute_line_1.classList.remove('mute_line')
    mute_line_2.classList.remove('mute_line')
    localStorage.setItem('muted', true)
    input.focus()
  }
})
