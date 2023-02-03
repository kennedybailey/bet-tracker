bets = []
let games = {}
let finishedGames = []
let statConversion = {
    'points' : 'Points',
    'assists' : 'Assists',
    'reboundsTotal' : 'Rebounds',
    'PRA': 'PRA',
    'threePointersMade' : '3-Pointers'
}
const cors = "https://cors-anywhere.herokuapp.com/"

//Functions
function getRealStats(){
    for(let i = 0; i < games.length; i++){
        if(games[i].gameStatusText === 'PPD'){
            finishedGames.push(games[i])
            games.splice(i, 1)
        }
        else if(games[i].gameStatusText === 'Final' || games[i].gameStatusText === 'Final/OT'){
            games[i].finalChecker++
            if(games[i].finalChecker > 1){
                finishedGames.push(games[i])
                games.splice(i, 1)
            }
        }
        if(games[i]){
            let gameTime = new Date(games[i].gameTimeUTC).getTime()
            let currentTime = new Date().getTime()
            if(gameTime <= currentTime){
                let url = `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_${games[i].gameId}.json`
                axios.get(url).then(updateStats)
            }
        }
    }
}

function logScoreboard(response){
    games = response.data.scoreboard.games
    console.log('Games Today:')
    for(let i = 0; i < games.length; i++){
        games[i].finalChecker = 0;
        console.log(`${games[i].gameId}: ${games[i].awayTeam.teamName} at ${games[i].homeTeam.teamName}`)
    }
    getRealStats()
}

function updateStats(response){
    box = response.data.game
    awayTeam = response.data.game.awayTeam.players
    updatePlayers(box, awayTeam)
    homeTeam = response.data.game.homeTeam.players
    updatePlayers(box, homeTeam)
}

