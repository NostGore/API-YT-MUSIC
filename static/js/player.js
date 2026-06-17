const $ = id => document.getElementById(id)
const searchInput = $('searchInput')
const clearBtn = $('clearBtn')
const resultsDiv = $('results')
const statusDiv = $('status')
const resultsLabel = $('resultsLabel')
const player = $('player')
const audio = $('audio')
const pThumb = $('pThumb')
const pTitle = $('pTitle')
const pArtist = $('pArtist')
const btnPlay = $('btnPlay')
const btnPrev = $('btnPrev')
const btnNext = $('btnNext')
const btnMute = $('btnMute')
const seek = $('seek')
const volumeRange = $('volumeRange')
const currentTime = $('currentTime')
const totalTime = $('totalTime')
const pClose = $('pClose')

let currentId = null
let results = []

/* Search */
searchInput.addEventListener('input', () => {
  clearBtn.classList.toggle('show', searchInput.value.length > 0)
})
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') search() })
clearBtn.addEventListener('click', () => { searchInput.value = ''; clearBtn.classList.remove('show'); searchInput.focus() })

async function search() {
  const q = searchInput.value.trim()
  if (!q) return
  resultsLabel.style.display = 'none'
  statusDiv.innerHTML = '<div class="spinner"></div><div class="loading-text">Buscando...</div>'
  resultsDiv.innerHTML = ''
  try {
    const r = await fetch('/api/search?q=' + encodeURIComponent(q))
    const data = await r.json()
    if (!data.results || data.results.length === 0) {
      statusDiv.innerHTML = '<div class="empty-icon">&#128269;</div><div class="empty-text">Sin resultados para <strong>' + esc(q) + '</strong></div>'
      return
    }
    results = data.results
    statusDiv.innerHTML = ''
    resultsLabel.style.display = 'block'
    resultsDiv.innerHTML = results.map((song,i) => `
      <div class="result-item${song.id === currentId ? ' active' : ''}" onclick="play(${i})" data-idx="${i}">
        <div class="thumb-wrap">
          <img src="${song.thumb || ''}" alt="" loading="lazy">
          <div class="play-indicator"><i class="fas fa-play fa-lg"></i></div>
        </div>
        <div class="info">
          <div class="title">${esc(song.title)}</div>
          <div class="sub">${esc(song.artist)}${song.album ? '<span class="dot">&#183;</span>' + esc(song.album) : ''}</div>
        </div>
        <div class="dur">${song.duration || ''}</div>
      </div>
    `).join('')
    /* precache stream URLs in background */
    fetch('/api/prefetch?ids=' + results.map(s => s.id).join(','))
  } catch(e) {
    statusDiv.innerHTML = '<div class="empty-icon">&#9888;</div><div class="empty-text">Error de conexi&oacute;n</div>'
  }
}

/* Play */
let loading = false
async function play(idx) {
  if (loading) return
  const el = document.querySelector('.result-item[data-idx="' + idx + '"]')
  if (!el) return
  el.classList.add('loading')
  loading = true
  const song = results[idx]
  try {
    const r = await fetch('/api/stream?videoId=' + encodeURIComponent(song.id))
    const data = await r.json()
    if (data.error) {
      statusDiv.innerHTML = '<div class="empty-icon">&#9888;</div><div class="empty-text">' + esc(data.error) + '</div>'
      el.classList.remove('loading'); loading = false; return
    }
    statusDiv.innerHTML = ''
    audio.src = data.url
    audio.play()
    currentId = song.id
    pTitle.textContent = data.title || song.title
    pArtist.textContent = song.artist || ''
    pThumb.src = song.thumb || ''
    player.classList.add('show')
    document.querySelectorAll('.result-item').forEach(e => e.classList.remove('active'))
    el.classList.remove('loading')
    el.classList.add('active')
    loading = false
  } catch(e) {
    el.classList.remove('loading'); loading = false
    statusDiv.innerHTML = '<div class="empty-icon">&#9888;</div><div class="empty-text">Error al reproducir</div>'
  }
}

/* Player Controls */
btnPlay.addEventListener('click', () => {
  if (audio.paused) { audio.play() } else { audio.pause() }
})

audio.addEventListener('play', () => {
  btnPlay.innerHTML = '<i class="fas fa-pause"></i>'
  btnPlay.style.fontSize = ''
})
audio.addEventListener('pause', () => {
  btnPlay.innerHTML = '<i class="fas fa-play"></i>'
  btnPlay.style.fontSize = ''
})
audio.addEventListener('ended', () => {
  playNext()
})

function updateSeek() {
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0
  seek.value = pct
  seek.style.setProperty('--pct', pct + '%')
  currentTime.textContent = fmt(audio.currentTime)
}
audio.addEventListener('timeupdate', updateSeek)
audio.addEventListener('loadedmetadata', () => {
  totalTime.textContent = fmt(audio.duration)
  currentTime.textContent = '0:00'
  seek.value = 0
  seek.style.setProperty('--pct', '0%')
})

seek.addEventListener('input', () => {
  if (!audio.duration) return
  const pct = seek.value
  seek.style.setProperty('--pct', pct + '%')
  audio.currentTime = (pct / 100) * audio.duration
})

volumeRange.addEventListener('input', () => {
  audio.volume = volumeRange.value
  btnMute.innerHTML = audio.volume === 0 ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>'
})
btnMute.addEventListener('click', () => {
  if (audio.volume > 0) { audio.volume = 0; volumeRange.value = 0; btnMute.innerHTML = '<i class="fas fa-volume-mute"></i>' }
  else { audio.volume = 0.7; volumeRange.value = 0.7; btnMute.innerHTML = '<i class="fas fa-volume-up"></i>' }
})

function playNext() {
  const idx = results.findIndex(s => s.id === currentId)
  if (idx >= 0 && idx < results.length - 1) play(idx + 1)
  else play(0)
}
function playPrev() {
  const idx = results.findIndex(s => s.id === currentId)
  if (idx > 0) play(idx - 1)
  else play(results.length - 1)
}
btnNext.addEventListener('click', playNext)
btnPrev.addEventListener('click', playPrev)

pClose.addEventListener('click', () => {
  audio.pause(); audio.src = ''; player.classList.remove('show'); currentId = null
  document.querySelectorAll('.result-item').forEach(el => el.classList.remove('active'))
})

/* Keyboard shortcuts */
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return
  if (e.code === 'Space') { e.preventDefault(); if (player.classList.contains('show')) btnPlay.click() }
})

/* Helpers */
function fmt(s) {
  if (!s || !isFinite(s)) return '0:00'
  const m = Math.floor(s / 60), sec = Math.floor(s % 60)
  return m + ':' + (sec < 10 ? '0' : '') + sec
}
function esc(s) {
  const d = document.createElement('div')
  d.textContent = s || ''; return d.innerHTML
}
