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
const url = 'https://graphql.anilist.co';
const table = document.querySelector("table");
const timenow = Date.now();
const daysw = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const modal = document.getElementsByClassName("modal")[0];
const mydropups = document.querySelector(".dropupbtn");
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
    setPrimaryColour()
    setSecondaryColour()
    mydropups.textContent = theseason
    await dayactive()
    if (!localStorage[theseason] || parseInt(localStorage[`LastUpdated_${theseason}`])+1800000 < Date.now()) {
        await pagefill(theseason, (new Date()).getFullYear())
    }
    table.replaceChildren()
    const active = document.querySelector(".pill button.active")
    active.style.setProperty("background-color", seccolour)
    //handleData(JSON.parse(localStorage[theseason]), active.textContent)
    andorbutton()
    resetbutton()
    genrebuttons()
    addsortbutton()
    makenavbarwork()
    searchbarfunc()
    toggledrop(document.getElementsByClassName("dropbtn")[0])
    toggledrop(mydropups)
    toggledrop(document.querySelector('.filterbtn'))
    adddropdown()
    await handleData(JSON.parse(localStorage[theseason]))
    //document.querySelector(`#${active.textContent}`).scrollIntoView()
    const container = document.querySelector('.container');
    window.scrollTo(0, document.querySelector(`#${active.textContent}`).offsetTop+70)
    //container.scrollTop - document.querySelector(`#${active.textContent}`).offsetTop
    // window.location.href = `#${active.textContent}`
}
main()

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

async function toggledrop(element){
    element.addEventListener('click', function() {
        toggledropdown(this)
    })
}

async function addsortbutton(){
    let options = document.querySelectorAll('.dropup-content a')
    options.forEach(option => {
        option.addEventListener('click', async function() {
            document.querySelector('.dropupbtn').textContent = this.textContent
            if (!localStorage[this.textContent]) {
                await pagefill(this.textContent, currseasonindex > allseasons.indexOf(this.textContent) ? (new Date()).getFullYear() + 1: (new Date()).getFullYear() )
            }
            table.replaceChildren()
            const navigationbar = document.querySelector(".pill button.active")   
            handleData(JSON.parse(localStorage[this.textContent]))
            let dropdowns = document.getElementsByClassName("dropup-content")[0];
            if (dropdowns.classList.contains('show')) {
                dropdowns.classList.remove('show')
            }
            window.scrollTo(0, document.querySelector(`#Mon`).offsetTop+70)
        })
    })
}

async function dayactive(){
    const navigationbar = Array.from(document.querySelector(".pill").children).find(button => button.textContent.trim() === daysw[(new Date()).getDay()]);
    navigationbar.classList.add("active")
}

//clickable navbar
async function makenavbarwork() {
    const navbarclick = document.querySelectorAll(".pill button");
    navbarclick.forEach(el => {
        el.addEventListener('click', function() {
            navbarclicker(this)
        })
    });
}

async function navbarclicker(element) {
    let allnavitems = Array.from(element.parentNode.children);
    allnavitems.forEach(item => {
        item.classList.remove("active")
        item.style.setProperty("background-color", seccolour)
        if (item.textContent === element.textContent) {
            item.classList.add('active')
            item.style.setProperty("background-color", seccolour)
            window.scrollTo(0, table.querySelector(`#${element.textContent}`).offsetTop+70)
        }
    })
}

async function searchbarfunc() {
    const searchbar = document.getElementById("myInput");
    searchbar.addEventListener('keyup', function() {
        searching()
    })
}