function updatePlayers(box, players){
    for(let i = 0; i < players.length; i++){
        for(let b = 0; b < bets.length; b++){
            for(let j = 0; j < bets[b].length; j++){
                if(players[i].name === bets[b][j].name && bets[b][j].gameStatus !== 'Final'){
                    if(box.gameStatusText !== 'pregame' && bets[b][j].gameStatus === 'pregame'){
                        bets[b][j].gameStatus = 'Started'
                        //console.log(`${bets[b][j].name} has started their game.`)
                        //updateMsg(`${bets[b][j].name.replace(" ", "-")}-${betCount[k]}`, `${bets[b][j].name} has started their game. ${players[i].statistics[betCount[k]]}/${bets[b][j].bets[betCount[k]].minValue} ${betCount[k]}.`, b+1)
                    }
                    else if ((box.gameStatusText === 'Final' || box.gameStatusText === 'Final/OT') && bets[b][j].gameStatus !== 'Final'){
                        bets[b][j].gameStatus = 'Final'
                        let betCount = Object.keys(bets[b][j].bets)
                        for(let k = 0; k < betCount.length; k++){
                            //console.log(`${bets[b][j].name} has finished their game with ${players[i].statistics[betCount[k]]}/${bets[b][j].bets[betCount[k]].minValue} ${betCount[k]}.`)
                            updateMsg(`${bets[b][j].name.replace(" ", "-")}-${betCount[k]}-${b}`, `${bets[b][j].name} has finished their game with ${players[i].statistics[betCount[k]]}/${bets[b][j].bets[betCount[k]].minValue} ${betCount[k]}.`, b+1)
                        }
                    }
                    else if (bets[b][j].gameStatus !== 'pregame'){
                        let betCount = Object.keys(bets[b][j].bets)
                        for(let k = 0; k < betCount.length; k++){
                            let liveStat = 0
                            if(betCount[k] === 'PRA'){
                                liveStat = players[i].statistics.points + players[i].statistics.reboundsTotal + players[i].statistics.assists
                            }
                            else{
                                liveStat = players[i].statistics[betCount[k]]
                            }
                            if(liveStat !== bets[b][j].bets[betCount[k]].curr){
                                let msg = `${bets[b][j].name} has ${liveStat}/${bets[b][j].bets[betCount[k]].minValue} ${betCount[k]}.`
                                updateMsg(`${bets[b][j].name.replace(" ", "-")}-${betCount[k]}-${b}`, msg, b+1)
                                bets[b][j].bets[betCount[k]].curr = liveStat
                            }
                        } 
                    }
                }
            }
        }
    }
}
//TEMP FUNCTION
function updateMsg(id, msg, betNum){
    let element = document.getElementById(id)
    if(element){
        element.innerText = msg
    } else{
        let div = document.getElementById(betNum)
        if(div){
            let createElement = document.createElement("p")
            createElement.innerText = msg
            createElement.id = id
            createElement.style = "color:white"
            div.appendChild(createElement)
        } else{
            let createDiv = document.createElement("div")
            createDiv.id = betNum
            createDiv.style = "color:white;text-align:center"
            
            let createH1 = document.createElement("h1")
            createH1.innerText = `Bet ${betNum}:`
            createH1.style = "color:white"
            let createElement = document.createElement("p")
            createElement.innerText = msg
            createElement.id = id
            createElement.style = "color:white"
            createDiv.appendChild(createH1)
            createDiv.appendChild(createElement)
            document.body.appendChild(createDiv)
        }

    }  
}
async function createBets(bet){
    let matchups = []
    //get all matchup
    for(let i = 0; i < games.length; i++){
        let nextMatchup = {
            matchup : `${games[i].awayTeam.teamTricode} vs ${games[i].homeTeam.teamTricode}`,
            players: []
        }
        matchups.push(nextMatchup)
    }

    //get all players in the same games from bet
    for(let i = 0; i < bet.length; i++){
        function printResp(response){
            livePlayers = response.data.data
            for(let j = 0; j < livePlayers.length; j++){
                //Giannis Antetokounmpo
                for(let k = 0; k < matchups.length; k++){
                    if(matchups[k].matchup.includes(livePlayers[j].team.abbreviation)){
                        matchups[k].players.push(livePlayers[j].first_name+" "+livePlayers[j].last_name)
                    }
                }
            }
        }
        let options = {
            method: 'GET',
            url: 'https://free-nba.p.rapidapi.com/players?rapidapi-key=5355dbcf79mshac6127161f06bd2p1fa345jsn668a554b624f',
            params: {per_page: 500, search: bet[i].name},
            headers: {
              'X-RapidAPI-Key': '5355dbcf79mshac6127161f06bd2p1fa345jsn668a554b624f',
              'X-RapidAPI-Host': 'free-nba.p.rapidapi.com'
            }
        };
        axios.request(options).then(printResp)
    }

    let container = document.getElementById("allBetsContainer")
    //create div container for bet
    let betNum = container.querySelectorAll(':scope > div').length
    let divContainer = document.createElement("div")
    divContainer.id = `bet-${betNum}`

    //Bet Title
    let divRowTitle = document.createElement("div")
    divRowTitle.className = "row"

    //Bet Title Text
    let betTitle = document.createElement("h4")
    betTitle.className = "whichBet"
    betTitle.innerText = `Bet ${betNum+1}`
    
    //appendTitle
    divRowTitle.appendChild(betTitle)
    divContainer.appendChild(divRowTitle)


    //Game Info Data
    //get matchups with players in them
    await sleep(1000);
    let currMatchups = []
    for(let i = 0; i < matchups.length; i++){
        if(matchups[i].players.length !== 0){
            currMatchups.push(matchups[i])
        }
    }
    for(let i = 0; i < currMatchups.length; i++){
        //Game Info
        let gameInfoContainer = document.createElement("div")
        gameInfoContainer.className = "container-md gameBox"
        let divRowGameInfo = document.createElement("div")
        divRowGameInfo.className = "row"
        let teams = document.createElement("div")
        teams.className = "col-sm-6 game text-center"
        //teams.innerText = currMatchups[i].matchup
        teams.innerText = "TOR 97 - 102 UTA"
        let time = document.createElement("div")
        time.className = "col-sm-6 game text-center"
        let gameClock = games[i].gameClock
        let minutes = gameClock.substring(gameClock.indexOf('T')+1, gameClock.lastIndexOf('M'))
        let seconds = gameClock.substring(gameClock.indexOf('M')+1, gameClock.lastIndexOf('S'))
        let quarter = ""
        let currQ = "1Q"//`${box.period}Q`
        if(quarter === '5'){
            currQ = 'OT'
        }
        //time.innerText = `${currQ} ${minutes}:${seconds}`
        time.innerText = "1Q 7:23"
        //appendGameInfo
        divRowGameInfo.appendChild(teams)
        divRowGameInfo.appendChild(time)
        gameInfoContainer.appendChild(divRowGameInfo)
        divContainer.appendChild(gameInfoContainer)

        for(let k = 0; k < currMatchups[i].players.length; k++){
            //create players
            let divRowPlayer = document.createElement("div")
            divRowPlayer.className = "row"

            //col Name
            let divColPlayer = document.createElement("div")
            divColPlayer.className = "col-md-6 info"
            divColPlayer.innerText = currMatchups[i].players[k]
                
            //bet values
            for(let b = 0; b < bet.length; b++){
                if(bet[b].name === currMatchups[i].players[k]){
                    //col stats
                    let divColStats = document.createElement("div")
                    divColStats.className = "col-md-6 dataTypes"
                    let betCount = Object.keys(bet[b].bets)
                    for(let s = 0; s < betCount.length; s++){
                        let divStat = document.createElement("div")
                        divStat.className = "row"
                        let divValue = document.createElement("div")
                        divValue.className = "col-md-4"
                        divValue.id = `${bet[b].name.replace(" ", "-")}-${betCount[s]}-${betNum}`
                        divValue.innerText = `${bet[b].bets[betCount[s]].curr}/${bet[b].bets[betCount[s]].minValue}`
                        let divStatName = document.createElement("div")
                        divStatName.className = "col-md-8"
                        divStatName.innerText = `${statConversion[betCount[s]]}`
                        divStat.append(divValue)
                        divStat.append(divStatName)
                        divColStats.appendChild(divStat)
                    }
                    
                    //append player stats
                    divRowPlayer.appendChild(divColPlayer)
                    divRowPlayer.appendChild(divColStats)

                    if(i !== bet.length){
                        divContainer.appendChild(document.createElement("br"))
                    }
                    //append RowPlayer
                    divContainer.appendChild(divRowPlayer)
                }
            }
        }
        if(i !== currMatchups.length - 1){
            divContainer.appendChild(document.createElement("hr"))
        }
    }
    //append endBet
    let hrEnd = document.createElement("hr")
    hrEnd.className = "endBet"
    divContainer.appendChild(hrEnd)
    //append everything
    container.appendChild(divContainer)
}

