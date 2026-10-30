const submissionDiv = document.getElementById("submission")

hideSections()
getMorphemesList()
getWordsList()

// ------------------------------ Page maintenance ------------------------------

function hideSections(){
    const sectionsToHide = document.querySelectorAll("section")
    sectionsToHide.forEach(sectionToHide => {
        sectionToHide.style.display = "none"
    })
}

async function toggleSubmissionDiv(variant){
    if (document.getElementById(variant).style.display == "grid"){
        hideSections()
    } else {
        hideSections()
        document.getElementById(variant).style.display = "grid"
    }
}

async function getMorphemesList(){
    const response = await fetch("/data?type=morphemes-list")
    if (!response.ok) throw new Error("Failed to fetch list of morphemes")
    const morphemes = await response.json()
    let morphemesList = []
    morphemes.forEach(morpheme => {
        morphemesList.push(morpheme.morpheme)
        morphemesList.sort()
    })
    morphemesList.forEach(morpheme => {
        const option = document.createElement("option")
        option.value = morpheme
        document.getElementById("morphemeList").appendChild(option)
    })
}

async function getWordsList(){
    const response = await fetch("/data?type=words-list")
    if (!response.ok) throw new Error("Failed to fetch list of morphemes")
    const words = await response.json()
    let wordsList = []
    words.forEach(word => {
        wordsList.push(word.word)
        wordsList.sort()
    })
    wordsList.forEach(word => {
        const option = document.createElement("option")
        option.value = word
        document.getElementById("wordList").appendChild(option)
    })
}

// ------------------------------ Building ------------------------------

function addOption(specific, reference){
    const newOption = document.createElement("input")
    newOption.placeholder = specific
    if (specific == "Morpheme") newOption.list = "morphemeList"
    const newDelete = document.createElement("button")
    newDelete.textContent = "x"
    newDelete.onclick = () => removeOption(newDelete);
    reference.parentElement.insertBefore(newOption, reference);
    reference.parentElement.insertBefore(newDelete, reference);
}

function removeOption(button){
    button.previousElementSibling.remove()
    button.remove()
}

// ------------------------------ Saving ------------------------------

async function submitMorpheme(button){
    const meanings = document.querySelectorAll("#morpheme div input")
    let meaningsArray = []
    meanings.forEach(meaning => {
        if (meaning.value!="") meaningsArray.push(meaning.value.toLowerCase())
    })
    if (meaningsArray.length == 1) meaningsArray = meaningsArray[0]
    
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
        const response = await fetch("/save-morpheme", {
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

async function submitWord(){
    const divs = document.querySelectorAll("#word div")
    let morphemesArray = []
    divs[0].querySelectorAll("input").forEach(morpheme => {
        if (morpheme.value!="") morphemesArray.push(morpheme.value.toLowerCase())
    })
    if (morphemesArray.length == 1) morphemesArray = morphemesArray[0]
    let meaningsArray = []
    divs[1].querySelectorAll("input").forEach(meaning => {
        if (meaning.value!="") meaningsArray.push(meaning.value.toLowerCase())
    })
    if (meaningsArray.length == 1) meaningsArray = meaningsArray[0]

    const wordSave = {
        word: document.getElementById("wordInput").value.toLowerCase(),
        structure: document.getElementById("structure").value.toLowerCase(),
        class: document.getElementById("class").value.toLowerCase(),
        function: document.getElementById("function").value.toLowerCase(),
        morphemes: morphemesArray,
        meaning: meaningsArray
    }

    try {
        const response = await fetch("/save-word", {
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