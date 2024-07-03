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
for (let i=0; i< document.querySelectorAll(".navbar").length; i++) {
    document.querySelectorAll(".navbar")[i].style.setProperty("background-color", primcolour)
}
document.querySelector(".dropbtn").style.setProperty("background-color", seccolour)
document.querySelector(".dropupbtn").style.setProperty("background-color", primcolour)
document.querySelector(".modal-header").style.setProperty("background-color", primcolour)

let token;
const timenow = Date.now();
const daysw = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const navigationbar = document.getElementsByClassName("navbar bottom")[0];
const modal = document.getElementsByClassName("modal")[0];
const pagecontent = document.getElementById("content");
const navbarclick = document.getElementsByClassName("navbar bottom")[0];
const searchbar = document.getElementById("myInput");
const span = document.getElementsByClassName("close")[0];
const mydropdowns = document.getElementsByClassName("dropbtn");
const mydropups = document.getElementsByClassName("dropupbtn");
const seasonnumber =(new Date()).getMonth();
let theseason
if (seasonnumber < 3) {
    theseason = "WINTER"
} else if (seasonnumber < 6) {
    theseason = "SPRING"
} else if (seasonnumber < 9) {
    theseason = "SUMMER"
} else {
    theseason = "FALL"
}
let allseasons = ["WINTER", "SPRING", "SUMMER", "FALL"];
let currseasonindex = allseasons.indexOf(theseason)

async function main() {
    if (!localStorage.anitoken) {
        window.location = 'login.html'
        return
    } else {
        token = localStorage.anitoken
    }
    await dayactive()
    await pagefill(theseason, (new Date()).getFullYear())
    await addsortbutton()
    await makenavbarwork()
    await spanclose()
    await searchbarfunc()
    await toggledrop(mydropdowns[0])
    await toggledrop(mydropups[0])
    document.querySelector(".navbar a.active").style.setProperty("background-color", seccolour)
}
main()

async function toggledrop(element){
    element.addEventListener('click', function() {
        toggledropdown(this)
    })
}

async function addsortbutton(){
    let dropdownbutts = document.getElementsByClassName("dropup");
    let i;
    for (i=0; i< dropdownbutts.length; i++) {
        Array.from(dropdownbutts[i].children[1].children).forEach(el => {
            el.addEventListener('click', function() {
                pagefill(this.textContent, currseasonindex > allseasons.indexOf(this.textContent) ? (new Date()).getFullYear() + 1: (new Date()).getFullYear() )
            })
        })
    }
}

async function dayactive(){
    for (let i=0; i < navigationbar.children.length; i++) {
        navigationbar.children[i].className = "inactive";
        if (navigationbar.children[i].textContent == daysw[(new Date()).getDay()]) {
            navigationbar.children[i].className = "active";
        }
    }
}

//clickable navbar
async function makenavbarwork() {
    Array.from(navbarclick.children).forEach(el => {
        el.addEventListener('click', function() {
            navbarclicker(this)
        })
    });
}

async function navbarclicker(element) {
    let allcontentitems = document.getElementById("content").children;
    let allnavitems = element.parentNode.children;
    let i;
    for (i=0; i < allnavitems.length; i++) {
        allnavitems[i].className = "inactive";
        allnavitems[i].style.setProperty("background-color", primcolour)
        allcontentitems[i].className = "inactive";
        if (allnavitems[i].textContent == element.textContent) {
            allnavitems[i].className = "active";
            allnavitems[i].style.setProperty("background-color", seccolour)
            allcontentitems[i].className = "active";
        }
    }
}

async function searchbarfunc() {
    searchbar.addEventListener('keyup', function() {
        searching()
    })
}

async function spanclose() {
    span.onclick = function() {
        modal.style.display = "none";
    }
}

async function pagefill(aseason, ayear) {
    mydropups[0].textContent = aseason
    let query = `
    query ($season: MediaSeason, $seasonYear: Int){ # Define which variables will be used in the query (id)
        Page (page: 1, perPage:50) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
            media (season: $season, seasonYear: $seasonYear, type: ANIME) {
                description,
                title {
                    romaji
                },
                id,
                nextAiringEpisode {
                    timeUntilAiring,
                    episode
                },
                coverImage {
                    medium
                },
                mediaListEntry {
                    status
                }
            }
        }
    }
    `;

    let variables = {
        season: aseason,
        seasonYear: ayear
    }

    const url = 'https://graphql.anilist.co',
        options = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        };

    await fetch(url, options).then(handleResponse)
                    .then(handleData)
                    .catch(handleError);
}

