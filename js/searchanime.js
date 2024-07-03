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
document.querySelector(".dropbtn").style.setProperty("background-color", seccolour)
document.querySelector(".modal-header").style.setProperty("background-color", primcolour)
document.querySelector("#search_anime_button").style.setProperty("background-color", primcolour)
document.querySelector(".formbutton").style.setProperty("background-color", seccolour)

let token;
const modal = document.getElementsByClassName("modal")[0];
const pagecontent = document.getElementById("content");
const span = document.getElementsByClassName("close")[0];
let searchbutton = document.getElementById("search_anime_button")

async function main() {
    if (!localStorage.anitoken) {
        window.location = 'login.html'
        return
    } else {
        token = localStorage.anitoken
    }
    await spanclose()
    searchbutton.addEventListener('click', function() {
        const searchestring = document.getElementById("search_anime").value;
        pagefill(searchestring)
    })
    
}
main()

async function spanclose() {
    span.onclick = function() {
        modal.style.display = "none";
    }
}

async function pagefill(searchstring) {
    let query = `
    query ($search: String){ # Define which variables will be used in the query (id)
        Page (page: 1, perPage:50) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
            media (search: $search, type: ANIME) {
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
        search: searchstring,
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
    let contenttable = document.createElement("table");
    contenttable.className = "active";
    for (i = 0; i < data['data']['Page']['media'].length; i++) {
        let myitem = document.createElement("tr");
        myitem.className = "list_item";
        myitem.appendChild(document.createElement("td"))
        myitem.appendChild(document.createElement("td"))
        myitem.appendChild(document.createElement("td"))
        //data
        myitem.dataset.id = data['data']['Page']['media'][i]['id']
        //item text elements
        let tablezero = myitem.children[0]
        let imagetable = document.createElement("img");
        imagetable.src = data['data']['Page']['media'][i]['coverImage']['medium'];
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
        myitemtitle.textContent = (data['data']['Page']['media'][i]['mediaListEntry'] ? `\uD83D\uDC41\uFE0F${data['data']['Page']['media'][i]['title']['romaji']}` : data['data']['Page']['media'][i]['title']['romaji'])
        //subtitle
        let myitemsubtitle = tableelone.children[1];
        myitemsubtitle.className = "item_subtitle";
        myitemsubtitle.innerHTML = data['data']['Page']['media'][i]['description'];
        if (myitemsubtitle.textContent != myitemsubtitle.textContent.substring(0, 200)) {
            myitemsubtitle.textContent = `${myitemsubtitle.textContent.substring(0, 200)}...`
        }
        contenttable.appendChild(myitem);
    }
    pagecontent.appendChild(contenttable)
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
                notes,
                progress
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
    let notesform = document.getElementById('notesform')
    notesform.children[0].value = (data['data']['Media']['mediaListEntry'] ? data['data']['Media']['mediaListEntry']['notes'] : "")
    notesform.children[1].value = (data['data']['Media']['mediaListEntry'] ? data['data']['Media']['mediaListEntry']['progress']: 0)
    notesform.children[2].onclick = function() {updatenotes(this)}
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