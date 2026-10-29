const submissionDiv = document.getElementById("submission")
const submitAddition = document.getElementById("submitAddition")

function toggleSubmissionDiv(variant){
    
}

function addMeaning(){
    const reference = document.getElementById("addMeaningReference")
    const newMeaning = document.createElement("input")
    newMeaning.placeholder = "Meaning"
    const newDelete = document.createElement("button")
    newDelete.textContent = "x"
    newDelete.onclick = () => removeMeaning(newDelete);
    reference.parentElement.insertBefore(newMeaning, reference);
    reference.parentElement.insertBefore(newDelete, reference);
}

function removeMeaning(button){
    button.previousElementSibling.remove()
    button.remove()
}

async function submitMorpheme(){
    const meanings = document.querySelectorAll("#addMeanings input")
    let meaningsArray = []
    meanings.forEach(meaning => {
        console.log(meaning)
        if (meaning.value!="") meaningsArray.push(meaning.value.toLowerCase())
    })
    if (meaningsArray.length == 1) meaningsArray = meaningsArray[0]
    console.log(meaningsArray, meaningsArray.length)
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
        } else {
            console.error("Error:", result);

            alert("Failed to save morpheme.");
        }

    } catch (error) {
        console.error("Request failed:", error);

        alert("Could not connect to the server.");
    }
}