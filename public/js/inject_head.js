const header = document.createElement("header")
const stylesheet = document.createElement("link")

header.innerHTML = `
<a href="/">Home</a>
<a href="/table">Table</a>
<a href="/wg">Word Generator</a>
`

stylesheet.rel = "stylesheet"
stylesheet.href = "../css/header.css"

const main = document.querySelector("main")
main.parentElement.insertBefore(header, main)
document.head.appendChild(stylesheet)