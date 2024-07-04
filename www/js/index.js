//Colour stuff
let primcolour;
let seccolour;
let tricolour;
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
if (!localStorage.tricolour) {
    tricolour = "#FFEEEE"
} else {
    tricolour = localStorage.tricolour
}
document.querySelector(".header").style.setProperty("background-color", primcolour)
for (let i=0; i< document.querySelectorAll(".navbar").length; i++) {
    document.querySelectorAll(".navbar")[i].style.setProperty("background-color", primcolour)
}
document.querySelector(".navbar").style.setProperty("background-color", primcolour)
document.querySelector(".dropbtn").style.setProperty("background-color", seccolour)
document.querySelector(".dropupbtn").style.setProperty("background-color", primcolour)
document.querySelector(".modal-header").style.setProperty("background-color", primcolour)
document.querySelector(".formbutton").style.setProperty("background-color", seccolour)
document.querySelector(".navbar a.active").style.setProperty("background-color", seccolour)

let token;
let viewerId;
const modal = document.getElementsByClassName("modal")[0];
const navbarclick = document.getElementsByClassName("navbar bottom")[0];
const table = document.querySelector("table");
const url = 'https://graphql.anilist.co';
main()

//populate page and make everything work
async function main() {
    if (!localStorage.anitoken) {
        window.location = 'login.html'
        return
    } else {
        token = localStorage.anitoken
    }
    if (!localStorage.getItem('viewerId')) {
        await getviewerid()
    } 
    viewerId = localStorage.viewerId
    if (!localStorage.getItem(`anime_current`) || localStorage.getItem('LastUpdated')+1800000 < Date.now()) {
        await fillpage()
    }
    table.replaceChildren()
    const buttonArray = Array.from(navbarclick.children);     
    for (const button of buttonArray) {
        if (button.className === "active") {
            await sortList(localStorage[button.textContent.toLowerCase()] ? localStorage[button.textContent.toLowerCase()] : "Title asc", `anime_${button.textContent.toLowerCase()}`)
            datahandler(JSON.parse(localStorage[`anime_${button.textContent.toLowerCase()}`]))
        }
        sortList(localStorage[button.textContent.toLowerCase()] ? localStorage[button.textContent.toLowerCase()] : "Title asc", `anime_${button.textContent.toLowerCase()}`)
    }
    makenavbarwork()
    addsortbutton()
    searchbarfunc()
    toggledrop(document.getElementsByClassName("dropupbtn")[0])
    toggledrop(document.getElementsByClassName("dropbtn")[0])
    spanclose()
}


async function getviewerid() {
    const query = `
      query {
        Viewer {
          id
        }
      }
    `;
    
    const url = 'https://graphql.anilist.co';
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.anitoken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query })
    };
  
    response = await fetch(url, options).catch(handleError);
    data = await response.json()
    localStorage.setItem('viewerId', data.data.Viewer.id)
}

async function toggledrop(element){
    element.addEventListener('click', async function() {
        toggledropdown(this)
    })
}

//sort button
async function toggledropdown(element) {
    element.parentNode.children[1].classList.toggle("show");
}

async function searchbarfunc() {
    const searchbar = document.getElementById("myInput");
    searchbar.addEventListener('keyup', async function() {
        searching()
    })
}


async function addsortbutton() {
    let options = document.querySelectorAll('.dropup-content input[type="radio"]');
    options.forEach(option => {
        if (option.value === localStorage[table.id]) {
            option.checked = true
        }
        option.addEventListener('click', async function() {
            const activeElement = document.querySelector('.navbar.bottom .active');
            localStorage.setItem(activeElement.textContent.toLowerCase(), this.value)
            table.replaceChildren()
            await sortList(this.value, `anime_${activeElement.textContent.toLowerCase()}`)
            datahandler(JSON.parse(localStorage[`anime_${activeElement.textContent.toLowerCase()}`]))
            setselectedsort(localStorage[activeElement.textContent.toLowerCase()])
        })
    });
}

