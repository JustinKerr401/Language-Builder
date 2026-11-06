

// Variables
const display = document.getElementById("wordDisplay")
const selector = document.getElementById("selector")
const apc = document.getElementById("apc")

// Startup functions
getLanguages()

// ------------------------------ Functions ------------------------------

async function getLanguages(){
    // Get list of languages (keys)
    const getKeys = await fetch(`/data?collection=languages&fields=language,parent`)
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
    
        // Get list of consonants and vowels in the language
    // Get language's phonemes
    const phonemesPull = await fetch(`/data?collection=languages&fields=phonemes&filter=language:${selector.value}`)
    if (!phonemesPull.ok) throw new Error("Failed to fetch phonemes")
    const phonemesPulled = await phonemesPull.json()
    const languagePhonemes = phonemesPulled[0].phonemes
    // Get all phonemes
    const allPhonemesPull = await fetch(`/data?collection=phonemes&fields=phoneme,readible_form,type`)
    if (!allPhonemesPull.ok) throw new Error("Failed to fetch phonemes")
    const allPhonemes = await allPhonemesPull.json()
    // Organize languages phonemes into proper lists
    let vowels = []
    let consonants = []
    allPhonemes.forEach(phonemeOb => {
        if (languagePhonemes.includes(phonemeOb.phoneme)){
            // Add phoneme into appropriate array
            switch (phonemeOb.type){
                case "vowel":
                    vowels.push(phonemeOb.readible_form)
                    break
                case "consonant":
                    consonants.push(phonemeOb.readible_form)
                    break
            }
        }
    })
    // Get phonotactics
    const phonotacticsPull = await fetch(`/data?collection=phonotactics&filter=language:${selector.value}`)
    if (!phonotacticsPull.ok) throw new Error("Failed to fetch phonotactics")
    const phonotacticsPulled = await phonotacticsPull.json()
    const phonotactics = phonotacticsPulled[0]
        // Build random word
    let randomWord = ""
    // onset
    const onsetChars = Math.floor(
        Math.random() * (Number(phonotactics.onset_max) - Number(phonotactics.onset_min) + 1)
    ) + Number(phonotactics.onset_min);
    for (let x = 0; x<onsetChars; x++){
        randomWord = randomWord + consonants[Math.floor(Math.random() * consonants.length)]
    }
    // vowel
    randomWord = randomWord + vowels[Math.floor(Math.random() * vowels.length)]
    // coda
    const codaChars = Math.floor(
        Math.random() * (Number(phonotactics.coda_max) - Number(phonotactics.coda_min) + 1)
    ) + Number(phonotactics.coda_min);
    for (let x = 0; x<codaChars; x++){
        randomWord = randomWord + consonants[Math.floor(Math.random() * consonants.length)]
    }
    // display the word
    display.textContent = randomWord
    // show all clusters
    showAllClusters(languagePhonemes, allPhonemes)
}

function showAllClusters(languagePhonemes, allPhonemes){
    // Get all phoneme objects that belong to the language
    let phonemes = []
    allPhonemes.forEach(phonemeOb => {
        if (languagePhonemes.includes(phonemeOb.phoneme) && phonemeOb.type == "consonant"){
            phonemes.push({
                phoneme: phonemeOb.phoneme,
                written: phonemeOb.readible_form
            })
        }
    })
    apc.innerHTML = ""
    // Iterate over every combination of phonemes and add that combination (unless they repeat...?)
    console.log(phonemes)
    phonemes.forEach(x => {
        // Iterate over each combination
        phonemes.forEach(y => {
            const combination = document.createElement("li")
            combination.textContent = `${x.phoneme}${y.phoneme} | ${x.written}${y.written}`
            apc.appendChild(combination)
        })
    })
}