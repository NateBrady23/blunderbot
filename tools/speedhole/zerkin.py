import berserk
from tabulate import tabulate

client = berserk.Client()

all_bbbs = []

for arena in client.tournaments.tournaments_by_user('NateBrady23'):
    # exclude team battles, birthday arenas, etc
    if 'title' not in arena['fullName'].lower():
        continue

    # ignore BBB titles before 2022-10-26
    # https://lichess.org/api/tournament/PhbR5pAq was the first one that counts
    if arena['startsAt'] < 1666742400000:
        continue

    # ignore future scheduled tournaments
    if 'secondsToStart' in arena:
        continue

    all_bbbs.append(arena)

print(f"Found {len(all_bbbs)} BBB tournaments")

default_player = {'games': 0, 'berserks': 0, 'totalWins': 0, 'berserkWins': 0, 'winRate': 0, 'berserkRate': 0, 'berserkWinRate': 0}
players = {}

for arena in all_bbbs:
    print(f"Analyzing {arena['fullName']}")

    for game in client.tournaments.export_arena_games(arena['id']):
        for color in ['white', 'black']:
            player_name = game['players'][color]['user']['name']

            if 'title' in game['players'][color]['user']:
                player_name = f"{game['players'][color]['user']['title']} {player_name}"

            if player_name not in players:
                players[player_name] = default_player.copy()

            players[player_name]['games'] += 1

            if 'berserk' in game['players'][color]:
                players[player_name]['berserks'] += 1

            if 'winner' in game and game['winner'] == color:
                players[player_name]['totalWins'] += 1
                if 'berserk' in game['players'][color]:
                    players[player_name]['berserkWins'] += 1

            players[player_name]['winRate'] = players[player_name]['totalWins'] / players[player_name]['games'] if players[player_name]['games'] > 0 else 0
            players[player_name]['berserkRate'] = players[player_name]['berserks'] / players[player_name]['games'] if players[player_name]['games'] > 0 else 0
            players[player_name]['berserkWinRate'] = players[player_name]['berserkWins'] / players[player_name]['berserks'] if players[player_name]['berserks'] > 0 else 0

report = []
for player in players:
    row = {}
    row['Player'] = player
    row['Games'] = players[player]['games']
    row['Berserks'] = players[player]['berserks']
    row['% Berserk'] = round(players[player]['berserkRate'] * 100)
    row['Total Wins'] = players[player]['totalWins']
    row['% Win'] = round(players[player]['winRate'] * 100)
    row['Berserk Wins'] = players[player]['berserkWins']
    row['% Berserk Win'] = round(players[player]['berserkWinRate'] * 100)
    report.append(row)

report.sort(key=lambda x: x['Berserks'], reverse=True)

print("## Speedhole Leaderboard")
print(f"{len(all_bbbs)} BBB tournaments analyzed")
print('```')
print(tabulate(report, headers="keys"))
print('```')
