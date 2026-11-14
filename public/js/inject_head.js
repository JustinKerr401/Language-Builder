const header = document.createElement("header")
const stylesheet = document.createElement("link")
const fonts = document.createElement("link")

header.innerHTML = `
<a href="/">Home</a>
<a href="/le">Language Editor</a>
<a href="/table">Table</a>
`

stylesheet.rel = "stylesheet"
stylesheet.href = "../css/header.css"

fonts.rel = "stylesheet"
fonts.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"

const main = document.querySelector("main")
main.parentElement.insertBefore(header, main)
document.head.appendChild(stylesheet)
document.head.appendChild(fonts)