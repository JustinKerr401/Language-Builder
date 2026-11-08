// DOM objects
const table = document.querySelector("table")
const filterSelect = document.getElementById("filterSelect")
const filterInput = document.getElementById("filterInput")
const theDatalist = document.getElementById("theDatalist")
const filters = document.getElementById("filters")

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
async function buildTable(button){
    // Clear objects
    filterSelect.innerHTML = ""
    filters.innerHTML = ""
    filterInput.value = ""
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
    const collection = button.textContent.toLowerCase()
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
    // Iterate over each document in collection
    documents.forEach(data => {
        const row = document.createElement("tr")
        // Add a cell for every attribute
        columns.forEach(attribute => {
            const cell = document.createElement("td")
            cell.textContent = data[attribute]
            row.appendChild(cell)
        })
        document.querySelector("table tbody").appendChild(row)
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
    console.log("Sorting column:", columnIndex);

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
    filter.forEach(variable => {
        if (variable.length == 0) return
    })
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