async function handleResponse(response) {
    return response.json()
        .then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

async function handleError(error) {
    alert('Error, check console');
    console.error(error);
}

async function handleData(data){
    pagecontent.replaceChildren()
    let days = {"Mon": [], 
        "Tue": [], 
        "Wed":  [], 
        "Thu": [],
        "Fri": [],
        "Sat": [],
        "Sun": [],
        "???": []
    };
    for (i = 0; i < data['data']['Page']['media'].length; i++) {
        if (data['data']['Page']['media'][i]['nextAiringEpisode']) {
            let airday = new Date((timenow / 1000 + data['data']['Page']['media'][i]['nextAiringEpisode']['timeUntilAiring'])*1000).getDay();
            days[daysw[airday]].push(data['data']['Page']['media'][i])
        } else {
            days['???'].push(data['data']['Page']['media'][i])
        }
    }
    for (let key in days) {
        let contenttable = document.createElement("table");
        contenttable.className = "inactive";
        if (key == navigationbar.getElementsByClassName('active')[0].textContent) {
            contenttable.className = "active";
        }
        for (i = 0; i < days[key].length; i++) {
            let myitem = document.createElement("tr");
            myitem.className = "list_item";
            myitem.appendChild(document.createElement("td"))
            myitem.appendChild(document.createElement("td"))
            myitem.appendChild(document.createElement("td"))
            //data
            myitem.dataset.id = days[key][i]['id']
            //item text elements
            let tablezero = myitem.children[0]
            let imagetable = document.createElement("img");
            imagetable.src = days[key][i]['coverImage']['medium'];
            imagetable.loading = (i < 10 ? "eager" : "lazy")
            tablezero.appendChild(imagetable)
            let tableelone = myitem.children[1]
            tableelone.className = "clickable-item"
            tableelone.addEventListener('click', function() {
                clickables(this)
            })
            tableelone.appendChild(document.createElement("p"))
            tableelone.appendChild(document.createElement("p"))
            tableelone.appendChild(document.createElement("p"))
            //title
            let myitemtitle = tableelone.children[0];
            myitemtitle.className = "item_title"
            myitemtitle.textContent = (days[key][i]['mediaListEntry'] ? `\uD83D\uDC41\uFE0F${days[key][i]['title']['romaji']}` : days[key][i]['title']['romaji'])
            //subtitle
            let myitemsubtitle = tableelone.children[1];
            myitemsubtitle.className = "item_subtitle";
            myitemsubtitle.innerHTML = days[key][i]['description'];
            if (myitemsubtitle.textContent != myitemsubtitle.textContent.substring(0, 200)) {
                myitemsubtitle.textContent = `${myitemsubtitle.textContent.substring(0, 200)}...`
            }
            if (key != "???") {
                myitem.dataset.next_ep = days[key][i]['nextAiringEpisode']['timeUntilAiring'];
                let myitemsubsubtitle = tableelone.children[2];
                myitemsubsubtitle.style.fontWeight = "bold";
                myitemsubsubtitle.className = "item_subtitle";
                myitemsubsubtitle.textContent = `Ep ${days[key][i]['nextAiringEpisode']['episode']} airing in ${(days[key][i]['nextAiringEpisode']['timeUntilAiring']/3600).toFixed(0)} hours`
            }
            contenttable.appendChild(myitem);
        }
        if (key != "???"){
            let i, switching, b, shouldSwitch;
            switching = true;
            /* Make a loop that will continue until
            no switching has been done: */
            while (switching) {
                // start by saying: no switching is done:
                switching = false;
                b = contenttable.getElementsByTagName("tr");
                // Loop through all list-items:
                for (i = 0; i < (b.length - 1); i++) {
                    // start by saying there should be no switching:
                    shouldSwitch = false;
                    /* check if the next item should
                    switch place with the current item: */
                        if (parseInt(b[i].getAttribute("data-next_ep")) > parseInt(b[i + 1].getAttribute("data-next_ep"))) {
                        /* if next item is alphabetically
                        lower than current item, mark as a switch
                        and break the loop: */
                        shouldSwitch = true;
                        break;
                    }
                }
                if (shouldSwitch) {
                    /* If a switch has been marked, make the switch
                    and mark the switch as done: */
                    b[i].parentNode.insertBefore(b[i + 1], b[i]);
                    switching = true;
                }
            }
        }   
        pagecontent.appendChild(contenttable)
    }
}


async function clickables(element) {
    let query = `
    query ($id: Int) { # Define which variables will be used in the query (id)
        Media (id: $id, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
            id,
            description (asHtml: true),
            coverImage {
                medium
            }
            title {
                romaji
            },
            mediaListEntry {
                status,
            },
            genres
        }
    }
    `
    let variables = {
        id: parseInt(element.parentNode.dataset.id)
    }
    const url = 'https://graphql.anilist.co'
    let  options = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };
    await fetch(url, options).then(handleResponse)
                       .then(createmodal)
                       .then(adddropdown)
                       .catch(handleError);
    
}

