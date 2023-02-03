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
let liveGameValues = []

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
    updateGameInfo(box)
    awayTeamPlayers = response.data.game.awayTeam.players
    updatePlayers(box, awayTeamPlayers)
    homeTeamPlayers = response.data.game.homeTeam.players
    updatePlayers(box, homeTeamPlayers)
}

function updateGameInfo(box){
    let awayScore = document.getElementById(`${box.awayTeam.teamTricode}-score`)
    if(awayScore.innerText !== box.awayTeam.score){
        awayScore.innerText = box.awayTeam.score
    }
    let homeScore = document.getElementById(`${box.homeTeam.teamTricode}-score`)
    if(homeScore.innerText !== box.homeTeam.score){
        homeScore.innerText = box.homeTeam.score
    }
    let currGameInfo = document.getElementById(`${box.awayTeam.teamTricode}-${box.homeTeam.teamTricode}-time`)
    let minutes = box.gameClock.substring(box.gameClock.indexOf('T')+1, box.gameClock.lastIndexOf('M'))
    let seconds = box.gameClock.substring(box.gameClock.indexOf('M')+1, box.gameClock.lastIndexOf('S'))
    let quarter = `${box.quarter}Q`
    if(quarter === '5Q'){
        quarter = 'OT'
    }
    let gameTime = ""
    if(quarter === `0Q`){
        gameTime = 'Pregame'
    } 
    else if(quarter === '4Q' && minutes === '00' && seconds === '00'){
        gameTime = 'Final'
    }
    else{
        if(quarter === '5Q'){
            quarter = 'OT'
        }
        gameTime = `${quarter} ${minutes}:${seconds}`
    }

    if(currGameInfo.innerText !== gameTime){
        currGameInfo.innerText = gameTime
    }

}

function updatePlayers(box, players){
    for(let i = 0; i < players.length; i++){
        for(let b = 0; b < bets.length; b++){
            for(let j = 0; j < bets[b].length; j++){
                if(players[i].name === bets[b][j].name && bets[b][j].gameStatus !== 'Final'){
                    if(box.gameStatusText !== 'pregame' && bets[b][j].gameStatus === 'pregame'){
                        bets[b][j].gameStatus = 'Started'
                    }
                    else if ((box.gameStatusText === 'Final' || box.gameStatusText === 'Final/OT') && bets[b][j].gameStatus !== 'Final'){
                        bets[b][j].gameStatus = 'Final'
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
                                let id = `${bets[b][j].name.replace(" ", "-")}-${betCount[k]}-${b}`
                                updateBet(id, liveStat)
                                bets[b][j].bets[betCount[k]].curr = liveStat
                            }
                        } 
                    }
                }
            }
        }
    }
}

function updateBet(id, newVal){
    let oldVal = document.getElementById(id)
    oldVal.innerText = newVal
}

async function createBets(bet){
    let matchups = []
    //get all matchup
    for(let i = 0; i < games.length; i++){
        let nextMatchup = {
            matchup : `${games[i].awayTeam.teamTricode} vs ${games[i].homeTeam.teamTricode}`,
            players: [],
            awayTeam : `${games[i].awayTeam.teamTricode}`,
            homeTeam : `${games[i].homeTeam.teamTricode}`,
            awayScore : `${games[i].awayTeam.score}`,
            homeScore : `${games[i].homeTeam.score}`,
            quarter: `${games[i].period}`,
            gameClock: `${games[i].gameClock}`
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

        //scores
        let spanAwayTeam = document.createElement("span")
        spanAwayTeam.innerText = `${currMatchups[i].awayTeam} `
        teams.appendChild(spanAwayTeam)
        let spanAwayScore = document.createElement("span")
        spanAwayScore.id = `${currMatchups[i].awayTeam}-score`
        spanAwayScore.innerText = `${currMatchups[i].awayScore} `
        teams.appendChild(spanAwayScore)
        let spanDash = document.createElement("span")
        spanDash.innerText = `-`
        teams.appendChild(spanDash)
        let spanHomeScore = document.createElement("span")
        spanHomeScore.id = `${currMatchups[i].homeTeam}-score`
        spanHomeScore.innerText = ` ${currMatchups[i].homeScore}`
        teams.appendChild(spanHomeScore)
        let spanHomeTeam = document.createElement("span")
        spanHomeTeam.innerText = ` ${currMatchups[i].homeTeam}`
        teams.appendChild(spanHomeTeam)
        
        //time
        let time = document.createElement("div")
        time.className = "col-sm-6 game text-center"
        time.id = `${currMatchups[i].awayTeam}-${currMatchups[i].homeTeam}-time`
        let minutes = currMatchups[i].gameClock.substring(currMatchups[i].gameClock.indexOf('T')+1, currMatchups[i].gameClock.lastIndexOf('M'))
        let seconds = currMatchups[i].gameClock.substring(currMatchups[i].gameClock.indexOf('M')+1, currMatchups[i].gameClock.lastIndexOf('S'))
        let quarter = `${currMatchups[i].quarter}Q`
        if(quarter === '5Q'){
            quarter = 'OT'
        }
        let gameTime = ""
        if(quarter === `0Q`){
            gameTime = 'Pregame'
        } 
        else if(quarter === '4Q' && minutes === '00' && seconds === '00'){
            gameTime = 'Final'
        }
        else{
            if(quarter === '5Q'){
                quarter = 'OT'
            }
            gameTime = `${quarter} ${minutes}:${seconds}`
        }
        time.innerText = gameTime

        //save current game times
        let liveMatchupInfo = {}
        liveMatchupInfo.matchup = currMatchups[i].matchup
        liveMatchupInfo.gameTime = gameTime
        liveGameValues.push(liveMatchupInfo)

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
                        let spanLiveValue = document.createElement("span")
                        spanLiveValue.id =  `${bet[b].name.replace(" ", "-")}-${betCount[s]}-live-${betNum}`
                        spanLiveValue.innerText = `${bet[b].bets[betCount[s]].curr}`
                        let spanMinValue = document.createElement("span")
                        spanMinValue.innerText = `/${bet[b].bets[betCount[s]].minValue}`
                        divValue.appendChild(spanLiveValue)
                        divValue.appendChild(spanMinValue)
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
//10 secs
setInterval(getRealStats, 10000)