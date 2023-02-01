bet = [{
        'name': 'LeBron James',
        'bets': {
            'points': {
                'minValue': 25,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'Jrue Holiday',
        'bets': {
            'reboundsTotal': {
                'minValue': 4,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'Kawhi Leonard',
        'bets': {
            'threePointersMade': {
                'minValue': 2,
                'curr': 0
            },
            'points': {
                'minValue': 20,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'Michael Porter Jr.',
        'bets': {
            'reboundsTotal': {
                'minValue': 4,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'Darius Garland',
        'bets': {
            'points': {
                'minValue': 15,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'Evan Mobley',
        'bets': {
            'reboundsTotal': {
                'minValue': 6,
                'curr': 0
            },
            'points': {
                'minValue': 10,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'RJ Barrett',
        'bets': {
            'points': {
                'minValue': 15,
                'curr': 0
            },
            'reboundsTotal': {
                'minValue': 4,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'Paul George',
        'bets': {
            'points': {
                'minValue': 20,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'Jalen Brunson',
        'bets': {
            'assists': {
                'minValue': 4,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'DeMar DeRozan',
        'bets': {
            'points': {
                'minValue': 20,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'Jonas Valanciunas',
        'bets': {
            'points': {
                'minValue': 10,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'CJ McCollum',
        'bets': {
            'points': {
                'minValue': 15,
                'curr': 0
            },
            'assists': {
                'minValue': 4,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'Nikola Jokic',
        'bets': {
            'assists': {
                'minValue': 8,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'Jarrett Allen',
        'bets': {
            'points': {
                'minValue': 10,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'Mason Plumlee',
        'bets': {
            'reboundsTotal': {
                'minValue': 6,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'LaMelo Ball',
        'bets': {
            'assists': {
                'minValue': 6,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'Terry Rozier',
        'bets': {
            'points': {
                'minValue': 15,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'Brandon Ingram',
        'bets': {
            'threePointersMade': {
                'minValue': 1.5,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    {
        'name': 'Nikola Vucevic',
        'bets': {
            'PRA': {
                'minValue': 32.5,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    }
]
let games = {}

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
            axios.get(url).then(updateStats)
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
        for(let j = 0; j < bet.length; j++){
            if(players[i].name === bet[j].name && bet[j].gameStatus !== 'Final'){
                if(box.gameStatusText !== 'pregame' && bet[j].gameStatus === 'pregame'){
                    bet[j].gameStatus = 'Started'
                    console.log(`${bet[j].name} has started their game.`)
                }
                else if (box.gameStatusText === 'Final' && bet[j].gameStatus !== 'Final'){
                    bet[j].gameStatus = 'Final'
                    let betCount = Object.keys(bet[j].bets)
                    for(let k = 0; k < betCount.length; k++){
                        console.log(`${bet[j].name} has finished their game with ${players[i].statistics[betCount[k]]}/${bet[j].bets[betCount[k]].minValue} ${betCount[k]}.`)
                        updateMsg(`${bet[j].name.replace(" ", "-")}-${betCount[k]}`, `${bet[j].name} has finished their game with ${players[i].statistics[betCount[k]]}/${bet[j].bets[betCount[k]].minValue} ${betCount[k]}.`)
                    }
                }
                else if (bet[j].gameStatus !== 'pregame'){
                    let betCount = Object.keys(bet[j].bets)
                    for(let k = 0; k < betCount.length; k++){
                        let liveStat = 0
                        if(betCount[k] === 'PRA'){
                            liveStat = players[i].statistics.points + players[i].statistics.reboundsTotal + players[i].statistics.assists
                        }
                        else{
                            liveStat = players[i].statistics[betCount[k]]
                        }
                        if(liveStat !== bet[j].bets[betCount[k]].curr){
                            let msg = `${bet[j].name} has ${liveStat}/${bet[j].bets[betCount[k]].minValue} ${betCount[k]}.`
                            updateMsg(`${bet[j].name.replace(" ", "-")}-${betCount[k]}`, msg)
                            bet[j].bets[betCount[k]].curr = liveStat
                        }
                    }
                }
            }
        }
    }
}

function updateMsg(id, msg){
    let element = document.getElementById(id)
    if(element){
        element.innerText = msg
    } else{
        let createElement = document.createElement("p")
        createElement.innerText = msg
        createElement.id = id
        createElement.style = "color:white"
        document.body.appendChild(createElement)
    }
    
}

function addLegForm(addLeg){
    let legElement = document.getElementById("legContainer");
    let children = legElement.children
    //legElement.appendChild(document.createElement("hr"))
    //TODO:: Need to change the ID's and append the new div's to another
}
let addLeg = document.getElementById("addLeg")
document.addEventListener("click", addLegForm)
url = "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json"
axios.get(url).then(logScoreboard)
setInterval(getRealStats, 2000)