async function createmodal(data) {
    let modalimg = document.getElementsByClassName("image-container")[0];
    let theimg = document.createElement("img");
    theimg.src = data['data']['Media']['coverImage']['medium'];
    theimg.loading = "lazy";
    theimg.style.float = "left";
    theimg.style.paddingRight = "16px";
    theimg.style.height = "auto";
    modalimg.replaceChildren(theimg)
    let modaltitle = document.getElementsByClassName("title-container")[0];
    modaltitle.textContent = `${data['data']['Media']['title']['romaji']}`;
    let modalgenres = document.getElementsByClassName("genres")[0];
    modalgenres.textContent = `${data['data']['Media']['genres']}`.split(',').join(', ');
    let modalbutton = document.getElementsByClassName("dropdown")[0];
    modalbutton.dataset.aniid = data['data']['Media']['id'];
    modalbutton.children[0].textContent =(data['data']['Media']['mediaListEntry'] ? data['data']['Media']['mediaListEntry']['status'] : "ADD")
    let modal_body = document.getElementsByClassName("modal-body")[0];
    modal_body.innerHTML = `<h3>Description</h3><p>${data['data']['Media']['description']}</p>`;
    modal.style.display = 'block';
}


async function adddropdown() {
    let dropdownbutts = document.getElementsByClassName("dropdown-content")[0];
    Array.from(dropdownbutts.children).forEach(el => {
        el.addEventListener('click', function() {
            updatestatus(this)
        })
    });
}


async function searching() {
    let input, filter, tables, tr, td, i, txtValue, thistable;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    tables = document.getElementsByTagName("table");
    for (i = 0; i < tables.length; i++) {
        if (tables[i].className == "active") {
            thistable = tables[i]
        }
    }
    tr = thistable.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }       
    }
}

async function updatestatus(element) {
    element.parentNode.parentNode.children[0].textContent = element.textContent
    let query;
    let variables;
    if (element.textContent == "DELETE") {
        query = `
        mutation ($mediaId: Int) { 
            DeleteListEntry(mediaId: $mediaId) {
                deleted
          }
        }
        `;
    
        variables = {
            mediaId: parseInt(element.parentNode.parentNode.dataset.aniid),
    
        };
    } else {
        query = `
        mutation ($status: MediaListStatus, $mediaId: Int) { 
        anime000: SaveMediaListEntry (mediaId: $mediaId, status: $status) {
                id 
        }
        }
        `;

        variables = {
            mediaId: parseInt(element.parentNode.parentNode.dataset.aniid),
            status: element.textContent,

        };
    }

    const url = 'https://graphql.anilist.co';
    let  options = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };
    await fetch(url, options).then(handleResponse)
                       .catch(handleError);
}

async function toggledropdown(element) {
    element.parentNode.children[1].classList.toggle("show");
}
  
  // When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
    if (!event.target.matches('.dropbtn')) {
        let dropdowns = document.getElementsByClassName("dropdown-content");
        let i;
        for (i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
    if (!event.target.matches('.dropupbtn')) {
        let dropdowns = document.getElementsByClassName("dropup-content");
        let i;
        for (i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}