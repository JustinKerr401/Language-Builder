


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

    // Add button(s)
    const pull = await fetch(`getSchema?collection=${collection}`)
    if (!pull.ok) throw new Error(`Failed to fetch schema for ${collection}`)
    const schema = await pull.json()
    const keys = Object.keys(schema)
    const values = Object.values(schema)
    // Automatically fill the section with values
    fillSection(keys, values)
}

function fillSection(keys, values){
    section.innerHTML = ""
    attributeNumber = keys.length
    console.log(keys, values)
    // Create one input for every field
    values.forEach((value, index) => {
        const header = document.createElement("h2")
        const input = value.type == "String" ? document.createElement("input") :
                      value.type == "Array" ? document.createElement("div") : 
                      null
        header.textContent = `${keys[index]}`
        input.id = index
        input.placeholder = `Enter the ${keys[index]}`
        section.appendChild(header)
        section.appendChild(input)
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

async function saveSection(){
    
}