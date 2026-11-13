

    // DOM elements
// menu
const languageSelector = document.getElementById("languageSelector")
// phoneme section
const languagePhonemeListHeader = document.getElementById("languagePhonemeListHeader")
const languagePhonemeList = document.getElementById("languagePhonemeList")
const phonemeSelector = document.getElementById("phonemeSelector")
// others section
const othersEditor = document.getElementById("othersEditor")

// Startup functions
getLanguages()

// Make selectors fancy
$("#languageSelector").select2()
$("#phonemeSelector").select2()

// ------------------------------ Event Listeners ------------------------------

// Unselect all switches if choosing an option in the language selector
$("#languageSelector").on("change", () => {
    // Uncheck all switchElements
    switchInputs.forEach(turnOff => {
        turnOff.checked = false
    })
    document.getElementById(`phonemesEditor`).style.display = "none"
    othersEditor.style.display = "none"
})

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
    // Set up the section differently depending on setting
    switch(collection){
        // Editing phonemes
        case "phonemes":
            document.getElementById(`phonemesEditor`).style.display = "flex"
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
        // Editing anything else
        default:
            // Set section + header
            othersEditor.innerHTML = `
            <h1 id="othersEditorHeader">${languageSelector.value} ${collection}</h1>
            `
            othersEditor.style.display = "grid"
            // Create a select element for graphemes and morphemes
            if (collection == "graphemes" || collection == "morphemes") {
                // Get elements
                const elementPull = await fetch(`/data?collection=${collection}&filter=language:${languageSelector.value}`)
                if (!elementPull) throw new Error ("Failed to fetch elements")
                const elementsPulled = await elementPull.json()
                // Get useful string
                const attribute = document.getElementById("othersEditorHeader").textContent.split(" ").at(-1).slice(0, -1)
                // Build select element
                    // Holding div
                const div = document.createElement("div")
                div.style.gridColumn = "1 / -1"
                othersEditor.appendChild(div)
                    // Select element
                const elementSelector = document.createElement("select")
                elementSelector.id = "elementSelector"
                elementSelector.style.height = "70px"
                elementSelector.style.width = "100%"
                elementSelector.innerHTML = `<option> -- Select a ${attribute.toUpperCase()} you want to edit -- </option>`
                div.appendChild(elementSelector)
                $("#elementSelector").select2()
                // Fill select element
                elementsPulled.forEach(element => {
                    const option = document.createElement("option")
                    option.textContent = element[attribute]
                    option.textContent = element[attribute]
                    elementSelector.appendChild(option)
                })
                // Set event listener to fill section with data
                $("#elementSelector").on("change", async function () {
                    // Only fill if a value is selected
                    if (this.value !== "") {
                        await fillSection(`${attribute}s`, languageSelector.value, elementSelector.value)
                    }
                });
            }
            // Get schema for collection to build properly
            let request = await fetch(`/getSchema?collection=${collection}`)
            if (!request.ok) throw new Error (`Failed to retrieve schema for ${collection}`)
            const schema = await request.json()
            const keys = Object.keys(schema)
            const values = Object.values(schema)
            // Iterate over each key-value pair to add an input
            for (let index=0; index<keys.length; index++){
                if (keys[index] == "language") continue
                // Add an input properly depending on datatype
                switch (values[index].type){
                    case "String":
                        // Input
                        if (values[index].enum == null){
                            const label = document.createElement("h2")
                            label.textContent = `${keys[index]}:`
                            const input = document.createElement("input")
                            input.placeholder = `Enter the ${keys[index]}`
                            othersEditor.appendChild(label)
                            othersEditor.appendChild(input)
                        } // Select
                        else {
                            const label = document.createElement("h2")
                            label.textContent = `${keys[index]}:`
                            const input = document.createElement("select")
                            values[index].enum.forEach(variant => {
                                const option = document.createElement("option")
                                option.textContent = variant
                                option.value = variant
                                input.appendChild(option)
                            })
                            othersEditor.appendChild(label)
                            othersEditor.appendChild(input)
                        }
                        break
                    case "Array":
                        const div = document.createElement("div")
                        div.classList.add("multipleInputs")
                        const header = document.createElement("h2")
                        header.textContent = `${keys[index]}:`
                        const button = document.createElement("button")
                        button.textContent = `+ another ${keys[index]}`
                        button.onclick = () => addOption(keys[index], button);
                        button.style.gridColumn = "1 / -1"
                        othersEditor.appendChild(div)
                        div.appendChild(header)
                        div.appendChild(button)
                        addOption(keys[index], button)
                        break
                }
            }
            break
    }
    // Trigger fillSection if needed
    if (collection == "phonotactics" || collection == "orthography") {
        await fillSection(document.getElementById("othersEditorHeader").textContent.split(" ").at(-1), languageSelector.value)
    } 
}

async function fillSection(collection, language, key){
    console.log(`Collection: ${collection}\nLanguage: ${language}\nKey: ${key}`)
    // Build proper query string (add final filter if necessary)
    const primary = `/data?collection=${collection}&filter=language:${language}`
    const keyString = key == undefined ? "" : `,${collection.slice(0, -1)}:${key}`
    const queryString = primary + keyString
    // Pull from database
    const pull = await fetch(queryString)
    if (!pull.ok) throw new Error ("Couldn't get data to fill section")
    const data = await pull.json()
    const keysValues = Object.entries(data[0])
    // Iterate over each key-value pair to fill the section
    for (let index = 0; index<keysValues.length; index++){
        console.log(keysValues[index])
        // Get all possible input fields and then match the current key to the correct one
        document.querySelectorAll("#othersEditor input").forEach(input => {
            // Detect matching key
            if (input.previousElementSibling.textContent.slice(0, -1) == keysValues[index][0]){
                // Insert differently depending on datatype
                    // String case
                if (typeof keysValues[index][1] === "string"){
                    input.value = keysValues[index][1]
                }   // Array case
                else {
                    // Firstly, remove placeholder value (but store reference to "add" button first!)
                    const addOptionButton = input.nextElementSibling.nextElementSibling
                    removeOption(input.nextElementSibling)
                    // Add an option for value
                    keysValues[index][1].forEach(value => {
                        addOption("none", addOptionButton, value)
                    })
                }
            }
        })
    }
}

function addOption(placeholder, reference, value){
    // Set input
    const input = document.createElement("input")
    input.placeholder = `Input a ${placeholder}`
    if (value !== undefined) input.value = value
    // Set delete button
    const button = document.createElement("button")
    button.onclick = () => removeOption(button);
    button.textContent = "x"
    button.classList.add("deleteButton")
    // append
    reference.parentElement.insertBefore(input, reference)
    reference.parentElement.insertBefore(button, reference)
}

// Delete an option in a multi-input field
function removeOption(button){
    button.previousElementSibling.remove()
    button.remove()
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