// Editing menu items
const editMenu = document.getElementById("editMenu") 
const editHeader = document.getElementById("editHeader")
const editSelector = document.getElementById("editSelector") 

// Startup methods
hideSections()
getCollectionKeys("morphemes")
getCollectionKeys("words")
$("#editSelector").select2()

// ------------------------------ Page maintenance ------------------------------

// Hides all <section> items
function hideSections(){
    const sectionsToHide = document.querySelectorAll("section")
    sectionsToHide.forEach(sectionToHide => {
        sectionToHide.style.display = "none"
    })
}

// Edit any given value (morpheme, word, etc) if one is selected
editSelector.addEventListener("change", () => {
    if (editSelector.value !== "") setEditSection()
})

// Fill a section out with the database's info about said value
async function setEditSection(){
        // Get corresponding value from database
        const collection = editHeader.textContent.split(" ")[1]
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
            document.getElementById("language").value = values.language !== undefined ? values.language : ""
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
    // Toggle off edit
    if (edit && editHeader.textContent.split(" ")[1] == variant) {
        editMenu.style.display = "none"
        editHeader.textContent = ""
    }// Toggle on edit
    else if (edit){
        hideSections()
        editMenu.style.display = "flex"
        const datalistName = `${variant}List`
        document.querySelector("#editMenu h1").textContent = `What ${variant} are you trying to edit?`
        editSelector.innerHTML = ""
        document.getElementById(datalistName).querySelectorAll("option").forEach(option => {
            const newOption = document.createElement("option")
            newOption.value = option.value
            newOption.textContent = option.value
            editSelector.append(newOption)
        })
    }// Toggle off sections
    else if (!edit && document.getElementById(variant).style.display == "grid"){
        hideSections()
    }// Toggle on A section, depending on which is passed into method
    else if (!edit && document.getElementById(variant).style.display == "none"){
        hideSections()
        fillSection(variant, {})
        editMenu.style.display = "none"
        document.getElementById(variant).style.display = "grid"
    }
}

// Get all the keys from any given collection | Get all the "words" from "words", no other fields
async function getCollectionKeys(collection){
    // Call database for data
    const key = collection.slice(0, -1)
    const response = await fetch(`/data?collection=${collection}&fields=${key}`)
    if (!response.ok) throw new Error(`Failed to fetch list of ${collection}`)
    const collectionItems = await response.json()
    // Put all those keys into an array and sort the array
    let list = []
    collectionItems.forEach(value => {
        list.push(value[key])
    })
    // Sort the data alphabetically
    list.sort()
    // Put the sorted values into a dataset for later reference
    list.forEach(item => {
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
    if (specific == "Morpheme") newOption.list = "morphemeList"
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
        language: document.getElementById("language").value.toLowerCase(),
        derives: document.getElementById("derives").value.toLowerCase(),
        meaning: document.getElementById("meaning").value.toLowerCase(),
        inspiration_language: document.getElementById("inspiration_language").value.toLowerCase(),
        derived_from: document.getElementById("derived_from").value.toLowerCase(),
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