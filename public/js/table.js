// DOM objects
const table = document.querySelector("table")
const filterSelect = document.getElementById("filterSelect")
const filterInput = document.getElementById("filterInput")
const theDatalist = document.getElementById("theDatalist")
const filters = document.getElementById("filters")
const collectionDisplayer = document.getElementById("collectionDisplayer")

// Update input datalist
filterSelect.addEventListener("change", ()   => {
    buildDatalist()
})

function buildDatalist(){
    theDatalist.innerHTML = ""
    filterInput.value = ""
    // Get column from selector
    const column = filterSelect.value
    // Get index of chosen column
    const headers = [...document.querySelectorAll("table th")]
    const columnIndex = headers.findIndex(header => header.textContent.trim() === column)
    // Get all values from that column index
    const values = [...document.querySelectorAll("table tr")]
        .slice(1)
        .map(row => row.cells[columnIndex]?.textContent.trim())
    const newValues = [...new Set(values)]
    newValues.forEach(value => {
        const option = document.createElement("option")
        option.value = value
        option.textContent = value
        theDatalist.appendChild(option)
    })
}

// Fill the table with data
async function buildTable(collection){
    // Clear objects
    filterSelect.innerHTML = ""
    filters.innerHTML = ""
    filterInput.value = ""
    collectionDisplayer.textContent = collection
    // Clear table
    table.innerHTML = `
    <thead>
        <tr>

        </tr>
    </thead>
        <tbody>
        
        </tbody>
    `
    // Get all entries from a given collection
    collection = collection.toLowerCase()
    const response = await fetch(`/data?collection=${collection}`)
    if (!response.ok) throw new Error(`Failed to fetch list of ${collection}`)
    const documents = await response.json()
    // Set up the table header (columns)
    const response2 = await fetch(`/getSchema?collection=${collection}`)
    if (!response2.ok) throw new Error(`Failed to fetch schema for ${collection}`)
    const schema = await response2.json()
    const columns = Object.keys(schema)
    columns.forEach(attribute => {
        // Add as column header
        const column = document.createElement("th")
        const text = attribute.charAt(0).toUpperCase() + attribute.slice(1)
        column.textContent = text
        column.onclick = () => sortTable(column.cellIndex);
        document.querySelector("table thead tr").appendChild(column)
        // Add to selector
        const option = document.createElement("option")
        option.value = text
        option.textContent = text
        filterSelect.appendChild(option)
    })
        // Delete button column
    const deleteColumn = document.createElement("th")
    deleteColumn.classList.add("delete-column")
    document.querySelector("table thead tr").appendChild(deleteColumn)
    // Iterate over each document in collection
    documents.forEach(data => {
        const row = document.createElement("tr")
        // Add a cell for every attribute
        columns.forEach(attribute => {
            const cell = document.createElement("td")
            cell.textContent = data[attribute]
            row.appendChild(cell)
        })
        // Add delete button
        const deleteCell = document.createElement("td")
        deleteCell.innerHTML = `<i class="fa-solid fa-trash-can"></i>`
        deleteCell.classList.add("delete-column")
        row.appendChild(deleteCell)
        document.querySelector("table tbody").appendChild(row)

        // Add event listener to delete icon
        deleteCell.querySelector("i").addEventListener("click", (event) => {
            // Set relative variables
            const icon = event.currentTarget
            const row = icon.parentElement.parentElement
            const values = []
            row.querySelectorAll("td").forEach(value => {
                if (!value.classList.contains("delete-column")) values.push(value.textContent)
            })
            const keys = values.slice(0, 2)
            // Create the background overlay
            const overlay = document.createElement("div");
            overlay.classList.add("modal-overlay");

            // Create the popup itself
            const popup = document.createElement("div");
            popup.classList.add("modal");

            // Add content
            popup.innerHTML = `
                <h2>Delete ${collection} entry ${values[0]}?</h2>
                <p>Are you sure you want to delete this entry?</p>
                <p>${values.join(" | ")}</p>

                <button class="confirm-delete"
                    onclick='deleteEntry(${JSON.stringify(keys)})'>
                    Delete
                </button>

                <button class="cancel-delete"
                    onclick="document.querySelector('.modal-overlay').remove()">
                    Cancel
                </button>
            `;

            overlay.appendChild(popup);
            document.body.appendChild(overlay);
        })

    })
    sortTable(0)
    buildDatalist()
}

    // Sort the table
// Track the current sort state
let currentColumn = -1;
let ascending = true;

// Sort the table
function sortTable(columnIndex) {

    const tbody = table.querySelector("tbody");

    // Get all rows in the table body
    const rows = Array.from(tbody.querySelectorAll("tr"));

    // Toggle sort direction
    if (currentColumn === columnIndex) {
        ascending = !ascending;
    } else {
        currentColumn = columnIndex;
        ascending = true;
    }

    // Sort the rows
    rows.sort((a, b) => {
        const valueA = a.cells[columnIndex]?.textContent.trim() ?? "";
        const valueB = b.cells[columnIndex]?.textContent.trim() ?? "";

        // Handle empty values
        if (valueA === "" && valueB !== "") return 1;
        if (valueB === "" && valueA !== "") return -1;

        // Compare values
        const comparison = valueA.localeCompare(valueB, undefined, {
            numeric: true,
            sensitivity: "base"
        });

        // Apply sort direction
        return ascending ? comparison : -comparison;
    });

    // Reinsert rows in sorted order
    tbody.append(...rows);
}

function addFilter(){
    // Store value of filter
    const filter = [filterSelect.value, filterInput.value]
    if (filter.some(variable => variable.length === 0)) return
    // Set filter display
    const display = document.createElement("h2")
    display.textContent = ` * Only showing rows where ${filter[0]} = ${filter[1]}`
    filters.appendChild(display)
    // Get index of header
    const headers = [...document.querySelectorAll("table th")]
    const columnIndex = headers.findIndex(header => header.textContent.trim() === filter[0])
    // Remove rows that don't match the filter
    document.querySelectorAll("table tbody tr").forEach(row => {
        if (row.cells[columnIndex].textContent.trim() !== filter[1]) {
            row.remove()
        }
    })
}

async function deleteEntry(keys){
    try {
        document.querySelector('.modal-overlay').remove()
        // Need the collection
        const collection = collectionDisplayer.textContent.toLowerCase()
        // Need the first 2 attributes
        const attributes = document.querySelectorAll("th")
        const keyAttributes = [attributes[0].textContent.toLowerCase(), attributes[1].textContent.toLowerCase()]
        const jsonExport = {
            [keyAttributes[0]]: keys[0],
            [keyAttributes[1]]: keys[1],
        }

        // Save to database
        const response = await fetch(`/delete?collection=${collection}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonExport)
        })

        const result = await response.json()

        if (response.ok) {
            console.log(`Entry deleted!`, result);
            alert(`Entry deleted!`);
            await buildTable(collection)
            sortTable(0)
        } else {
            console.error("Error:", result);
            alert(`Failed to delete entry`);
        }
        
    } catch (error) {
        console.error("Request failed:", error)
        alert("Error: ", error)
    }
    
    
}