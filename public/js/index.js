// Startup methods
hideSections()
$("#editSelector").select2()
getKeys()

// Editing menu items
const editMenu = document.getElementById("editMenu") 
const editHeader = document.getElementById("editHeader")
const editSelector = document.getElementById("editSelector") 

// ------------------------------ Page maintenance ------------------------------

async function getKeys(){
    getCollectionKeys("morphemes")
    getCollectionKeys("words")
    getCollectionKeys("languages")
}

// Hides all <section> items
function hideSections(){
    const sectionsToHide = document.querySelectorAll("section")
    sectionsToHide.forEach(sectionToHide => {
        sectionToHide.style.display = "none"
    })
}

// Edit any given value (morpheme, word, etc) if one is selected
$("#editSelector").on("change", function () {
    if (this.value !== "") {
        setEditSection();
    }
});

// Fill a section out with the database's info about said value
async function setEditSection(){
        // Get corresponding value from database
        const collection = editHeader.textContent.split(" ")[1] + "s"
        const filter = collection.slice(0, -1)
        const value = editSelector.value
        const response = await fetch(`/data?collection=${collection}&filter=${filter}:${value}`)
        if (!response.ok) throw new Error(`Failed to fetch list of ${collection}`)
        const process = await response.json()
        const toEdit = process[0]
        // Fill the relevant section
        fillSection(collection, toEdit)
}

// Either fill a section with data, or clear it of data
function fillSection(section, values){
    switch (section){
        case "morphemes":
            // Set all values
            document.getElementById("morphemeInput").value = values.morpheme !== undefined ? values.morpheme : ""
            document.getElementById("languageInputMorpheme").value = values.language !== undefined ? values.language : ""
            document.getElementById("derives").value = values.derives !== undefined ? values.derives : ""
            document.getElementById("meaning").value = values.meaning !== undefined ? values.meaning : ""
            document.getElementById("inspiration_language").value = values.inspiration_language !== undefined ? values.inspiration_language : ""
            document.getElementById("derived_from").value = values.derived_from !== undefined ? values.derived_from : ""
            // Set meanings (more complicated)
            const realMeaning = values.real_meaning
            // Clear div
            clearMultipleInputs(document.getElementById(section).querySelector("div"), "Meaning")
            // Fill div via pre-existing methods
            if (realMeaning?.length > 0){
                removeOption(document.querySelector("#morphemes div button"))
                realMeaning.forEach(meaning => {
                    addOption("Meaning", document.querySelector("#morphemes div button.addAnother"), meaning)
                })
            }
            
            break
        case "words":
            // Set all values
            document.getElementById("wordInput").value = values.word !== undefined ? values.word : ""
            document.getElementById("languageInputWord").value = values.language !== undefined ? values.language : ""
            document.getElementById("structure").value = values.structure !== undefined ? values.structure : ""
            document.getElementById("class").value = values.class !== undefined ? values.class : ""
            document.getElementById("function").value = values.function !== undefined ? values.function : ""
                // Set morphemes included
            const morphemes = values.morphemes
            // Clear div
            clearMultipleInputs(document.getElementById(section).querySelectorAll("div")[0], "Morpheme")
            // Fill div
            if (morphemes?.length > 0){
                removeOption(document.querySelectorAll("#words div")[0].querySelector("button"))
                morphemes.forEach(morpheme => {
                    addOption("Morpheme", document.querySelectorAll("#words div")[0].querySelector("button.addAnother"), morpheme)
                })
            }
                // Set meaning
            const meaning = values.meaning
            // Clear div
            clearMultipleInputs(document.getElementById(section).querySelectorAll("div")[1], "Meaning")
            // Fill div
            if (meaning?.length > 0){
                removeOption(document.querySelectorAll("#words div")[1].querySelector("button"))
                meaning.forEach(thisMeaning => {
                    addOption("Meaning", document.querySelectorAll("#words div")[1].querySelector("button.addAnother"), thisMeaning)
                })
            }
            
            break
        case "languages":
            document.getElementById("languageInput").value = editMenu.style.display == "flex" ? editSelector.value : ""
            document.getElementById("parent").value = values?.parent !== undefined ? values.parent : ""
            document.getElementById("relationship").value = values?.relationship !== undefined ? values.relationship : ""
            break
    }document.getElementById(section).style.display = "grid"
}

function clearMultipleInputs(specificDiv, placeholder){
    specificDiv.querySelectorAll("button:not(.addAnother)").forEach(button => {
        removeOption(button)
    })
    addOption(placeholder, specificDiv.querySelector("button.addAnother"))
}

// Toggles which pop up menu appears
function togglePage(variant, edit){ 
    let show = false
        // Seperate paths based on if adding or editing
    // Adding
    if (!edit){
        // If section is already visible
        if (document.getElementById(variant).style.display == "none") show = true
        // Hide sections + editing pane
        hideSections()
        editMenu.style.display = "none"
        editHeader.textContent = ""
        fillSection(variant, {})
        // Show section if necessary
        if (show) document.getElementById(variant).style.display = "grid"
    }
    // Editing
    else {
        // Show the editing pane if it isn't already open
        if (editHeader.textContent.split(" ")[1] != variant) show = true
        // Hide sections + editing pane
        hideSections()
        editMenu.style.display = "none"
        editHeader.textContent = ""
        // Show editing pane if necessary
        if (show) {
            editMenu.style.display = "flex"
            // Set header to proper variant
            document.querySelector("#editMenu h1").textContent = `What ${variant.slice(0, -1)} are you trying to edit?`
            // Set the datalist the drop down draws from
            const datalistName = `${variant}List`
            editSelector.innerHTML = ""
            document.getElementById(datalistName).querySelectorAll("option").forEach(option => {
                const newOption = document.createElement("option")
                newOption.value = option.value
                newOption.textContent = option.value
                editSelector.append(newOption)
            })
        }
    }
    show = false
}

