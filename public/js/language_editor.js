

    // DOM elements
// menu
const languageSelector = document.getElementById("languageSelector")
// phoneme section
const languagePhonemeListHeader = document.getElementById("languagePhonemeListHeader")
const languagePhonemeList = document.getElementById("languagePhonemeList")
const phonemeSelector = document.getElementById("phonemeSelector")

// Startup functions
getLanguages()

// Make selectors fancy
$("#languageSelector").select2()
$("#phonemeSelector").select2()

// ------------------------------ Event Listeners ------------------------------

// Set function for every language editor switch
const switchInputs = document.querySelectorAll("#switches .switch input")
switchInputs.forEach(switchElement => {
    switchElement.addEventListener("change", () => {
        // Hide all sections
        document.querySelectorAll(".editSection").forEach(givenSection => {
            givenSection.style.display = "none"
        })
        let on = switchElement.checked
        // Uncheck all switchElements
        switchInputs.forEach(turnOff => {
            turnOff.checked = false
        })
        // Check if a language is chosen
        if (languageSelector.value == ""){
            window.alert("Choose a language before editing")
        }// Keep on this one if needed
        else if (on) {
            switchElement.checked = true
            // Trigger the proper buildEditor()
            buildEditor(switchElement.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.textContent.toLowerCase())
        }
    })
})

// See if in the phoneme editor, if a new phoneme was chosen
$("#phonemeSelector").on("change", () => {
    if (phonemeSelector.value !== ""){
        // Check if phoneme is already in list
        const exists = [...document.querySelectorAll("#languagePhonemeList p")]
            .some(p => p.textContent.trim() === phonemeSelector.value)
        // Only add if exists is false
        if (!exists) {
            addPhonemeToList(phonemeSelector.value)
        }
    }
})

// ------------------------------ Setup functions ------------------------------

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

async function buildEditor(collection){
    // Set up the section differently depending on collection / setting
    document.getElementById(`${collection}Editor`).style.display = "flex"
    switch(collection){
        case "phonemes":
            // Pull all phonemes from database
            let pull = await fetch(`/data?collection=phonemes&fields=phoneme`)
            if (!pull.ok) throw new Error("Couldn't fetch phonemes from database")
            const phonemes = await pull.json()
            // Pull all phonemes stored for language
            pull = await fetch(`/data?collection=languages&fields=phonemes&filter=language:${languageSelector.value}`)
            if (!pull.ok) throw new Error("Couldn't fetch langauge's phonemes")
            const languagePhonemes = await pull.json()
                // Something to show all the current phonemes in the language
                // Something to add a phoneme (don't if phoneme is already listed)
                // A submit button
            // Set header text
            languagePhonemeListHeader.textContent = `${languageSelector.value} phonemes`
            // Fill languagePhonemeList
            languagePhonemes[0].phonemes.forEach(phoneme => {
                addPhonemeToList(phoneme)
            })
            // Fill phoneme selector with options
            phonemeSelector.innerHTML = "<option></option>"
            phonemes.forEach(phonemeOb => {
                const option = document.createElement("option")
                option.value = phonemeOb.phoneme
                option.textContent = phonemeOb.phoneme
                phonemeSelector.appendChild(option)
            })
                
            break
        default:
            break
    }
}

function addPhonemeToList(value){
    const display = document.createElement("p")
    display.textContent = value
    const button = document.createElement("button")
    button.textContent = "x"
    button.onclick = () => deleteOption(button)
    languagePhonemeList.appendChild(display)
    languagePhonemeList.appendChild(button)
}

function deleteOption(button){
    button.previousElementSibling.remove()
    button.remove()
}

// ------------------------------ Saving functions ------------------------------

async function submitPhonemesEditor(){
    
    try {
        // Get list of phonemes
        let phonemes = []
        document.querySelectorAll("#languagePhonemeList p").forEach(phoneme => {
            phonemes.push(phoneme.textContent)
        })
        phonemes.sort()
        // Get language
        const language = languagePhonemeListHeader.textContent.split(" ").slice(0, -1).join(" ")
        // Build object
        const jsonExport = {
            language: language,
            phonemes: phonemes
        }
        // Save to database
        const response = await fetch(`/save?languages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonExport)
        })

        const result = await response.json()

        if (response.ok) {
            console.log(`${languagePhonemeListHeader.textContent.split(" ").slice(0, -1).join(" ")} saved:`, result);

            alert(`${languagePhonemeListHeader.textContent.split(" ").slice(0, -1).join(" ")} saved successfully!`);
            window.location.reload();
        } else {
            console.error("Error:", result);

            alert(`Failed to save ${languagePhonemeListHeader.textContent.split(" ").slice(0, -1).join(" ")}'s phonemes`);
        }
    } catch (error){
        console.error("Request failed:", error)
        alert("Error: ", error)
    }

    


}