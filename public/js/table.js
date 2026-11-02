// 
const table = document.querySelector("table")

// Fill the table with data
async function buildTable(button){
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
    const process = await response.json()
    // Set up the table header (columns)
    const attributes = Object.keys(process[0])
    attributes.forEach(attribute => {
        const column = document.createElement("th")
        column.textContent = attribute.charAt(0).toUpperCase() + attribute.slice(1)
        column.onclick = () => sortTable(column.cellIndex);
        document.querySelector("table thead tr").appendChild(column)
    })
    // Add elements to the thing
    process.forEach(element => {
        const row = document.createElement("tr")
        // Add a cell for every attribute
        attributes.forEach(attribute => {
            const cell = document.createElement("td")
            cell.textContent = element[attribute]
            row.appendChild(cell)
        })
        document.querySelector("table tbody").appendChild(row)
    })
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