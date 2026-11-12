


// Holding variables
let attributeNumber = 0

// Make a select item nice
$("#editSelector").select2()

// Relevant DOM elements
const section = document.getElementById("toBeFilled")
const editMenu = document.getElementById("editMenu") 
const editHeader = document.getElementById("editHeader")
const editSelector = document.getElementById("editSelector")

// ------------------------------ Event listeners ------------------------------

// Edit any given value (morpheme, word, etc) if one is selected
$("#editSelector").on("change", async function () {
    if (this.value !== "") {
        // Show the proper section
        const theCollection = editHeader.textContent.split(" ")[1] + "s"
        const key = await getCollectionKey(editHeader.textContent.split(" ")[1])
        await showUser(theCollection)
        // Fill that section with data
        const pull = await fetch(`/data?collection=${theCollection}&filter=${key}:${editSelector.value}`)
        if (!pull.ok) throw new Error(`Failed to fetch ${editSelector.value} data`)
        const multiple = await pull.json()
        const document = multiple[0]
        fillSection(editSelector.value, document)
    }
});

// ------------------------------ Functions ------------------------------

// Get the key of a given collection | If the collection value is missing the "s", the route accounts for that
async function getCollectionKey(collection){
    const pleaseKey = await fetch(`/collectionCheck?collection=${collection}`)
    if (!pleaseKey.ok) throw new Error(`Failed to check collection - ${collection}`)
    const keyFinder = await pleaseKey.json()
    const key = keyFinder.secondAttribute
    return key
}

// User clicks a button (either add or edit a given value)
async function showUser(collection, edit){
    let show = true
    const sectionHeader = section.querySelector("h1")

    // Add button
    if (!edit){
        if (sectionHeader?.textContent == collection) show = false
        // Hide stuffs
        editMenu.style.display = "none"
        editHeader.textContent = ""
        section.style.display = "none"
        section.innerHTML = ""
        // Get collection schema to build proper input system
        const pull = await fetch(`getSchema?collection=${collection}`)
        if (!pull.ok) throw new Error(`Failed to fetch schema for ${collection}`)
        const schema = await pull.json()
        const keys = Object.keys(schema)
        const values = Object.values(schema)
        if (show) await buildSection(keys, values, collection)
    }// Edit button
    else {
        if (editHeader.textContent.split(" ")[1] == collection.slice(0, -1)) show = false
        // Set up edit menu
        section.innerHTML = ""
        section.style.display = "none"
        editHeader.textContent = ""
        editMenu.style.display = "none"
        if (show){
            editMenu.style.display = "flex"
            editHeader.textContent = `What ${collection.slice(0, -1)} are you trying to edit?`
            editSelector.innerHTML = `<option value=""></option>`
                // Set up data selector
            // Get list of keys
            const key = await getCollectionKey(collection)
            const getKeys = collection == "languages" ? await fetch(`/data?collection=${collection}&fields=${key},parent`) 
                                                      : await fetch(`/data?collection=${collection}&fields=${key}`) 
            if (!getKeys.ok) throw new Error(`Failed to fetch list of ${collection}`)
            const collectionItems = await getKeys.json()

            // Put all those keys into an array and sort the array
            let list = []
            collectionItems.forEach(value => {
                list.push(value[key])
                if (collection == "languages") list.push(value.parent)
            })
            // Sort the data alphabetically and remove duplicates (parent languages)
            list.sort()
            const fixedList = [...new Set(list)]
            // Put the sorted values into a dataset
            fixedList.forEach(item => {
                const option = document.createElement("option")
                option.value = item
                option.textContent = item
                editSelector.appendChild(option)
            })
        }
    }
    
}

