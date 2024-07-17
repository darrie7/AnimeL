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
let viewerId;
const modal = document.getElementsByClassName("modal")[0];
const navbarclick = document.getElementsByClassName("pill")[0];
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
    setPrimaryColour()
    setSecondaryColour()
    if (!localStorage.getItem('viewerId')) {
        await getviewerid()
    } 
    viewerId = localStorage.viewerId
    if (!localStorage.getItem(`anime_current`) || parseInt(localStorage.getItem('LastUpdated'))+1800000 < Date.now()) {
        await fillpage()
    }
    table.replaceChildren()
    const buttonArray = Array.from(navbarclick.children);     
    for (const button of buttonArray) {
        if (button.textContent === "Current") {
            button.classList.add("active")
            button.style.setProperty("background-color", primcolour)
            await sortList(localStorage[button.textContent.toLowerCase()] ? localStorage[button.textContent.toLowerCase()] : "Title asc", `anime_${button.textContent.toLowerCase()}`)
            datahandler(JSON.parse(localStorage[`anime_${button.textContent.toLowerCase()}`]))
            continue
        }
        //button.style.setProperty("background-color", seccolour)
        sortList(localStorage[button.textContent.toLowerCase()] ? localStorage[button.textContent.toLowerCase()] : "Title asc", `anime_${button.textContent.toLowerCase()}`)
    }
    andorbutton()
    resetbutton()
    genrebuttons()
    makenavbarwork()
    addsortbutton()
    searchbarfunc()
    toggledrop(document.getElementsByClassName("dropupbtn")[0])
    toggledrop(document.getElementsByClassName("dropbtn")[0])
    toggledrop(document.querySelector('.filterbtn'))
    adddropdown()
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

async function resetbutton() {
    resetbutton = document.querySelector('.reset').addEventListener('click', async function() {
        document.querySelectorAll('.genre.active').forEach(button => {
            button.classList.remove('active')
            button.style.setProperty("background-color", seccolour)
        })
        filterlist()
    })
}

async function filterlist() {
    let andor = document.querySelector('.andor').innerText
    let activegenres = document.querySelectorAll('.genre.active')
    let buttonTexts = Array.from(activegenres).map(button => button.innerText);
    let tr, td, txtValue;
    tr = table.getElementsByTagName("tr");
    Array.from(tr).forEach(entry => {
        td = entry.querySelector(".trgenres")//getElementsByTagName("td")[1];
        if (td) {
            txtValue = entry.textContent || entry.innerText;
            if (andor == 'And') {
                if (buttonTexts.every(substring => txtValue.includes(substring))) {
                    entry.style.display = "";
                } else {
                    entry.style.display = "none";
                }
            }
            if (andor == 'Or') {
                if (buttonTexts.some(substring => txtValue.includes(substring)) || buttonTexts.length == 0) {
                    entry.style.display = "";
                } else {
                    entry.style.display = "none";
                }
            }
        }
    })
}

async function genrebuttons() {
    document.querySelectorAll('.genre').forEach(button => {
        button.addEventListener('click', async function() {
            button.classList.toggle('active')
            if (button.classList.contains('active')) {
                button.style.setProperty("background-color", primcolour)
            } else {
                button.style.setProperty("background-color", seccolour)
            }
            //do filtering function
            filterlist()
        })
    })
}

