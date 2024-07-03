let primcolour;
let seccolour;
if (!localStorage.primcolour) {
    primcolour = "#000000"
} else {
    primcolour = localStorage.primcolour
}
if (!localStorage.seccolour) {
    seccolour = "#3b3535"
} else {
    seccolour = localStorage.seccolour
}
document.querySelector(".header").style.setProperty("background-color", primcolour)
document.querySelector(".navbar").style.setProperty("background-color", primcolour)
document.querySelector("#submitbutton").style.setProperty("background-color", primcolour)
document.querySelector("#urlbutton").style.setProperty("background-color", seccolour)

const pricolorPicker = document.getElementById('primarycolourPicker')
const seccolorPicker = document.getElementById('secondarycolourPicker')
const tricolorPicker = document.getElementById('tripondarycolourPicker')
const anilistbutton = document.getElementById("submitbutton")

pricolorPicker.addEventListener('input', function() {
    // Get the selected color
    const selectedColor = pricolorPicker.value;
    localStorage.primcolour = selectedColor
    primcolour = localStorage.primcolour

    document.querySelector(".header").style.setProperty("background-color", primcolour)
    document.querySelector(".navbar").style.setProperty("background-color", primcolour)
    document.querySelector("#submitbutton").style.setProperty("background-color", primcolour)
    document.querySelector("#urlbutton").style.setProperty("background-color", seccolour)
})
seccolorPicker.addEventListener('input', function() {
    // Get the selected color
    const selectedColor = seccolorPicker.value;
    localStorage.seccolour = selectedColor  
    seccolour = localStorage.seccolour
    document.querySelector("#urlbutton").style.setProperty("background-color", seccolour)
})
tricolorPicker.addEventListener('input', function() {
    // Get the selected color
    const selectedColor = tricolorPicker.value;
    localStorage.tricolour = selectedColor;
})

anilistbutton.addEventListener('click', function() {
    url = document.getElementById("numb").value
    const urlParams = new URLSearchParams(url.split('#')[1]);
    localStorage.anitoken = urlParams.get("access_token")
    document.getElementById("numb").value = "Access token has been entered"
})