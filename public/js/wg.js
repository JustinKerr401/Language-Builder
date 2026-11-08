

// Variables
const wordDisplay = document.getElementById("wordDisplay")
const pronunciationDisplay = document.getElementById("pronunciationDisplay")
const selector = document.getElementById("selector")
const apc = document.getElementById("apc")
const syllableNumber = document.getElementById("syllableNumber")

// Startup functions
getLanguages()

// ------------------------------ Functions ------------------------------

async function getLanguages(){
    // Get list of languages (keys)
    const getKeys = await fetch(`/data?collection=languages&fields=language`)
    if (!getKeys.ok) throw new Error(`Failed to fetch list of languages`)
    const collectionItems = await getKeys.json()
    // Put all those keys into an array and sort the array
    let list = []
    collectionItems.forEach(value => {
        list.push(value.language)
        if (value.parent !== "") list.push(value.parent)
    })
    // Sort the data alphabetically and remove duplicates (parent languages)
    list.sort()
    const fixedList = [...new Set(list)]
    fixedList.forEach(key => {
        const option = document.createElement("option")
        option.value = key
        option.textContent = key
        selector.appendChild(option)
    })
}

async function generateWord(){
    // Step 1: Figure out this language's writing system
    const language = selector.value
    let pull = await fetch (`/data?collection=languages&fields=writing_system&filter=language:${language}`)
    if (!pull.ok) throw new Error(`Couldn't get ${language}'s writing system`)
    let pullJson = await pull.json()
    let randomWord = ""
    let pronunciationString = ""
    const writingSystem = pullJson[0].writing_system
    // Step 2: Get all graphemes for language
    switch (writingSystem){
        // If syllabary, get all graphemes
        case "syllabary":
            pull = await fetch(`/data?collection=graphemes&fields=grapheme,pronunciation&filter=language:${language}`)
            if (!pull.ok) throw new Error(`Couldn't get graphemes for ${language}`)
            pullJson = await pull.json()
            // Build a random word from randomly selected syllabograms
            for (let index = 0; index<syllableNumber.value; index++){
                const randomNum = randomNumber(0, pullJson.length-1)
                randomWord = randomWord + pullJson[randomNum].grapheme
                pronunciationString = pronunciationString + "-" + pullJson[randomNum].pronunciation
            }
            break;
        // If alphabet, store consonants and vowels seperately
        case "alphabet":
            // Fetch syllable structure
            pull = await fetch(`/data?collection=phonotactics&filter=language:${language}`)
            if (!pull.ok) throw new Error(`Couldn't get phonotactics for ${language}`)
            pullJson = await pull.json()
            const phonotactics = structuredClone(pullJson)
            // Fetch letters
            pull = await fetch(`/data?collection=graphemes&fields=grapheme,function,pronunciation&filter=language:${language}`)
            if (!pull.ok) throw new Error(`Couldn't get graphemes for ${language}`)
            pullJson = await pull.json()
            const letters = pullJson
            // Store letters
            let vowels = []
            let consonants = []
            letters.forEach(letter => {
                if (letter.function == "vowel") vowels.push(letter)
                else if (letter.function == "consonant") consonants.push(letter)
            })
            // Iterate once for the # of inputted syllables
            for (let index = 0; index<syllableNumber.value; index++){
                const [syllable, pronunciation] = buildSyllable(phonotactics, vowels, consonants)
                randomWord = randomWord + syllable
                pronunciationString = pronunciationString + "-" + pronunciation
            }
            // Build syllables based on 
            break;
    }wordDisplay.textContent = `Word: ${randomWord}`
    pronunciationDisplay.textContent = `Pronunciation: ${pronunciationString.slice(1)}`
}

function buildSyllable(phonotactics, vowels, consonants){
    let syllable = ""
    let pronunciation = ""
    // Build the onset
    switch (randomNumber(phonotactics.onset_min, phonotactics.onset_max)){
        case 2: 
            if (phonotactics.allowed_clusters.length > 0) output = phonotactics.allowed_clusters[randomNumber(0, phonotactics.allowed_clusters.length-1)]
            break
        case 1:
            output = consonants[randomNumber(0, consonants.length-1)]
            break
        default:
            break
    }
    // Set the vowel
    output = output + vowels[randomNumber(0, vowels.length-1)]
    // Build the coda
    switch (randomNumber(phonotactics.coda_min, phonotactics.coda_max)){
        case 2: 
            if (phonotactics.allowed_clusters.length > 0) output = output + phonotactics.allowed_clusters[randomNumber(0, phonotactics.allowed_clusters.length-1)]
            break
        case 1:
            output = output + vowels[randomNumber(0, vowels.length-1)]
            break
        default:
            break
    }
    // Return value
    return output
}

// If using array.length for maximum, be sure to add "-1"
function randomNumber(minimum, maximum){
    const number =  Math.floor(Math.random() * (Number(maximum) - Number(minimum) + 1) + Number(minimum))
    return number
}