bets = []
let games = {}
const cors = "https://cors-anywhere.herokuapp.com/"

//Functions
function getRealStats(){
    for(let i = 0; i < games.length; i++){
        let gameTime = new Date(games[i].gameTimeUTC).getTime()
        let currentTime = new Date().getTime()
        let gameClock = games[i].gameClock
        let minutes = gameClock.substring(gameClock.indexOf('T')+1, gameClock.lastIndexOf('M'))
        let seconds = gameClock.substring(gameClock.indexOf('M')+1, gameClock.lastIndexOf('S'))
        //console.log(`${games[i].period}Q ${minutes}:${seconds}`)          - OT = 5Q
        if(gameTime <= currentTime){
                let url = `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_${games[i].gameId}.json`
                axios.get(url).then(updateStats).catch(function (err){
                    console.log(`Error getting the game between ${games[i].awayTeam.teamName} vs ${games[i].homeTeam.teamName}`)
                })
        }
    }
}

function logScoreboard(response){
    games = response.data.scoreboard.games
    console.log('Games Today:')
    for(let i = 0; i < games.length; i++){
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
        for(let b = 0; b < bets.lengh; b++){
            for(let j = 0; j < bet[b].length; j++){
                if(players[i].name === bet[b][j].name && bet[b][j].gameStatus !== 'Final'){
                    if(box.gameStatusText !== 'pregame' && bet[b][j].gameStatus === 'pregame'){
                        bet[b][j].gameStatus = 'Started'
                        //console.log(`${bet[b][j].name} has started their game.`)
                        updateMsg(`${bet[b][j].name.replace(" ", "-")}-${betCount[k]}`, `${bet[b][j].name} has started their game. ${players[i].statistics[betCount[k]]}/${bet[b][j].bets[betCount[k]].minValue} ${betCount[k]}.`, b+1)
                    }
                    else if (box.gameStatusText === 'Final' && bet[b][j].gameStatus !== 'Final'){
                        bet[b][j].gameStatus = 'Final'
                        let betCount = Object.keys(bet[b][j].bets)
                        for(let k = 0; k < betCount.length; k++){
                            //console.log(`${bet[b][j].name} has finished their game with ${players[i].statistics[betCount[k]]}/${bet[b][j].bets[betCount[k]].minValue} ${betCount[k]}.`)
                            updateMsg(`${bet[b][j].name.replace(" ", "-")}-${betCount[k]}`, `${bet[b][j].name} has finished their game with ${players[i].statistics[betCount[k]]}/${bet[b][j].bets[betCount[k]].minValue} ${betCount[k]}.`, b+1)
                        }
                    }
                    else if (bet[b][j].gameStatus !== 'pregame'){
                        let betCount = Object.keys(bet[b][j].bets)
                        for(let k = 0; k < betCount.length; k++){
                            let liveStat = 0
                            if(betCount[k] === 'PRA'){
                                liveStat = players[i].statistics.points + players[i].statistics.reboundsTotal + players[i].statistics.assists
                            }
                            else{
                                liveStat = players[i].statistics[betCount[k]]
                            }
                            if(liveStat !== bet[b][j].bets[betCount[k]].curr){
                                let msg = `${bet[b][j].name} has ${liveStat}/${bet[b][j].bets[betCount[k]].minValue} ${betCount[k]}.`
                                updateMsg(`${bet[b][j].name.replace(" ", "-")}-${betCount[k]}`, msg, b+1)
                                bet[b][j].bets[betCount[k]].curr = liveStat
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
            let id = `${bet[i].name.replace(" ", "-")}-${Object.keys(bet[i].bets)[j]}-${j}`
            let msg = `Waiting for ${bet[i].name}'s game to start. Tracking ${Object.keys(bet[i].bets)[j]} with a minimum of ${bet[i].bets[Object.keys(bet[i].bets)[j]].minValue}`
            updateMsg(id, msg, betNum)
        }

    }

    
}
let addBet = document.getElementById("addBet")
addBet.addEventListener("click", addBetToHtml)

//default behaviour
url = "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json"
axios.get(`${cors}${url}`).then(logScoreboard)
setInterval(getRealStats, 2000)