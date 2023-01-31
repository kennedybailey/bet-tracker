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
        'name': 'Jrue Holida',
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
                'minValue': 20,
                'curr': 0
            },
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
        'name': 'RJ Barret',
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
        'name': 'Stephen Curry',
        'bets': {
            'points': {
                'minValue': 20,
                'curr': 0
            },
            'assists': {
                'minValue': 7,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    }
]
let games = {}

//Functions
function getRealStats(){
    try{
        let url = `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_0022200759.json`
        axios.get(url).then(updateStats)
        for(let i = 0; i < games.length; i++){
            //let url = `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_${games.gameId}.json`
            //axios.get(url).then(updateStats)
        }
    } catch(err){
        console.log(err)
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
        //console.log(players[i].name)
        for(let j = 0; j < bet.length; j++){
            if(players[i].name === bet[j].name){
                if(box.gameStatusText !== 'pregame' && bet[j].gameStatus === 'pregame'){
                    bet[j].gameStatus = 'Started'
                    console.log(`${bet[j].name} has started their game.`)
                }
                else if (box.gameStatusText === 'Final' && bet[j].gameStatus !== 'Final'){
                    bet[j].gameStatus = 'Final'
                    let betCount = Object.keys(bet[j].bets)
                    for(let k = 0; k < betCount.length; k++){
                        console.log(`${bet[j].name} has finished their game with ${players[i].statistics[betCount[k]]}/${bet[j].bets[betCount[k]].minValue} ${betCount[k]}.`)
                    }
                }
            }
        }
    }
}

url = "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json"
axios.get(url).then(logScoreboard)
setInterval(getRealStats, 2000)