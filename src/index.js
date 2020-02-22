// import { hello, tes } from './js/import-example';

import './css/style.scss';

const genius_base_url = 'https://api.genius.com/search?q='
const genius_access_token = 'Nm6awKCVDYtu3iqesrN70oCIKGFP0x9NxDcdsGZ9O_wCPTPPjw1xtS1SwLRadMJ_'
const btn = document.querySelector('.btn')
const input = document.querySelector('.input')

// SpeechRecognition is a global variable that lives in the browser. Also need to provide OR for compatibility 
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new window.SpeechRecognition();
recognition.continuous = true
recognition.start();
recognition.addEventListener('result', onSpeak)

function onSpeak(e) {
	const msg = e.results[0][0].transcript;
	initiateSeach(msg)
}

const searchLyric = async (searchTerm) => {
	try {
		const res = await fetch(`${genius_base_url}${searchTerm}&access_token=${genius_access_token}`)
		const data = await res.json()
		console.log(data)
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

// You're gonna need to rewrite this to allow for both manual search and verbal search
const initiateSeach = async (phrase) => {
	// const userInput = input.value
	const searchResults = await searchLyric(phrase)
	console.log(searchResults)
}

btn.addEventListener('click', initiateSeach)