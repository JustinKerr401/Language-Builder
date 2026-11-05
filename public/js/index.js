


// Holding variables
let attributeNumber = 0

// Relevant DOM elements
const section = document.getElementById("toBeFilled")
const editMenu = document.getElementById("editMenu") 
const editHeader = document.getElementById("editHeader")
const editSelector = document.getElementById("editSelector")

// ------------------------------ Functions ------------------------------

// User clicks a button (either add or edit a given value)
async function showUser(collection, edit){
    let show = false

    // Add button
    if (!edit){
        const pull = await fetch(`getSchema?collection=${collection}`)
        if (!pull.ok) throw new Error(`Failed to fetch schema for ${collection}`)
        const schema = await pull.json()
        const keys = Object.keys(schema)
        const values = Object.values(schema)
        // Automatically fill the section with values
        fillSection(keys, values, collection)
    }// Edit button
    else {
        section.innerHTML = ""
        section.style.display = "none"
        editMenu.style.display = 
    }
    
}

function fillSection(keys, values, collection){
    section.innerHTML = ""
    const sectionHeader = document.createElement("h1")
    sectionHeader.style.gridColumnStart = "1"
    sectionHeader.style.gridColumnEnd = "-1"
    sectionHeader.style.margin = "auto"
    section.appendChild(sectionHeader)
    sectionHeader.textContent = collection
    attributeNumber = keys.length
    // Create one input for every field
    values.forEach((value, index) => {
        const header = document.createElement("h2")
        const input = value.type == "String" ? document.createElement("input") :
                      value.type == "Array" ? document.createElement("div") : 
                      null
        // Append differently based on the input type
        header.textContent = `${keys[index]}:`
        switch (value.type){
            case "String":
                input.id = index
                input.placeholder = `Enter the ${keys[index]}`
                section.appendChild(header)
                section.appendChild(input)
                break
            case "Array":
                // Holding div properties
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
                // Inserting into dom
                input.appendChild(header)
                input.appendChild(addOptionButton)
                section.appendChild(input)
                // Trigger addOptionButton
                addOption(keys[index], addOptionButton)
                break
            default:
                
        }
        
    })
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

function addOption(placeholder, buttonReference){
    const input = document.createElement("input")
    const button = document.createElement("button")
    // input properties
    input.placeholder = `Input a ${placeholder}`
    // button properties
    button.onclick = () => removeOption(button);
    button.textContent = "x"
    // append
    buttonReference.parentElement.insertBefore(input, buttonReference)
    buttonReference.parentElement.insertBefore(button, buttonReference)
}

// Delete an option in a multi-input field
function removeOption(button){
    button.previousElementSibling.remove()
    button.remove()
}

async function saveSection(){
    try {
        // Object to save
        const jsonExport = {}
        // Collection reference
        const collection = document.querySelector("#toBeFilled h1").textContent
        // Iterate once for every item to save
        for (let x = 0; x<attributeNumber; x++){
            const inputElement = document.getElementById(x)
            const type = inputElement.previousElementSibling.textContent.slice(0, -1)
            // Split processing depending on type of input
            switch (inputElement.tagName){
                // Singular input
                case "INPUT":
                    // Throw error in case of primary key
                    if (x == 0 && inputElement.value == "") throw new Error(`${type} must have a value`)
                    jsonExport[type] = inputElement.value !== "" ? inputElement.value : ""
                    break
                // Multiple inputs
                case "DIV":
                    break
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