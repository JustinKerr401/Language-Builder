

// DOM elements
const languageSelector = document.getElementById("languageSelector")
const display = document.getElementById("display")
const firstCheck = document.getElementById("firstCheck")
const secondCheck = document.getElementById("secondCheck")
const thirdCheck = document.getElementById("thirdCheck")

// Startup functions
getLanguages()

// Event listeners
languageSelector.addEventListener("change", () => {
    if (languageSelector.value !== ""){
        analyze(languageSelector.value)
    }
})

// Functions
async function getLanguages(){
    const pull = await fetch(`/data?collection=languages&fields=language`)
    if (!pull.ok) throw new Error("Couldn't get languages")
    const languages = await pull.json()
    languages.forEach(language => {
        const option = document.createElement("option")
        option.value = language.language
        option.textContent = language.language
        languageSelector.appendChild(option)
    })
}

async function analyze(language){
    display.style.display = "none"
    firstCheck.innerHTML = ""
    firstCheck.style.display = "none"
    secondCheck.innerHTML = ""
    secondCheck.style.display = "none"
    thirdCheck.innerHTML = ""
    thirdCheck.style.display = "none"
        // 1st check: If any graphemes have phonemes that aren't in the language
    // Get graphemes
    let pull = await fetch(`/data?collection=graphemes&filter=language:${language}`)
    if (!pull.ok) throw new Error(`Failed to fetch graphemes for language: ${language}`)
    const graphemesOb = await pull.json()
    // Get language phonemes
    pull = await fetch(`/data?collection=languages&fields=phonemes&filter=language:${language}`)
    if (!pull.ok) throw new Error(`Failed to fetch phonemes for language: ${language}`)
    const phonemesOb = await pull.json()
    const phonemes = phonemesOb[0].phonemes
    // Check each grapheme
    let notStored = []
    let faultyGraphemes = []
    graphemesOb.forEach(graphemeOb => {
        const graphemePhonemes = graphemeOb.phonemes
        // Iterate once for every stored phoneme
        for (let index=0; index<graphemePhonemes.length; index++){
            // If this phoneme isn't stored, not it and the grapheme
            if (!phonemes.includes(graphemePhonemes[index])) {
                notStored.push(graphemePhonemes[index])
                faultyGraphemes.push(graphemeOb.grapheme)
            }
        }
    })
    // Clear repeat values
    const missingPhonemes = [...new Set(notStored)]
    faultyGraphemes = [...new Set(faultyGraphemes)]
    // Output results if necessary
    // Case for no errors
    if (missingPhonemes.length > 0){
        firstCheck.style.display = "grid"
        const header1 = document.createElement("h2")
        const header2 = document.createElement("h2")
        const list1 = document.createElement("ol")
        const list2 = document.createElement("ol")
        header1.textContent = "These phonemes don't belong to the language"
        header2.textContent = "These graphemes contain missing phonemes"
        firstCheck.appendChild(header1)
        firstCheck.appendChild(header2)
        firstCheck.appendChild(list1)
        firstCheck.appendChild(list2)
        // List all missing phonemes
        missingPhonemes.forEach(phoneme => {
            const item = document.createElement("li")
            item.textContent = phoneme
            list1.appendChild(item)
        })
        // List all missing phonemes
        faultyGraphemes.forEach(grapheme => {
            const item = document.createElement("li")
            item.textContent = grapheme
            list2.appendChild(item)
        })
    }

        // 2nd check: If any morphemes use graphemes that aren't in the language
    // Get morphemes
    pull = await fetch(`/data?collection=morphemes&filter=language:${language}`)
    if (!pull.ok) throw new Error(`Failed to fetch graphemes for language: ${language}`)
    const morphemesOb = await pull.json()
    console.log(graphemesOb, morphemesOb)
    // Iterate over each morpheme
    morphemesOb.forEach(morphemeOb => {
        
    })
        // 3rd check: If words' structure matches the morphemes yoinked
    
        // Reveal section if necessary
    if (firstCheck.style.display !== "none" || secondCheck.style.display !== "none" || thirdCheck.style.display !== "none" ) display.style.display = "flex"
    else window.alert("No found inconsistencies in this language!")
}