async function andorbutton() {
    document.querySelector('.andor').addEventListener('click', async function() {
        if (this.innerText == "And") {
            this.innerText = "Or";
        } else {
            this.innerText = "And";
        }
        filterlist()
        //do filtering
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
            const activeElement = document.querySelector('.pill .active');
            localStorage.setItem(activeElement.textContent.toLowerCase(), this.value)
            table.replaceChildren()
            await sortList(this.value, `anime_${activeElement.textContent.toLowerCase()}`)
            datahandler(JSON.parse(localStorage[`anime_${activeElement.textContent.toLowerCase()}`]))
            setselectedsort(localStorage[activeElement.textContent.toLowerCase()])
            let dropdowns = document.getElementsByClassName("dropup-content")[0];
            if (dropdowns.classList.contains('show')) {
                dropdowns.classList.remove('show')
            }
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
    if (element.classList.contains("active")) {
        return
    }
    let allnavitems = Array.from(element.parentNode.children);
    allnavitems.forEach(item => {
        item.classList.remove("active")
        item.style.setProperty("background-color", seccolour)
        if (item.textContent === element.textContent) {
            table.id = item.textContent.toLowerCase()
            item.classList.add("active")
            item.style.setProperty("background-color", primcolour)
        }
    })
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;
    table.replaceChildren()
    datahandler(JSON.parse(localStorage[`anime_${element.textContent.toLowerCase()}`]))
    setselectedsort(localStorage[element.textContent.toLowerCase()])
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
                                description
                                id
                                episodes
                                genres
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
                                    notes,
                                    updatedAt,
                                    createdAt,
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
    element.parentNode.querySelector('.item_subtitle').textContent = `${element.parentNode.dataset.progress}/${element.parentNode.dataset.episodes} episodes`;
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

    showToast(`${element.parentNode.querySelector('.item_title').textContent} updated progress`)

    old_data = JSON.parse(localStorage[`anime_${document.querySelector('.pill button.active').textContent.toLowerCase()}`])
    if (element.parentNode.dataset.episodes === '?' || parseInt(element.parentNode.dataset.progress) < parseInt(element.parentNode.dataset.episodes)) {
        old_data.map(item => {
            if (item['media']['id'] == element.parentNode.dataset.id) {
                item['media']['mediaListEntry']['progress'] = parseInt(element.parentNode.dataset.progress)
            }
            return item
        })
        localStorage[`anime_${document.querySelector('.pill button.active').textContent.toLowerCase()}`] = JSON.stringify(old_data)
    } else {
        let removed_entry
        let updated_old = old_data.filter(item => {
            if (item['media']['id'] == element.parentNode.dataset.id) {
                removed_entry = item
                return false
            }
            return true
        })
        //remove entry from old status
        localStorage[`anime_${document.querySelector('.pill button.active').textContent.toLowerCase()}`] = JSON.stringify(updated_old)
        //remove entry from table
        table.removeChild(element.parentNode)
        // add entry to new status
        let new_data = JSON.parse(localStorage[`anime_completed`])
        new_data.push(removed_entry)
        localStorage[`anime_completed`] = JSON.stringify(new_data)
        sortList(localStorage['completed'], `anime_completed` )
    }

    fetch(url, options).then(handleResponse)
                       .catch(handleError);
}

async function splitdata(data) {
    let mediaList = data['data']['MediaListCollection']['lists'];
    const statuses = ["current", "planning", "paused", "completed"]
    statuses.forEach(status => {
        let entries = []
        mediaList.forEach(media => {
            let listWithinmedialist = media['entries']
            listWithinmedialist.forEach(media => {
                if (media['media']['mediaListEntry']['status'] === status.toUpperCase()) {
                    entries.push(media)
                }
            })
        })
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
    let fragment = document.createDocumentFragment()
    filteredandsortedentries.forEach(media => {
        let myitem = document.createElement("tr");
        myitem.className = "list_item";
        myitem.style.gridTemplateColumns = '15% auto 15%'
        //myitem.style.setProperty('grid-template', '15% auto 15%');
        myitem.dataset.id = media['media']['id'];
        
        let tablezero = document.createElement("div");
        let imagetable = document.createElement("img");
        imagetable.src = media['media']['coverImage']['medium'];
        imagetable.loading = "lazy"

        let genresinimg = document.createElement("div")
        genresinimg.style.display = "none"
        genresinimg.classList.add("trgenres")
        genresinimg.textContent = `${media['media']['genres']}`.split(',').join(', ');
        
        tablezero.appendChild(imagetable)
        tablezero.appendChild(genresinimg)

        let tableelone = document.createElement("td");
        tableelone.className = "clickable-item"
        tableelone.addEventListener('click', async function() {
            clickables(this)
        })

        //title
        let myitemtitle = document.createElement("p");
        myitemtitle.className = "item_title"
        myitemtitle.textContent = media['media']['title']['romaji'];

        //subtitle
        let myitemsubtitle = document.createElement("p");
        myitemsubtitle.className = "item_subtitle"
        myitemsubtitle.textContent = `${media['media']['mediaListEntry']["progress"]}/${media['media']['episodes'] ? media['media']['episodes'] : "?"} episodes`

        //subsubtitle
        let myitemsubsubtitle = document.createElement("p");
        myitemsubsubtitle.className = "item_subtitle";
        myitemsubsubtitle.style.fontWeight = "bold";

        tableelone.appendChild(myitemtitle)
        tableelone.appendChild(myitemsubtitle)
        tableelone.appendChild(myitemsubsubtitle)

        myitem.appendChild(tablezero);
        myitem.appendChild(tableelone);

        //item +1 element
        if (table.id != "completed") {
            let tableeltwo = document.createElement("td");
            tableeltwo.className = "update1";
            tableeltwo.textContent = "+1";
            myitem.dataset.progress = media['media']['mediaListEntry']["progress"];
            myitem.dataset.episodes = media['media']['episodes'] ? media['media']['episodes'] : "?";
            tableeltwo.addEventListener('click', async function() {
                plusone(this)
            })

            if (media['media']['nextAiringEpisode']) {
                myitem.dataset.next_ep = media['media']['nextAiringEpisode']['timeUntilAiring'];
                myitem.dataset.next_ep_nr = media['media']['nextAiringEpisode']['episode']
                myitemsubsubtitle.textContent = `Ep ${media['media']['nextAiringEpisode']['episode']} airing in ${(media['media']['nextAiringEpisode']['timeUntilAiring']/3600).toFixed(0)} hours`
                if ((parseInt(myitem.dataset.next_ep_nr)-parseInt(myitem.dataset.progress)) > 1) {
                    myitem.style.backgroundColor = tricolour
                }
            } else {
                if(myitem.dataset.episodes != '?'){
                    myitemsubsubtitle.textContent = 'Finished';
                }
            }
            myitem.appendChild(tableeltwo)
        }
        fragment.appendChild(myitem)
    })
    table.appendChild(fragment)
}

async function searching() {
    let input, filter, tr, td, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    tr = table.querySelectorAll("tr");
    tr.forEach(entry => {
        td = entry.querySelector(".item_title")//getElementsByTagName("td")[1];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                entry.style.display = "";
            } else {
                entry.style.display = "none";
            }
        }
    })
}


async function findObjectByIdWithDay(data, targetId) {
    let found
    for (const objects of data) {
        if (objects.media.id == targetId) {
            found = objects
            break
        }
    }
    return found ? found : null ;
}


async function clickables(element) {
    let stored_data = JSON.parse(localStorage[`anime_${document.querySelector('.pill button.active').textContent.toLowerCase()}`])
    clicked = await findObjectByIdWithDay(stored_data, parseInt(element.parentNode.dataset.id))
    let modalimg = document.getElementsByClassName("image-container")[0];
    let theimg = document.createElement("img");
    theimg.src = clicked['media']['coverImage']['medium'];
    theimg.loading = "lazy";
    theimg.style.float = "left";
    theimg.style.paddingRight = "16px";
    theimg.style.height = "auto";
    modalimg.replaceChildren(theimg)
    let modaltitle = document.getElementsByClassName("title-container")[0];
    modaltitle.textContent = `${clicked['media']['title']['romaji']}`;
    let modalgenres = document.getElementsByClassName("genres")[0];
    modalgenres.textContent = `${clicked['media']['genres']}`.split(',').join(', ');
    let modalbutton = document.getElementsByClassName("dropdown")[0];
    modalbutton.dataset.aniid = clicked['id'];
    modal.querySelector('.dropbtn').textContent =(clicked['media']['mediaListEntry'] ? clicked['media']['mediaListEntry']['status'] : "ADD")
    let notesform = document.querySelectorAll('#notesform .formtext')
    notesform[0].value = (clicked['media']['mediaListEntry'] ? clicked['media']['mediaListEntry']['notes'] : "")
    notesform[1].value = (clicked['media']['mediaListEntry'] ? clicked['media']['mediaListEntry']['progress']: 0)
    let savebutton = document.getElementById('formbutton')
    savebutton.onclick = async function() {updatenotes(this)}
    let modal_body = document.getElementsByClassName("modal-body")[0];
    modal_body.children[0].innerHTML = `<h3>Description</h3><p>${clicked['media']['description']}</p>`;
    modal.style.display = 'block';
}


async function updatenotes(element) {
    let stat = document.getElementsByClassName("dropbtn")[0].textContent
    let tableentry = document.querySelector((`[data-id='${element.parentNode.dataset.aniid}']`))
    let notesform = document.querySelectorAll('#notesform .formtext')
    tableentry.dataset.progress = parseInt(notesform[1].value)
    tableentry.querySelector('.item_subtitle').textContent = `${tableentry.dataset.progress}/${tableentry.dataset.episodes} episodes`
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
        status: stat

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
    showToast(`${tableentry.querySelector('.item_title').textContent} updated`)

    const old_status = document.querySelector('.pill button.active').textContent.toLowerCase()

    old_data = JSON.parse(localStorage[`anime_${old_status}`])
    old_data.map(item => {
        if (item['media']['id'] == element.parentNode.dataset.aniid) {
            item['media']['mediaListEntry']['progress'] = parseInt(element.parentNode.dataset.progress) ? parseInt(element.parentNode.dataset.progress) : 0
            item['media']['mediaListEntry']['notes'] = notesform[0].value
            item['media']['mediaListEntry']['status'] = stat

        }
        return item
    })
    if (old_status === stat.toLowerCase()) {
        localStorage[`anime_${old_status}`] = JSON.stringify(old_data)
    } else {
        let removed_entry
        let updated_old = old_data.filter(item => {
            if (item['media']['id'] == element.parentNode.dataset.aniid) {
                removed_entry = item
                return false
            }
            return true
        })
        //remove entry from old status
        localStorage[`anime_${old_status}`] = JSON.stringify(updated_old)
        //remove entry from table
        table.removeChild(tableentry)
        // add entry to new status
        let new_data = JSON.parse(localStorage[`anime_${stat.toLowerCase()}`])
        new_data.push(removed_entry)
        localStorage[`anime_${stat.toLowerCase()}`] = JSON.stringify(new_data)
        sortList(localStorage[stat.toLowerCase()], `anime_${stat.toLowerCase()}` )
    }

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
window.onclick = async function(event) {
    if (event.target === modal) {
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
    if (!event.target.matches('.dropup-content label span') && !event.target.matches('.dropupbtn')) {
        // document.getElementById("MyDropdown").classList.toggle("show");
        let dropdowns = document.getElementsByClassName("dropup-content")[0];
        if (dropdowns.classList.contains('show')) {
            dropdowns.classList.remove('show')
        }
    }
    if (!event.target.matches('.filter-content button') && !event.target.matches('.filterbtn')) {
        let dropdowns = document.getElementsByClassName("filter-content")[0];
        if (dropdowns.classList.contains('show')) {
            dropdowns.classList.remove('show')
        }
    }
}

async function onpullrefresh() {
    await fillpage()
    table.replaceChildren()
    const buttonArray = Array.from(navbarclick.children);
    for (const button of buttonArray) {
        if (button.classList.contains("active")) {
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

let lastScrollTop = 0;
window.addEventListener('scroll', function() {
    let scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
        // Scrolling down
        navbarclick.style.bottom = '-2000px'; // Adjust based on header height
        document.getElementsByClassName("dropup")[0].style.bottom = '-2000px'
        document.querySelector('.filter').style.bottom = '-2000px'
    } else {
        // Scrolling up
        navbarclick.style.bottom = '45px';
        document.getElementsByClassName("dropup")[0].style.bottom = '85px'
        document.querySelector('.filter').style.bottom = '127px'
    }
    lastScrollTop = scrollTop;
});