//Event Listener
function addLegForm(){
    let legElement = document.getElementById("legContainer");
    let child = legElement.children
    let newId = parseInt(child[child.length-1].id.substring(child[child.length-1].id.indexOf('-')+1,child[child.length-1].id.length)) + 1
    let newLeg = child[child.length-1].cloneNode(true)
    newLeg.id = "leg-"+newId

    let inputs = newLeg.querySelectorAll("input,select")
    for(let i = 0; i < inputs.length; i++){
        let newElementID = inputs[i].id.substring(0,inputs[i].id.lastIndexOf('-')+1)
        newLeg.querySelector(`#${inputs[i].id}`).setAttribute("id", newElementID + (parseInt(inputs[i].id.substring(inputs[i].id.lastIndexOf('-')+1,inputs[i].id.length)) + 1))
        if (newLeg.querySelector(`#${inputs[i].id}`).type === 'checkbox'){
            newLeg.querySelector(`#${inputs[i].id}`).checked = false
        }
        else if (newLeg.querySelector(`#${inputs[i].id}`).tagName === 'SELECT'){
            newLeg.querySelector(`#${inputs[i].id}`).value = 'default'
        } else{
            newLeg.querySelector(`#${inputs[i].id}`).value = ''
        }
    }
    let fors = newLeg.querySelectorAll("label")
    for(let f = 0; f < fors.length; f++){
        let forValue = newLeg.querySelectorAll("label")[f].getAttribute("for")
        let newElementID = forValue.substring(0,forValue.lastIndexOf('-')+1)
        let newFor = newElementID + (parseInt(forValue.substring(forValue.lastIndexOf('-')+1,forValue.length)) + 1)
        newLeg.querySelectorAll("label")[f].setAttribute("for", newFor)
    }
    legElement.appendChild(document.createElement('hr'))
    legElement.appendChild(newLeg)
}
let addLeg = document.getElementById("addLeg")
addLeg.addEventListener("click", addLegForm)

let defaultLegs = document.getElementById('betContainer').innerHTML
function addBetToHtml(){
    let legs = document.querySelector('#legContainer').querySelectorAll(':scope > div')
    let bet = []
    for(let i = 0; i < legs.length; i++){
        let name = legs[i].querySelector('#player-name-'+i).value
        let json = {
            "name": name,
            "bets": {},
            "gameStatus": "pregame"
        }
        let checkboxes = legs[i].querySelectorAll("input[type=checkbox]")
        for(let c = 0; c < checkboxes.length; c++){
            if(checkboxes[c].checked){
                let betName = checkboxes[c].name
                let betMinValue = checkboxes[c].parentElement.parentElement.querySelector("input[type=number]").value
                let betValue = {"minValue": betMinValue, "curr": 0}
                json.bets[betName] = betValue
            }
        }
        bet.push(json)
    }
    bets.push(bet)
    document.querySelector('#betContainer').innerHTML = defaultLegs
    document.getElementById("addLeg").addEventListener("click", addLegForm)
    document.getElementById("addBet").addEventListener("click", addBetToHtml)
    for(let i = 0; i < bet.length; i++){
        let betNum = bets.length
        for(let j = 0; j < Object.keys(bet[i].bets).length; j++){
            let id = `${bet[i].name.replace(" ", "-")}-${Object.keys(bet[i].bets)[j]}-${betNum-1}`
            let msg = `Adding bet for ${bet[i].name}... Tracking ${Object.keys(bet[i].bets)[j]} with a minimum of ${bet[i].bets[Object.keys(bet[i].bets)[j]].minValue}`
            updateMsg(id, msg, betNum)
        }

    }
    createBets(bet)
    
}
let addBet = document.getElementById("addBet")
addBet.addEventListener("click", addBetToHtml)

//sleep
function sleep(milliseconds) {  
    return new Promise(resolve => setTimeout(resolve, milliseconds));  
 }  

//default behaviour
let url = "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json"
axios.get(url).then(logScoreboard)
setInterval(getRealStats, 2000)