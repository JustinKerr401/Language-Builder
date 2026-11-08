

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
    const writingSystem = pullJson[0].writing_system
    // Step 2: Get all graphemes for language
    switch (writingSystem){
        // If syllabary, get all graphemes
        case "syllabary":
            pull = await fetch(`/data?collection=graphemes&fields=grapheme,pronunciation&filter=language:${language}`)
            if (!pull.ok) throw new Error(`Couldn't get graphemes for ${language}`)
            let pullJson = await pull.json()
            let randomWord = ""
            let pronunciationString = ""
            for (let index = 0; index<syllableNumber.value; index++){
                const randomNum = randomNumber(0, pullJson.length-1)
                randomWord = randomWord + pullJson[randomNum].grapheme
                pronunciationString = pronunciationString + "-" + pullJson[randomNum].pronunciation

            }
            wordDisplay.textContent = `Word: ${randomWord}`
            pronunciationDisplay.textContent = `Pronunciation: ${pronunciationString.slice(1)}`
            break;
        // If alphabet, store consonants and vowels seperately
        case "alphabet":
            break;
    }
}

// If using array.length for maximum, be sure to add "-1"
function randomNumber(minimum, maximum){
    const number =  Math.floor(Math.random() * (Number(maximum) - Number(minimum) + 1) + Number(minimum))
    return number
}