async function setselectedsort(element) {
    let options = document.querySelectorAll('.dropup-content input[type="radio"]');
    options.forEach(option => {
        if (option.value === element) {
            option.checked = true
        } else {
            option.checked = false
        }
    })
}

async function makenavbarwork(){
    Array.from(navbarclick.children).forEach(el => {
        el.addEventListener('click', function() {
            navbarclicker(this)
        })
    });
}

async function navbarclicker(element) {
    if (element.className === "active") {
        return
    }
    let allnavitems = element.parentNode.children;
    for (let i=0; i < allnavitems.length; i++) {
        allnavitems[i].className = "inactive";
        allnavitems[i].style.setProperty("background-color", primcolour)
        if (allnavitems[i].textContent === element.textContent) {
            element.className = "active"
            element.style.setProperty("background-color", seccolour)
        }
    }
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;
    table.replaceChildren()
    datahandler(JSON.parse(localStorage[`anime_${element.textContent.toLowerCase()}`]))
    setselectedsort(localStorage[element.textContent.toLowerCase()])
}

async function spanclose() {
    const span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
        modal.style.display = "none";
    }
}


//page content
async function fillpage() {
    let query = `
        query ($userId: Int, $forcecomp: Boolean) { 
                MediaListCollection (userId: $userId, type: ANIME, forceSingleCompletedList: $forcecomp) {
                    lists {
                        entries {
                            media {
                                coverImage {
                                    medium
                                }
                                id
                                episodes
                                title {
                                    romaji
                                }
                                nextAiringEpisode {
                                    timeUntilAiring
                                    episode
                                }
                                mediaListEntry {
                                    score,
                                    status,
                                    progress,
                                    updatedAt,
                                    createdAt
                                    startedAt {
                                        year,
                                        month,
                                        day
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;
    let variables = {
        userId: localStorage.viewerId,
        forcecomp: true
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
    response = await fetch(url, options).catch(handleError);
    data = await response.json()
    splitdata(data)
    // localStorage.setItem('AnimeLists', JSON.stringify(data))
    localStorage.setItem('LastUpdated', Date.now())
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

async function plusone(element) {
    element.parentNode.dataset.progress = parseInt(element.parentNode.dataset.progress) + 1;
    element.parentNode.children[1].children[1].textContent = `${element.parentNode.dataset.progress}/${element.parentNode.dataset.episodes} episodes`;
    if ((parseInt(element.parentNode.dataset.next_ep_nr)-parseInt(element.parentNode.dataset.progress)) > 1) {
        element.parentNode.style.backgroundColor = tricolour
    } else {
        element.parentNode.style.backgroundColor = "#FFFFFF"
    }
    let query = `
    mutation ($progress: Int, $mediaId: Int) { 
      anime000: SaveMediaListEntry (mediaId: $mediaId, progress: $progress) {
            id 
      }
    }
    `;

    let variables = {
        progress: parseInt(element.parentNode.dataset.progress),
        mediaId: parseInt(element.parentNode.dataset.id),

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

    fetch(url, options).then(handleResponse)
                       .catch(handleError);
}

async function splitdata(data) {
    let mediaList = data['data']['MediaListCollection']['lists'];
    const statuses = ["current", "planning", "paused", "completed"]
    statuses.forEach(status => {
        let entries = []
        for (let i = 0; i < mediaList.length; i++) {
            let listWithinmedialist = mediaList[i]['entries']
            for (let j = 0; j < listWithinmedialist.length; j++) {
                if (listWithinmedialist[j]['media']['mediaListEntry']['status'] != status.toUpperCase()) {
                    continue
                }
                entries.push(listWithinmedialist[j])
            }
        }
        localStorage.setItem(`anime_${status}`, JSON.stringify(entries))
    });
}

async function sortList(sortmeth, animelist) {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;
    let entries = JSON.parse(localStorage[animelist])
    if (sortmeth == "Next release asc") {
        entries.sort((a, b) => {
            if (a["media"]["nextAiringEpisode"] !== null && b["media"]["nextAiringEpisode"] !== null) {
                // Both have age, sort by age
                if (a["media"]["nextAiringEpisode"]["timeUntilAiring"] === b["media"]["nextAiringEpisode"]["timeUntilAiring"]) {
                    return a["media"]["title"]["romaji"].localeCompare(b["media"]["title"]["romaji"]);
                }
                return a["media"]["nextAiringEpisode"]["timeUntilAiring"] - b["media"]["nextAiringEpisode"]["timeUntilAiring"];
            } else if (a["media"]["nextAiringEpisode"] !== null) {
                // a has age, b does not, a comes first
                return -1;
            } else if (b["media"]["nextAiringEpisode"] !== null) {
                // b has age, a does not, b comes first
                return 1;
            } else {
                // Neither has age, sort by name
                return b['media']['mediaListEntry']["updatedAt"] - a['media']['mediaListEntry']["updatedAt"];
            }
        })
    } else if (sortmeth == "Title asc") {
        entries.sort((a, b) => a["media"]["title"]["romaji"].localeCompare(b["media"]["title"]["romaji"])) 
    } else if (sortmeth == "Title desc") {
        entries.sort((a, b) => b["media"]["title"]["romaji"].localeCompare(a["media"]["title"]["romaji"]))  
    } else if (sortmeth == "Updated asc") {
        entries.sort((a, b) => a['media']['mediaListEntry']["updatedAt"] - b['media']['mediaListEntry']["updatedAt"])  
    } else if (sortmeth == "Updated desc") {
        entries.sort((a, b) => b['media']['mediaListEntry']["updatedAt"] - a['media']['mediaListEntry']["updatedAt"])  
    } else if (sortmeth == "Time added asc") {
        entries.sort((a, b) => a['media']['mediaListEntry']["createdAt"] - b['media']['mediaListEntry']["createdAt"])  
    } else if (sortmeth == "Time added desc") {
        entries.sort((a, b) => b['media']['mediaListEntry']["createdAt"] - a['media']['mediaListEntry']["createdAt"])  
    } else if (sortmeth == "Started asc") {
        entries.sort((a, b) => {
            if (a['media']['mediaListEntry']["startedAt"]["year"] === b['media']['mediaListEntry']["startedAt"]["year"]) {
                if (a['media']['mediaListEntry']["startedAt"]["month"] === b['media']['mediaListEntry']["startedAt"]["month"]) {
                    return a['media']['mediaListEntry']["startedAt"]["day"] - b['media']['mediaListEntry']["startedAt"]["day"]
                }
                return a['media']['mediaListEntry']["startedAt"]["month"] - b['media']['mediaListEntry']["startedAt"]["month"]
            }
            return a['media']['mediaListEntry']["startedAt"]["year"] - b['media']['mediaListEntry']["startedAt"]["year"]
        })  
    } else if (sortmeth == "Started desc") {
        entries.sort((a, b) => {
            if (a['media']['mediaListEntry']["startedAt"]["year"] === b['media']['mediaListEntry']["startedAt"]["year"]) {
                if (a['media']['mediaListEntry']["startedAt"]["month"] === b['media']['mediaListEntry']["startedAt"]["month"]) {
                    return b['media']['mediaListEntry']["startedAt"]["day"] - a['media']['mediaListEntry']["startedAt"]["day"]
                }
                return b['media']['mediaListEntry']["startedAt"]["month"] - a['media']['mediaListEntry']["startedAt"]["month"]
            }
            return b['media']['mediaListEntry']["startedAt"]["year"] - a['media']['mediaListEntry']["startedAt"]["year"]
        })
    } else if (sortmeth == "Score asc") {
        entries.sort((a, b) => {
            if (a['media']['mediaListEntry']["score"] !== null && b['media']['mediaListEntry']["score"] !== null) {
                // Both have age, sort by age
                if (a['media']['mediaListEntry']["score"] === b['media']['mediaListEntry']["score"]) {
                    return a["media"]["title"]["romaji"].localeCompare(b["media"]["title"]["romaji"]);
                }
                return a['media']['mediaListEntry']["score"] - b['media']['mediaListEntry']["score"];
            } else if (a['media']['mediaListEntry']["score"] !== null) {
                // a has age, b does not, a comes first
                return -1;
            } else if (b['media']['mediaListEntry']["score"] !== null) {
                // b has age, a does not, b comes first
                return 1;
            } else {
                // Neither has age, sort by name
                return a["media"]["title"]["romaji"].localeCompare(b["media"]["title"]["romaji"]);
            }
        })
    } else if (sortmeth == "Score desc") {
        entries.sort((a, b) => {
            if (a['media']['mediaListEntry']["score"] !== null && b['media']['mediaListEntry']["score"] !== null) {
                // Both have age, sort by age
                if (a['media']['mediaListEntry']["score"] === b['media']['mediaListEntry']["score"]) {
                    return a["media"]["title"]["romaji"].localeCompare(b["media"]["title"]["romaji"]);
                }
                return b['media']['mediaListEntry']["score"] - a['media']['mediaListEntry']["score"];
            } else if (a['media']['mediaListEntry']["score"] !== null) {
                // a has age, b does not, a comes first
                return -1;
            } else if (b['media']['mediaListEntry']["score"] !== null) {
                // b has age, a does not, b comes first
                return 1;
            } else {
                // Neither has age, sort by name
                return b["media"]["title"]["romaji"].localeCompare(a["media"]["title"]["romaji"]);
            }
        })
    }
    localStorage.setItem(animelist, JSON.stringify(entries))
}


async function datahandler(filteredandsortedentries) {
    for (let i = 0; i < filteredandsortedentries.length; i++) {
        let myitem = document.createElement("tr");
        myitem.appendChild(document.createElement("td"))
        myitem.appendChild(document.createElement("td"))
        myitem.appendChild(document.createElement("td"))
        myitem.className = "list_item";
        //data
        myitem.dataset.id = filteredandsortedentries[i]['media']['id'];
        myitem.dataset.progress = filteredandsortedentries[i]['media']['mediaListEntry']["progress"];
        myitem.dataset.episodes = filteredandsortedentries[i]['media']['episodes'] ? filteredandsortedentries[i]['media']['episodes'] : "?";
        //item text elements
        let tablezero = myitem.children[0]
        let imagetable = document.createElement("img");
        imagetable.src = filteredandsortedentries[i]['media']['coverImage']['medium'];
        imagetable.loading = "lazy"
        tablezero.appendChild(imagetable)
        //myitem.appendChild(tablezero)
        let tableelone = myitem.children[1]
        tableelone.appendChild(document.createElement("p"))
        tableelone.appendChild(document.createElement("p"))
        tableelone.appendChild(document.createElement("p"))
        tableelone.className = "clickable-item"
        tableelone.addEventListener('click', async function() {
            clickables(this)
        })
        //title
        let myitemtitle = tableelone.children[0];
        myitemtitle.className = "item_title"
        myitemtitle.textContent = filteredandsortedentries[i]['media']['title']['romaji'];
        //subtitle
        let myitemsubtitle = tableelone.children[1];
        myitemsubtitle.className = "item_subtitle"
        myitemsubtitle.textContent = `${myitemtitle.parentNode.parentNode.dataset.progress}/${myitemtitle.parentNode.parentNode.dataset.episodes} episodes`
        //subsubtitle
        let myitemsubsubtitle = tableelone.children[2];
        myitemsubsubtitle.className = "item_subtitle";
        myitemsubsubtitle.style.fontWeight = "bold";
        if (filteredandsortedentries[i]['media']['nextAiringEpisode']) {
            myitem.dataset.next_ep = filteredandsortedentries[i]['media']['nextAiringEpisode']['timeUntilAiring'];
            myitem.dataset.next_ep_nr = filteredandsortedentries[i]['media']['nextAiringEpisode']['episode']
            myitemsubsubtitle.textContent = `Ep ${filteredandsortedentries[i]['media']['nextAiringEpisode']['episode']} airing in ${(filteredandsortedentries[i]['media']['nextAiringEpisode']['timeUntilAiring']/3600).toFixed(0)} hours`
            if ((parseInt(myitem.dataset.next_ep_nr)-parseInt(myitem.dataset.progress)) > 1) {
                myitem.style.backgroundColor = tricolour
            }
        } else {
            myitem.dataset.next_ep = 999999999999999;
            myitemsubsubtitle.textContent = 'Finished';
        };
        //item +1 element
        if (table.id != "completed") {
            let tableeltwo = myitem.children[2]
            tableeltwo.addEventListener('click', async function() {
                plusone(this)
            })
            tableeltwo.className = "update1";
            tableeltwo.textContent = "+1";
        }
        table.appendChild(myitem)
    }
}

async function searching() {
    let input, filter, tables, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    tables = document.getElementsByTagName("table");
    thistable = Array.from(tables).concat();
    tr = document.getElementsByTagName("tr");
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


async function clickables(element) {
    let query = `
    query ($id: Int) { # Define which variables will be used in the query (id)
        Media (id: $id, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
            id,
            description (asHtml: false),
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

    fetch(url, options).then(handleResponse)
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
    notesform.children[2].onclick = async function() {updatenotes(this)}
    let modal_body = document.getElementsByClassName("modal-body")[0];
    modal_body.innerHTML = `<h3>Description</h3><p>${data['data']['Media']['description']}</p>`;
    modal.style.display = 'block';
}

async function updatenotes(element) {
    let tableentry = document.querySelector((`[data-id='${element.parentNode.parentNode.children[2].dataset.aniid}']`))
    tableentry.dataset.progress = parseInt(element.parentNode.children[1].value)
    tableentry.children[1].children[1].textContent = `${tableentry.dataset.progress}/${tableentry.dataset.episodes} episodes`
    if ((parseInt(tableentry.dataset.next_ep_nr)-parseInt(tableentry.dataset.progress)) > 1) {
        tableentry.style.backgroundColor = tricolour
    } else {
        tableentry.style.backgroundColor = "#FFFFFF"
    }
    let query = `
    mutation ($notes: String, $mediaId: Int, $progress: Int) { 
      anime000: SaveMediaListEntry (mediaId: $mediaId, notes: $notes, progress: $progress) {
            id 
      }
    }
    `;

    let variables = {
        mediaId: parseInt(element.parentNode.parentNode.children[2].dataset.aniid),
        notes: element.parentNode.children[0].value,
        progress: parseInt(element.parentNode.children[1].value),

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

    fetch(url, options).then(handleResponse)
                       .catch(handleError);
}

async function adddropdown() {
    let dropdownbutts = document.getElementsByClassName("dropdown-content")[0];
    Array.from(dropdownbutts.children).forEach(el => {
        el.addEventListener('click', async function() {
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
        mutation ($id: Int) { 
            anime000: DeleteMediaListEntry(id: $id) {
                deleted
          }
        }
        `;
    
        variables = {
            id: parseInt(element.parentNode.parentNode.dataset.aniid),
    
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

    fetch(url, options).then(handleResponse)
                       .catch(handleError);
}

  
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
    if (!event.target.matches('.dropbtn')) {
        // document.getElementById("MyDropdown").classList.toggle("show");
        let dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
    if (!event.target.matches('.dropupbtn')) {
        // document.getElementById("MyDropdown").classList.toggle("show");
        let dropdowns = document.getElementsByClassName("dropup-content");
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

async function onpullrefresh() {
    await fillpage()
    table.replaceChildren()
    const buttonArray = Array.from(navbarclick.children);
    for (const button of buttonArray) {
        if (button.className === "active") {
            await sortList(localStorage[button.textContent.toLowerCase()], `anime_${button.textContent.toLowerCase()}`)
            datahandler(JSON.parse(localStorage[`anime_${button.textContent.toLowerCase()}`]))
        }
        sortList(localStorage[button.textContent.toLowerCase()], `anime_${button.textContent.toLowerCase()}`)
    }
}

PullToRefresh.init({
    mainElement: 'body',
    onRefresh() {
        onpullrefresh()
        //window.location.reload();
    }
  });