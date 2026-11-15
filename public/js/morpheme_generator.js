

// DOM elements
const languageSelector = document.getElementById("languageSelector")
const numSyllables = document.getElementById("numSyllables")
const morphemeDisplay = document.querySelector("#display h1")
const pronunciationDisplay = document.querySelector("#display h2")
const onsetLength = document.getElementById("onsetLength")
const codaLength = document.getElementById("codaLength")

// Startup calls
getLanguages()

// Functions
async function getLanguages(){
    const pull = await fetch(`/data?collection=languages`)
    if (!pull.ok) throw new Error ("Couldn't retrieve langauges")
    const langauges = await pull.json()
    langauges.forEach(languageOb => {
        const option = document.createElement("option")
        option.textContent = languageOb.language
        option.value = languageOb.language
        languageSelector.appendChild(option)
    })
}

async function generateSyllable(){
    // Display DOM items
    const language = languageSelector.value
    const number = numSyllables.value

    // Get all graphemes from a language
    let pull = await fetch(`/data?collection=graphemes&filter=language:${language}`)
    if (!pull.ok) throw new Error("Couldn't get graphemes")
    const graphemes = await pull.json()
    // Get orthography (is it alphabet or syllabary?)
    pull = await fetch(`/data?collection=orthography&filter=language:${language}`)
    if (!pull.ok) throw new Error("Couldn't get orthography")
    const orthography = await pull.json()
    // Get phonotactics (syllable structure)
    pull = await fetch(`/data?collection=phonotactics&filter=language:${language}`)
    if (!pull.ok) throw new Error("Couldn't get phonotactics")
    const phonotactics = await pull.json()

    let morpheme = ""
    let pronunciation = ""

    // Process differently based on the type of writing system
    switch (orthography[0].writing_system){
        
        // If it's a syllabary, I can use every grapheme available for a given morpheme
        case "syllabary":
            // Generate 1 syllable per parameter
            for (let index = 0; index<number; index++){
                let syllable = graphemes[randomNumber(0, graphemes.length-1)]
                morpheme = morpheme + syllable.grapheme
                pronunciation = pronunciation + "-" + syllable.pronunciation
            }
            break

        case "alphabet":
            // Need consonants, vowels, and clusters
            const consonants = []
            const vowels = []
            const clusters = []
            // Assign grapheme to proper array
            graphemes.forEach(graphemeOb => {
                switch (graphemeOb.function){
                    case "consonant":
                        consonants.push(graphemeOb)
                        break
                    case "vowel":
                        vowels.push(graphemeOb)
                        break
                    case "cluster":
                        clusters.push(graphemeOb)
                        break
                    default:
                        break
                }
            })
            // Generate 1 syllable per parameter
            for (let index = 0; index<number; index++){
                const [syllableLetters, syllablePronounce] = getSyllable(phonotactics[0], consonants, vowels, clusters)
                morpheme = morpheme + syllableLetters
                pronunciation = pronunciation + "-" + syllablePronounce
            }
            break

        default:
            break
    }

    morphemeDisplay.textContent = morpheme
    pronunciationDisplay.textContent = pronunciation.slice(1)
}

// Random number generater between two parameters INCLUSIVE
// (1, 4) => 1, 2, 3, 4
function randomNumber(min, max) {
    min = Number(min)
    max = Number(max)
    const result = Math.floor(Math.random() * (max - min + 1)) + min;
    return result
}

// Build a syllable for alphabets
function getSyllable(phonotactics, consonants, vowels, clusters){
    let letters = ""
    let pronunciation = ""
    
    const onsetChars = onsetLength.value == "" ? randomNumber(phonotactics.onset_min, phonotactics.onset_max) : onsetLength.value
    const codaChars = codaLength.value == "" ? randomNumber(phonotactics.coda_min, phonotactics.coda_max) : codaLength.value
    
        // Onset
    // Find proper cluster if onsetChars is over 1
    if (onsetChars > 1){
        let pull = clusters[randomNumber(0, clusters.length-1)]
        // Condition correcting
        while (pull.grapheme.length !== onsetChars && pull.prohibited_places.includes("onset")){
            pull = clusters[randomNumber(0, clusters.length-1)]
        }letters = letters + pull.grapheme
        pronunciation = pronunciation + pull.pronunciation.split("-").join("")
    }// Get consonant if just 1
    else if (onsetChars > 0) {
        let pull = consonants[randomNumber(0, consonants.length-1)]
        while (pull.prohibited_places.includes("onset")){
            pull = consonants[randomNumber(0, consonants.length-1)]
        }
        letters = letters + pull.grapheme
        pronunciation = pronunciation + pull.pronunciation
    }

        // Vowel
    const vowel = vowels[randomNumber(0, vowels.length-1)]
    letters = letters + vowel.grapheme
    pronunciation = pronunciation + vowel.pronunciation

        // Coda
    // Find proper cluster if codaChars is over 1
    if (codaChars > 1){
        let pull = clusters[randomNumber(0, clusters.length-1)]
        while (pull.grapheme.length !== codaChars && pull.prohibited_places.includes("coda")){
            pull = clusters[randomNumber(0, clusters.length-1)]
        }letters = letters + pull.grapheme
        pronunciation = pronunciation + pull.pronunciation.split("-").join("")
    }// Get consonant if just 1
    else if (codaChars > 0) {
        let pull = consonants[randomNumber(0, consonants.length-1)]
        while (pull.prohibited_places.includes("coda")){
            pull = consonants[randomNumber(0, consonants.length-1)]
        }
        letters = letters + pull.grapheme
        pronunciation = pronunciation + pull.pronunciation
    }

    return [letters, pronunciation]
}