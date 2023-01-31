bet = {
    '1': {
        'name': 'LeBron James',
        'bets': {
            'points': {
                'minValue': 25,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    '2':{
        'name': 'Jrue Holida',
        'bets': {
            'reboundsTotal': {
                'minValue': 4,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    '3':{
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
    '4': {
        'name': 'Michael Porter Jr.',
        'bets': {
            'reboundsTotal': {
                'minValue': 4,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    '5': {
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
    '6': {
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
    '7': {
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
    '8': {
        'name': 'Paul George',
        'bets': {
            'points': {
                'minValue': 20,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    '9': {
        'name': 'Jalen Brunson',
        'bets': {
            'assists': {
                'minValue': 4,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    '10': {
        'name': 'DeMar DeRozan',
        'bets': {
            'points': {
                'minValue': 20,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    '11': {
        'name': 'Jonas Valanciunas',
        'bets': {
            'points': {
                'minValue': 10,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    '12': {
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
    '13': {
        'name': 'Nikola Jokic',
        'bets': {
            'assists': {
                'minValue': 8,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    '14': {
        'name': 'Jarrett Allen',
        'bets': {
            'points': {
                'minValue': 10,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    '15': {
        'name': 'Mason Plumlee',
        'bets': {
            'reboundsTotal': {
                'minValue': 6,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    '16': {
        'name': 'LaMelo Ball',
        'bets': {
            'assists': {
                'minValue': 6,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    },
    '17': {
        'name': 'Terry Rozier',
        'bets': {
            'points': {
                'minValue': 15,
                'curr': 0
            }
        },
        'gameStatus': 'pregame'
    }
}

function getRealStats(url){
    let request = new XMLHttpRequest();
    request.open("GET", "https://cdn.nba.com/static/json/liveData/boxscore/boxscore_0022200759.json")
    request.send();
    request.onload = () => {
        if (request.status === 200) {
           return JSON.parse(request.response);
        }
        else {
            console.log(`error ${request.status} ${request.statusText}`)
        }
    }
}

function logScoreboard(){

}

function udpateStats(){

}

setInterval(updateStats, 2000)