// Get all the keys from any given collection | Get all the "words" from "words", no other fields
async function getCollectionKeys(collection){
    // Call database for data
    const key = collection.slice(0, -1)
    const response = collection == "languages" ? await fetch(`/data?collection=${collection}&fields=${key},parent`) : await fetch(`/data?collection=${collection}&fields=${key}`)
    if (!response.ok) throw new Error(`Failed to fetch list of ${collection}`)
    const collectionItems = await response.json()
    // Put all those keys into an array and sort the array
    let list = []
    collectionItems.forEach(value => {
        list.push(value[key])
        if (collection == "languages") list.push(value.parent)
    })
    // Sort the data alphabetically and remove duplicates (parent languages)
    list.sort()
    const fixedList = [...new Set(list)]
    // Put the sorted values into a dataset for later reference
    fixedList.forEach(item => {
        const option = document.createElement("option")
        option.value = item
        document.getElementById(`${collection}List`).appendChild(option)
    })
}

// ------------------------------ Building ------------------------------

// Add an option to a field which can have multiple inputs
function addOption(specific, reference, fillerValue){
    const newOption = document.createElement("input")
    newOption.placeholder = specific
    const properList = `${specific.toLowerCase()}sList`
    newOption.setAttribute("list", properList)
    if (fillerValue) newOption.value = fillerValue
    const newDelete = document.createElement("button")
    newDelete.textContent = "x"
    newDelete.onclick = () => removeOption(newDelete);
    reference.parentElement.insertBefore(newOption, reference);
    reference.parentElement.insertBefore(newDelete, reference);
}

// Delete an option in a multi-input field
function removeOption(button){
    button.previousElementSibling.remove()
    button.remove()
}

// ------------------------------ Saving ------------------------------

// Submit the created morpheme
async function submitMorpheme(button){
    const meanings = document.querySelectorAll("#morphemes div input")
    let meaningsArray = []
    meanings.forEach(meaning => {
        if (meaning.value!="") meaningsArray.push(meaning.value.toLowerCase())
    })
    
    const morphemeSave = {
        morpheme: document.getElementById("morphemeInput").value.toLowerCase(),
        language: (document.getElementById("language")?.value ?? "").toLowerCase(),
        derives: (document.getElementById("derives")?.value ?? "").toLowerCase(),
        meaning: (document.getElementById("meaning")?.value ?? "").toLowerCase(),
        inspiration_language: (document.getElementById("inspiration_language")?.value ?? "").toLowerCase(),
        derived_from: (document.getElementById("derived_from")?.value ?? "").toLowerCase(),
        real_meaning: meaningsArray
    }

    try {
        const response = await fetch("/save?morphemes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(morphemeSave)
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Morpheme saved:", result);

            alert("Morpheme saved successfully!");
            window.location.reload();
        } else {
            console.error("Error:", result);

            alert("Failed to save morpheme.");
        }

    } catch (error) {
        console.error("Request failed:", error);

        alert("Could not connect to the server.");
    }
}

// Submit the created word
async function submitWord(){
    const divs = document.querySelectorAll("#words div")
    let morphemesArray = []
    divs[0].querySelectorAll("input").forEach(morpheme => {
        if (morpheme.value!="") morphemesArray.push(morpheme.value.toLowerCase())
    })
    let meaningsArray = []
    divs[1].querySelectorAll("input").forEach(meaning => {
        if (meaning.value!="") meaningsArray.push(meaning.value.toLowerCase())
    })

    const wordSave = {
        word: document.getElementById("wordInput").value.toLowerCase(),
        language: document.getElementById("languageInputWord").value.toLowerCase(),
        structure: document.getElementById("structure").value.toLowerCase(),
        class: document.getElementById("class").value.toLowerCase(),
        function: document.getElementById("function").value.toLowerCase(),
        morphemes: morphemesArray,
        meaning: meaningsArray
    }

    try {
        const response = await fetch("/save?words", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(wordSave)
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Word saved:", result);

            alert("Word saved successfully!");
            window.location.reload();
        } else {
            console.error("Error:", result);

            alert("Failed to save word.");
        }

    } catch (error) {
        console.error("Request failed:", error);

        alert("Could not connect to the server.");
    }
}

// Submit the created word
async function submitLanguage(){
    const languageSave = {
        language: document.getElementById("languageInput").value.toLowerCase(),
        parent: document.getElementById("parent").value.toLowerCase(),
        relationship: document.getElementById("relationship").value
    }

    try {
        const response = await fetch("/save?languages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(languageSave)
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Word saved:", result);

            alert("Word saved successfully!");
            window.location.reload();
        } else {
            console.error("Error:", result);

            alert("Failed to save word.");
        }

    } catch (error) {
        console.error("Request failed:", error);

        alert("Could not connect to the server.");
    }
}