async function buildSection(keys, values, collection){
    section.innerHTML = ""
    const sectionHeader = document.createElement("h1")
    sectionHeader.style.gridColumnStart = "1"
    sectionHeader.style.gridColumnEnd = "-1"
    sectionHeader.style.margin = "auto"
    section.appendChild(sectionHeader)
    sectionHeader.textContent = collection
    attributeNumber = keys.length
    // Create one input for every field
    for (let index = 0; index<values.length; index++) {
        // See if the current attribute is a key in a collection
        const checkingCollection = await fetch(`/collectionCheck?collection=${keys[index]}`)
        if (!checkingCollection) console.error(`Checking ${keys[index]} lead to an error`)
        const checkedCollection = await checkingCollection.json()
        // Add dataset if this attribute serves as a foreign key
        if (checkedCollection.exists && checkedCollection.collectionName !== collection){
            const datalist = document.createElement("datalist")
            datalist.id = checkedCollection.collectionName
            datalist.style.display = "none"
            const keysPulling = await fetch(`/data?collection=${checkedCollection.collectionName}&fields=${checkedCollection.secondAttribute}`)
            const collectionKeys = await keysPulling.json()
            collectionKeys.forEach(keyObject => {
                const option = document.createElement("option")
                option.value = keyObject[checkedCollection.secondAttribute]
                option.textContent = keyObject[checkedCollection.secondAttribute]
                datalist.appendChild(option)
            })
            document.body.appendChild(datalist)
        }
        const header = document.createElement("h2")
        // Append differently based on the input type
        header.textContent = `${keys[index]}:`
        switch (values[index].type){
            case "String":
                // Choose an input or select based on provided enum values
                section.appendChild(header)
                // Input
                if (values[index].enum == null){
                    const input = document.createElement("input")
                    input.id = index
                    // set datalist
                    if (checkedCollection.exists){
                        input.setAttribute("list", checkedCollection.collectionName)
                    }
                    
                    input.placeholder = `Enter the ${keys[index]}`
                    section.appendChild(input)
                }// Select
                else {
                    const input = document.createElement("select")
                    input.id = index
                    const enums = values[index].enum
                    enums.forEach(choice => {
                        const option = document.createElement("option")
                        option.value = choice
                        option.textContent = choice
                        input.appendChild(option)
                    })
                    section.appendChild(input)
                }
                break
            case "Array":
                // Holding div properties
                if (keys[index] == "phonemes") break
                const input = document.createElement("div")
                input.style.gridColumnStart = "1"
                input.style.gridColumnEnd = "-1"
                input.classList.add("multipleInputs")
                input.style.display = "grid"
                input.style.gridTemplateColumns = "3fr 1fr"
                input.id = index
                // Tweaking the header
                header.style.gridColumnStart = "1"
                header.style.gridColumnEnd = "-1"
                header.style.margin = "auto"
                // Mechanism for adding values: a button
                const addOptionButton = document.createElement("button")
                addOptionButton.onclick = () => addOption(keys[index], addOptionButton);
                addOptionButton.textContent = `+ another ${keys[index]}`
                addOptionButton.style.gridColumnStart = "1"
                addOptionButton.style.gridColumnEnd = "-1"
                addOptionButton.classList.add("addAnother")
                // Inserting into dom
                input.appendChild(header)
                input.appendChild(addOptionButton)
                section.appendChild(input)
                // Trigger addOptionButton
                addOption(keys[index], addOptionButton)
                break
            default:
                break
        }
        
    }
    // Create submit button
    const submit = document.createElement("button")
    submit.onclick = () => saveSection();
    submit.style.gridColumnStart = "1"
    submit.style.gridColumnEnd = "-1"
    submit.textContent = "Submit"
    section.appendChild(submit)
    // Set section to be visible
    section.style.display = "grid"
}

function addOption(placeholder, buttonReference, filler){
    const input = document.createElement("input")
    const button = document.createElement("button")
    // input properties
    input.placeholder = `Input a ${placeholder}`
    // set datalist
    input.setAttribute("list", placeholder);
    // button properties
    button.onclick = () => removeOption(button);
    button.textContent = "x"
    button.classList.add("deleteButton")
    // add filler data
    if (filler !== undefined) input.value = filler
    // append
    buttonReference.parentElement.insertBefore(input, buttonReference)
    buttonReference.parentElement.insertBefore(button, buttonReference)
}

// Delete an option in a multi-input field
function removeOption(button){
    button.previousElementSibling.remove()
    button.remove()
}

// Fill a section with data from a document
function fillSection(key, data){
    const keys = data == null ? null : Object.keys(data) 
    const values = data == null ? null : Object.values(data)
    document.getElementById(0).value = key
    // Only operate if data isn't null
    if (keys !== null){
        // Since there will always be more key value pairs than elements, iterate through key value pairs
        let obID = 1
        for (let index=1; index<keys.length; index++){
            // Process if the key doesn't equal __v or phonemes
            if (keys[index] !== "__v" && keys[index] !== "phonemes"){
                while (document.getElementById(obID) == null){
                    obID++
                }
                document.getElementById(obID).value = obID == 0 ? key : values[obID]
                obID++
            }
        }
    }
    
}

// Save an item to a collection
async function saveSection(){
    try {
        // Object to save
        const jsonExport = {}
        // Collection reference
        const collection = document.querySelector("#toBeFilled h1").textContent
        // Iterate once for every item to save
        for (let x = 0; x<attributeNumber; x++){
            const inputElement = document.getElementById(x)
            const type = inputElement !== null ? inputElement.previousElementSibling.textContent.slice(0, -1) : "null"
            // Split processing depending on type of input
            if (inputElement !== null){
                switch (inputElement.tagName){
                    // Singular input
                    case "INPUT":
                        // Throw error in case of primary key
                        if (x == 0 && inputElement.value == "") throw new Error(`${type} must have a value`)
                        jsonExport[type] = inputElement.value !== "" ? inputElement.value : ""
                        
                        break
                    case "SELECT":
                    // Multiple inputs
                        jsonExport[type] = inputElement.value !== "" ? inputElement.value : ""
                        break
                    case "DIV":
                        const type2 = inputElement.querySelector("h2").textContent.slice(0, -1)
                        jsonExport[type2] = []
                        inputElement.querySelectorAll("input").forEach(input => {
                            if (input.value !== "") jsonExport[type2].push(input.value)
                        })
                        break
                }
            }
            
        }

        // Save to database
        const response = await fetch(`/save?${collection}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonExport)
        })

        const result = await response.json()

        if (response.ok) {
            console.log(`${collection.slice(0, -1)} saved:`, result);

            alert(`${collection.slice(0, -1)} saved successfully!`);
            window.location.reload();
        } else {
            console.error("Error:", result);

            alert(`Failed to save ${collection.slice(0, -1)}.`);
        }

    } catch (error){
        console.error("Request failed:", error)
        alert("Error: ", error)
    }
    
    
}