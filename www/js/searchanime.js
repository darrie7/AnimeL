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

async function setPrimaryColour(){
    document.querySelectorAll(".primary").forEach(element => {
        element.style.setProperty("background-color", primcolour)
    })
}

async function setSecondaryColour(){
    document.querySelectorAll(".secondary").forEach(element => {
        element.style.setProperty("background-color", seccolour)
    })
}

let token;
const modal = document.getElementsByClassName("modal")[0];
let searchbutton = document.getElementById("search_anime_button")
const table = document.querySelector("table");

const url = 'https://graphql.anilist.co';

async function main() {
    if (!localStorage.anitoken) {
        window.location = 'login.html'
        return
    } else {
        token = localStorage.anitoken
    }
    setPrimaryColour()
    setSecondaryColour()
    searchbutton.addEventListener('click', async function() {
        const searchestring = document.getElementById("search_anime").value;
        pagefill(searchestring)
    })
    toggledrop(document.getElementsByClassName("dropbtn")[0])
    adddropdown()
}
main()


async function pagefill(searchstring) {
    let data = []
    let lastpage = 100
    let currentpage = 1
    while (lastpage >= currentpage) {
        let query = `
        query ($search: String){ # Define which variables will be used in the query (id)
            Page (page: 1, perPage:50) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
                pageInfo {
                    lastPage
                }
                media (search: $search, type: ANIME) {
                    description,
                    genres,
                    episodes,
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
                        status,
                        progress,
                        notes
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

        fetched = await fetch(url, options).catch(handleError);
        fetchedjson = await fetched.json()
        data.push(fetchedjson)
        currentpage += 1
        lastpage = fetchedjson['data']['Page']['pageInfo']['lastPage']
    }
    table.replaceChildren()
    handleData(data)
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
    let searchitems = []
    let fragment = document.createDocumentFragment()
    data.forEach(list => {
        let listentry = list['data']['Page']['media']
        listentry.forEach(entry => {
            searchitems.push(entry)
            let myitem = document.createElement("tr");
            myitem.className = "list_item";
            myitem.dataset.id = entry['id']
            myitem.addEventListener('click', async function() {
                clickables(this)
            })

            let tablezero = document.createElement("div");
            let imagetable = document.createElement("img");
            imagetable.src = entry['coverImage']['medium'];
            imagetable.loading = "lazy";

            tablezero.appendChild(imagetable)

            let tableelone = document.createElement("div");
            tableelone.className = "clickable-item"


            //title
            let myitemtitle = document.createElement("p")
            myitemtitle.className = "item_title"
            myitemtitle.textContent = (entry['mediaListEntry'] ? `\uD83D\uDC41\uFE0F${entry['title']['romaji']}` : entry['title']['romaji'])
            
            //subtitle
            let myitemsubtitle = document.createElement("p")
            myitemsubtitle.className = "item_subtitle";
            myitemsubtitle.innerHTML = entry['description']

            tableelone.appendChild(myitemtitle)
            tableelone.appendChild(myitemsubtitle)
            myitem.appendChild(tablezero)
            myitem.appendChild(tableelone)
            fragment.appendChild(myitem)
        })
    })
    table.appendChild(fragment)
    localStorage.setItem('searchitems', JSON.stringify(searchitems))
}

async function findObjectByIdWithDay(data, targetId) {
    let found
    for (const objects of data) {
        if (objects.id == targetId) {
            found = objects
            break
        }
    }
    return found ? found : null ;
}


async function clickables(element) {
    let stored_data = JSON.parse(localStorage['searchitems'])
    clicked = await findObjectByIdWithDay(stored_data, parseInt(element.dataset.id))
    let modalimg = document.getElementsByClassName("image-container")[0];
    let theimg = document.createElement("img");
    theimg.src = clicked['coverImage']['medium'];
    theimg.loading = "lazy";
    theimg.style.float = "left";
    theimg.style.paddingRight = "16px";
    theimg.style.height = "auto";
    modalimg.replaceChildren(theimg)
    let modaltitle = document.getElementsByClassName("title-container")[0];
    modaltitle.textContent = `${clicked['title']['romaji']}`;
    let modalgenres = document.getElementsByClassName("genres")[0];
    modalgenres.textContent = `${clicked['genres']}`.split(',').join(', ');
    let modalbutton = document.getElementsByClassName("dropdown")[0];
    modalbutton.dataset.aniid = clicked['id'];
    modal.querySelector('.dropbtn').textContent =(clicked['mediaListEntry'] ? clicked['mediaListEntry']['status'] : "ADD")
    let notesform = document.querySelectorAll('#notesform .formtext')
    notesform[0].value = (clicked['mediaListEntry'] ? clicked['mediaListEntry']['notes'] : "")
    notesform[1].value = (clicked['mediaListEntry'] ? clicked['mediaListEntry']['progress']: 0)
    let savebutton = document.getElementById('formbutton')
    savebutton.onclick = async function() {updatenotes(this)}
    let modal_body = document.getElementsByClassName("modal-body")[0];
    modal_body.children[0].innerHTML = `<h3>Description</h3><p>${clicked['description']}</p>`;
    modal.style.display = 'block';
}


async function updatenotes(element) {
    let tableentry = document.querySelector((`[data-id='${element.parentNode.dataset.aniid}']`))
    let notesform = document.querySelectorAll('#notesform .formtext')
    tableentry.dataset.progress = parseInt(notesform[1].value)
    tableentry.querySelector('.item_title').textContent = `\uD83D\uDC41\uFE0F${tableentry.querySelector('.item_title').textContent}`
    if ((parseInt(tableentry.dataset.next_ep_nr)-parseInt(tableentry.dataset.progress)) > 1) {
        tableentry.style.backgroundColor = tricolour
    } else {
        tableentry.style.backgroundColor = "#FFFFFF"
    }
    let query = `
    mutation ($notes: String, $mediaId: Int, $progress: Int, $status: MediaListStatus) { 
      anime000: SaveMediaListEntry (mediaId: $mediaId, notes: $notes, progress: $progress, status: $status) {
            id 
      }
    }
    `;

    let variables = {
        mediaId: parseInt(element.parentNode.dataset.aniid),
        notes: notesform[0].value,
        progress: parseInt(notesform[1].value),
        status: document.getElementsByClassName("dropbtn")[0].textContent

    };

    let options = {
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
    showToast(`${tableentry.querySelector('.item_title').textContent} status updated`)

    let searchitems = JSON.parse(localStorage['searchitems'])
    updatedItem = searchitems.find(item => item['id'] == element.parentNode.dataset.aniid)

    if (!updatedItem['mediaListEntry']) {
        updatedItem['mediaListEntry'] = {}
    }
    updatedItem['mediaListEntry']['status'] = document.getElementsByClassName("dropbtn")[0].textContent.toLowerCase()
    updatedItem['mediaListEntry']['progress'] = updatedItem['mediaListEntry']['progress'] ? updatedItem['mediaListEntry']['progress'] : 0
    updatedItem['mediaListEntry']['updatedAt'] = updatedItem['mediaListEntry']['updatedAt'] ? updatedItem['mediaListEntry']['updatedAt'] : Date.now()
    updatedItem['mediaListEntry']['createdAt'] = updatedItem['mediaListEntry']['createdAt'] ? updatedItem['mediaListEntry']['createdAt'] : Date.now()
    if (!updatedItem['mediaListEntry']['startedAt']) {
        updatedItem['mediaListEntry']['startedAt'] = {}
    }
    updatedItem['mediaListEntry']['startedAt']['year'] = updatedItem['mediaListEntry']['startedAt']['year'] ? updatedItem['mediaListEntry']['startedAt']['year'] : (new Date()).getFullYear
    updatedItem['mediaListEntry']['startedAt']['month'] = updatedItem['mediaListEntry']['startedAt']['month'] ? updatedItem['mediaListEntry']['startedAt']['month'] : (new Date()).getMonth + 1
    updatedItem['mediaListEntry']['startedAt']['day'] = updatedItem['mediaListEntry']['startedAt']['day'] ? updatedItem['mediaListEntry']['startedAt']['day'] : (new Date()).getDate

    let tempItem = {'media': null}
    tempItem['media'] = updatedItem

    let updatelist = JSON.parse(localStorage[`anime_${document.getElementsByClassName("dropbtn")[0].textContent.toLowerCase()}`])
    updatelist.push(tempItem)
    localStorage[`anime_${document.getElementsByClassName("dropbtn")[0].textContent.toLowerCase()}`] = JSON.stringify(updatelist)

    fetch(url, options).then(handleResponse)
                       .catch(handleError);
}

async function adddropdown() {
    let dropdownbutts = document.getElementsByClassName("dropdown-content")[0];
    let statusbutton = document.getElementsByClassName("dropbtn")[0];
    Array.from(dropdownbutts.children).forEach(el => {
        el.addEventListener('click', async function() {
            statusbutton.textContent = this.textContent
            if (dropdownbutts.classList.contains('show')) {
                dropdownbutts.classList.remove('show')
            }
        })
    });
}

async function toggledrop(element){
    element.addEventListener('click', async function() {
        toggledropdown(this)
    })
}

async function toggledropdown(element) {
    element.parentNode.children[1].classList.toggle("show");
}

async function showToast(message) {
    const toast = document.querySelector('.toast');
    toast.style.backgroundColor = seccolour
    toast.textContent = message;
    toast.style.display = 'block'

    setTimeout(() => {
        toast.style.display = 'none'
    }, 2000);
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
window.ontouchstart = async function(event) {
    if (!event.target.matches('.dropdown-content a') && !event.target.matches('.dropbtn')) {
        // document.getElementById("MyDropdown").classList.toggle("show");
        let dropdowns = document.getElementsByClassName("dropdown-content")[0];
        if (dropdowns.classList.contains('show')) {
            dropdowns.classList.remove('show')
        }
    }
}
