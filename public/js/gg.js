



// Relevant DOM elements
const section = document.querySelector("section")
const selector = document.getElementById("selector")
const graphemeInput = document.getElementById("graphemeInput")
const languageInput = document.getElementById("languageInput")
const phonemeSelector = document.getElementById("phonemeSelector")
const phonemeAdder = document.getElementById("phonemeAdder")
const pronunciation = document.getElementById("pronunciation")
const functionSelector = document.getElementById("function")

// Make a select item nice
$("#selector").select2()
$("#phonemeSelector").select2()

// Give inputs proper values
setInputs()


// ------------------------------ Functions + Event Listeners ------------------------------

//data?collection=morphemes&fields=morpheme,meaning&filter=language:Latin,inspiration_language:Greek

async function setInputs(){
    // Set selector with all graphemes
    let pull = await fetch("/data?collection=graphemes")
    if (!pull.ok) throw new Error("Couldn't pull graphemes")
    const graphemes = await pull.json()
    // Store grapheme and language into option for select
    graphemes.forEach(graphemeOb => {
        const option = document.createElement("option")
        const text = `${graphemeOb.grapheme} | ${graphemeOb.language}`
        option.value = text
        option.textContent = text
        selector.appendChild(option)
    })

    // Set language input with values
    pull = await fetch("/data?collection=languages&fields=language,phonemes")
    if (!pull.ok) throw new Error("Couldn't pull languages")
    const languages = await pull.json()
    languages.forEach(languageOb => {
        const option = document.createElement("option")
        option.value = languageOb.language
        option.textContent = languageOb.language
        languageInput.appendChild(option)
    })
}

// Set phoneme selector if language is chosen
languageInput.addEventListener("change", function() {
    if (this.value !== ""){
        setPhonemeSelector(languageInput.value)
    }
})

// Fill editing pane with values from chosen grapheme
$("#selector").on("change", async function () {
    let grapheme = ""
    let language = ""
    let functionVar = ""
    let phonemes = []
    if (this.value !== "") {
        const data = selector.value.split(" | ")
        let pull = await fetch(`/data?collection=graphemes&filter=grapheme:${data[0]},language:${data[1]}`)
        if (!pull.ok) throw new Error("Couldn't pull graphemes")
        const graphemeOb = await pull.json()
        grapheme = graphemeOb[0].grapheme
        language = graphemeOb[0].language
        functionVar = graphemeOb[0].function
        phonemes = graphemeOb[0].phonemes
    }
    graphemeInput.value = grapheme
    languageInput.value = language
    functionSelector.value = functionVar
    document.querySelectorAll(".removeButton").forEach(button => {
        removePhoneme(button)
    })
    phonemes.forEach(phoneme => {
        addPhoneme(phonemeAdder, phoneme)
    })
})


async function setPhonemeSelector(language){
    phonemeSelector.innerHTML = ""
    const pull = await fetch(`/data?collection=languages&fields=phonemes&filter=language:${language}`)
    if (!pull.ok) throw new Error("Couldn't pull languages")
    const phonemesOb = await pull.json()
    const phonemes = phonemesOb[0].phonemes
    phonemes.forEach(phoneme => {
        const option = document.createElement("option")
        option.value = phoneme
        option.textContent = phoneme
        phonemeSelector.appendChild(option)
    })
}

function addPhoneme(button, value){
    const phoneme = phonemeSelector.value
    if (phoneme !== "" || value !== ""){
        const display = document.createElement("p")
        display.textContent = value == null ? phoneme : value
        const remove = document.createElement("button")
        remove.textContent = "x"
        remove.onclick = () => removePhoneme(remove);
        remove.classList.add("removeButton")
        button.parentElement.insertBefore(display, phonemeSelector)
        button.parentElement.insertBefore(remove, phonemeSelector)
    }
    updatePronunciation()
}

function removePhoneme(button){
    button.previousElementSibling.remove()
    button.remove()
    updatePronunciation()
}

async function updatePronunciation(){
    // Get all listed phonemes
    let pronounce = ""
    const notedPhonemes = document.querySelectorAll("#phonemes p")
    for (let index = 0; index<notedPhonemes.length; index++){
        // Get the readible form of every phoneme
        const pull = await fetch(`/data?collection=phonemes&fields=readible_form&filter=phoneme:${notedPhonemes[index].textContent}`)
        if (!pull.ok) throw new Error("Couldn't pull languages")
        const object = await pull.json()
        pronounce = pronounce + object[0].readible_form + '-'
    }
    pronounce = pronounce.slice(0, -1)
    pronunciation.textContent = `Pronunciation: ${pronounce}` 
}

async function save(){
    try {
        if (graphemeInput.value == "") throw new Error("Missing grapheme")
        if (languageInput.value == "") throw new Error("Missing language")
        let phonemesSave = []
        document.querySelectorAll("#phonemes p").forEach(p => {
            phonemesSave.push(p.textContent)
        })
        const jsonExport = {
            grapheme: graphemeInput.value,
            language: languageInput.value,
            function: functionSelector.value,
            phonemes: phonemesSave,
            pronunciation: pronunciation.textContent.split(": ")[1].replace("-", "")
        }

        // Save to database
        const response = await fetch("/save?graphemes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonExport)
        })

        const result = await response.json()

        if (response.ok) {
            console.log(`Grapheme saved:`, result);

            alert(`Grapheme saved successfully!`);
            setInputs()
        } else {
            console.error("Error:", result);

            alert(`Failed to save grapheme`);
        }


    } catch (error){
        console.error("Request failed:", error)
        alert(`Error: ${error.message}`)
    }
}