async function pagefill(aseason, ayear) {
    mydropups.textContent = aseason
    let data = []
    let lastpage = 100
    let currentpage = 1
    while (lastpage >= currentpage) {
        let query = `
        query ($season: MediaSeason, $seasonYear: Int, $page: Int){ # Define which variables will be used in the query (id)
            Page (page: $page, perPage:50) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
                pageInfo {
                    lastPage
                }
                media (season: $season, seasonYear: $seasonYear, type: ANIME) {
                    description,
                    episodes,
                    genres,
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
            season: aseason,
            seasonYear: ayear,
            page: currentpage
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
    splitdata(data, aseason)
    localStorage.setItem(`LastUpdated_${aseason}`, Date.now())
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

async function splitdata(data, aseason){
    let days = {"Mon": [], 
        "Tue": [], 
        "Wed": [], 
        "Thu": [],
        "Fri": [],
        "Sat": [],
        "Sun": [],
        "NA": []
    };
    data.forEach(list => {
        let listentry = list['data']['Page']['media']
        listentry.forEach(entry => {
            if (entry['nextAiringEpisode']) {
                let airday = new Date((timenow / 1000 + entry['nextAiringEpisode']['timeUntilAiring']*1000)).getDay();
                days[daysw[airday]].push(entry)
            } else {
                days['NA'].push(entry)
            }

        })
    })
    for (let key in days) {
        if (key === "NA"){
            continue
        }
        days[key].sort((a, b) => {
            if (a["nextAiringEpisode"] !== null && b["nextAiringEpisode"] !== null) {
                // Both have age, sort by age
                if (a["nextAiringEpisode"]["timeUntilAiring"] === b["nextAiringEpisode"]["timeUntilAiring"]) {
                    return a["title"]["romaji"].localeCompare(b["title"]["romaji"]);
                }
                return a["nextAiringEpisode"]["timeUntilAiring"] - b["nextAiringEpisode"]["timeUntilAiring"];
            } else if (a["nextAiringEpisode"] !== null) {
                // a has age, b does not, a comes first
                return -1;
            } else if (b["nextAiringEpisode"] !== null) {
                // b has age, a does not, b comes first
                return 1;
            } else {
                // Neither has age, sort by name
                return b['title']["romaji"] - a['title']["romaji"];
            }
        })
    }
    localStorage.setItem(aseason, JSON.stringify(days))
}

async function handleData(data){
    let fragment = document.createDocumentFragment()
    Object.keys(data).forEach(day => {
        let myitem = document.createElement("tr");
        myitem.classList.add('weekday')
        myitem.id = day
        let rowcontent = document.createElement('tr')
        rowcontent.textContent = day
        myitem.appendChild(rowcontent)
        fragment.appendChild(myitem)
        data[day].forEach(media => {
            let myitem = document.createElement("tr");
            myitem.className = "list_item";
            myitem.dataset.id = media['id'];
            myitem.addEventListener('click', function() {
                clickables(this)
            })

            let tablezero = document.createElement("div");
            let imagetable = document.createElement("img");
            imagetable.src = media['coverImage']['medium'];
            imagetable.loading = "lazy";

            let genresinimg = document.createElement("div")
            genresinimg.style.display = "none"
            genresinimg.classList.add("trgenres")
            genresinimg.textContent = `${media['genres']}`.split(',').join(', ');

            tablezero.appendChild(imagetable)
            tablezero.appendChild(genresinimg)

            let rowtext = document.createElement('div')
            rowtext.classList.add("clickable-item")

            //title
            let myitemtitle = document.createElement("p")
            myitemtitle.className = "item_title"
            myitemtitle.textContent = (media['mediaListEntry'] ? `\uD83D\uDC41\uFE0F${media['title']['romaji']}` : media['title']['romaji'])
            
            //subtitle
            let myitemsubtitle = document.createElement("p")
            myitemsubtitle.className = "item_subtitle";
            myitemsubtitle.innerHTML = media['description'];

            rowtext.appendChild(myitemtitle)
            rowtext.appendChild(myitemsubtitle)

            if (day != "NA") {
                myitem.dataset.next_ep = media['nextAiringEpisode']['timeUntilAiring'];
                let myitemsubsubtitle = document.createElement("p")
                myitemsubsubtitle.style.fontWeight = "bold";
                myitemsubsubtitle.className = "item_subtitle";
                myitemsubsubtitle.textContent = `Ep ${media['nextAiringEpisode']['episode']} airing in ${(media['nextAiringEpisode']['timeUntilAiring']/3600).toFixed(0)} hours`
                rowtext.appendChild(myitemsubsubtitle)
            }
            myitem.appendChild(tablezero)
            myitem.appendChild(rowtext)
            fragment.appendChild(myitem)
        })
    })
    table.appendChild(fragment)
}

async function findObjectByIdWithDay(data, targetId) {
    for (const [day, objects] of Object.entries(data)) {
      const found = objects.find(obj => obj.id === targetId);
      if (found) return found;
    }
    return null;
}


async function clickables(element) {
    let stored_data = JSON.parse(localStorage[document.querySelector('.dropupbtn').textContent])
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
    let stat = document.getElementsByClassName("dropbtn")[0].textContent
    if (stat === "ADD") {
        return
    }
    let tableentry = document.querySelector((`[data-id='${element.parentNode.dataset.aniid}']`))
    tableentry.querySelector('.item_title').textContent = `\uD83D\uDC41\uFE0F${tableentry.querySelector('.item_title').textContent}`
    let notesform = document.querySelectorAll('#notesform .formtext')
    tableentry.dataset.progress = parseInt(notesform[1].value)
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

    showToast(`${tableentry.querySelector('.item_title').textContent} status updated`)
    let updatedItem
    const season = document.querySelector('.dropupbtn').textContent
    old_data = JSON.parse(localStorage[season])
    old_data[document.querySelector('.pill button.active').textContent].map(item => {
        if (item['id'] == element.parentNode.dataset.aniid) {
            if (!item['mediaListEntry']) {
                item['mediaListEntry'] = {}
                item['mediaListEntry']['status'] = stat
            }
            updatedItem = item
        }
        return item
    })

    localStorage[season] = JSON.stringify(old_data)

    if (!updatedItem['mediaListEntry']) {
        updatedItem['mediaListEntry'] = {}
    }
    updatedItem['mediaListEntry']['status'] = stat
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
    let updatelist = JSON.parse(localStorage[`anime_${stat.toLowerCase()}`])
    updatelist.push(tempItem)
    localStorage[`anime_${stat.toLowerCase()}`] = JSON.stringify(updatelist)

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

async function searching() {
    let input, filter, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    tr = table.getElementsByTagName("tr");
    Array.from(tr).forEach(entry => {
        td = entry.querySelector(".item_title")//getElementsByTagName("td")[1];
        if (td) {
            txtValue = entry.textContent || entry.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                entry.style.display = "";
            } else {
                entry.style.display = "none";
            }
        }
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
        let dropdowns = document.getElementsByClassName("dropdown-content")[0];
        if (dropdowns.classList.contains('show')) {
            dropdowns.classList.remove('show')
        }
    }
    if (!event.target.matches('.dropup-content a') && !event.target.matches('.dropupbtn')) {
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
    await pagefill(mydropups.textContent, currseasonindex > allseasons.indexOf(mydropups.textContent) ? (new Date()).getFullYear() + 1: (new Date()).getFullYear())
    table.replaceChildren()
    const navigationbar = document.querySelector(".pill button.active")   
    handleData(JSON.parse(localStorage[mydropups.textContent]))
    window.scrollTo(0, document.querySelector(`#${navigationbar.textContent}`).offsetTop+70)
}

PullToRefresh.init({
    mainElement: 'body',
    onRefresh() {
        onpullrefresh()
    }
  });

let lastScrollTop = 0;
let isScrollingProgrammatically = false;

// Override the window.scrollTo method
const originalScrollTo = window.scrollTo;
window.scrollTo = function() {
    isScrollingProgrammatically = true;
    originalScrollTo.apply(this, arguments);
    // Reset the flag after a short delay
    setTimeout(() => {
        isScrollingProgrammatically = false;
    }, 100); // Adjust this delay if needed
};
window.addEventListener('scroll', function() {
    if (isScrollingProgrammatically) return; // Skip if scrolling programmatically

    const navbarclick = document.getElementsByClassName("pill")[0];
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