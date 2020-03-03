import './css/style.scss';

const genius_base_url = 'https://api.genius.com/search?q='
const genius_access_token = 'Nm6awKCVDYtu3iqesrN70oCIKGFP0x9NxDcdsGZ9O_wCPTPPjw1xtS1SwLRadMJ_'
// const btn = document.querySelector('.btn')
const input = document.querySelector('.search__input')
const spinner = document.querySelector('.search__spinner')
const resultsElement = document.querySelector('.results__results')

// SpeechRecognition is a global variable that lives in the browser.
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

const recognition = new window.SpeechRecognition()
// interminResults are results that are not yet final, meaning isFinal property is false. Will return all matches as they come in
recognition.interimResults = true
recognition.start()

// Function to run when speech result is returned
const onSpeak = e => {
	// SpeechRecognitionResultList is an object with deep properties. First property is 0, which contains isFinal and another 0 property. That second 0 property contains transcript and confidence. As you speak, there will be a flood of SpeechRecognitionResultLists firing off.
	const results = Array.from(e.results)
	// console.log(results)

	const transcript = results.map(result => result[0]).map(result => result.transcript)
	const confidence = Math.floor(results[0][0].confidence * 100)
	// console.log(`Confidence is ${confidence}`)
	input.value = transcript
	// console.log(transcript)

	spinner.classList.add('visible')
	if (results[0].isFinal) {
		setTimeout(() => {
			spinner.classList.remove('visible')
			initiateSeach(transcript)

		}, 1000)
	}
}

// You're gonna need to rewrite this to allow for both manual search and verbal search
const initiateSeach = async (phrase) => {
	// const userInput = input.value
	const searchResults = await searchLyric(phrase)
	renderResults(searchResults)
}

const searchLyric = async (searchTerm) => {
	try {
		const res = await fetch(`${genius_base_url}${searchTerm}&access_token=${genius_access_token}`)
		const data = await res.json()
		if (data.response.hits.length === 0) {
			noLyricsFound()
		}
		else {
			const hits = data.response.hits.map(hit => {
				const { title_with_featured, header_image_thumbnail_url } = hit.result
				const artist = hit.result.primary_artist.name
				return { title: title_with_featured, artist, img: header_image_thumbnail_url }
			})
			return hits
		}
	}
	catch (error) {
		throw error
	}
}

const renderResults = results => {
	resultsElement.innerHTML = ""
	results.forEach(result => {
		renderSong(result)
	})
}

const renderSong = song => {
	const markup = `
		<div class="results__card">
			<img src="${song.img}" alt="${song.title} Image" class="results__card--img">
			<div class="results__card--content">
				<h3 class="results__card--title" title="${song.title}">${limitSongTitle(song.title)}</h3>
				<h3 class="results__card--artist" title="${song.artist}">By ${limitSongTitle(song.artist)}</h3>
				<div class="results__card--icons">
					<a href="https://www.youtube.com/results?search_query=${song.title} by ${song.artist}" target="_blank">
						<img src="./assets/youtube-logo.svg" alt="" class="results__card--logo">
					</a>
					<a href="https://open.spotify.com/search/${song.title} ${song.artist}" target="_blank">
						<img src="./assets/spotify-logo.svg" alt="" class="results__card--logo">
					</a>
				</div>
			</div>
		</div>
	`
	resultsElement.insertAdjacentHTML('beforeend', markup)
}

const limitSongTitle = (title, limit = 20) => {
	const newTitle = []
	if (title.length > limit) {
		title.split(' ').reduce((acc, cur) => {
			if (acc + cur.length <= limit) {
				newTitle.push(cur)
			}
			return acc + cur.length
		}, 0)
		return `${newTitle.join(' ')}...`
	}
	return title
}

// btn.addEventListener('click', initiateSeach)
recognition.addEventListener('result', onSpeak)
// After user stops speaking, recognition will end. This will restart it on the 'end' event
recognition.addEventListener('end', recognition.start) 

console.log('App is running...')