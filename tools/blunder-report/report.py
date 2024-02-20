import json
import pprint
from tabulate import tabulate

with open('results.json') as f:
    data = json.load(f)

def player_report():
    report = []

    for player in data['players']:
        row = {}
        row['Player'] = player
        row['Blunders'] = data['players'][player]['blunders']
        row['Games'] = data['players'][player]['games']
        row['Berserk %'] = round(data['players'][player]['berserks'] / data['players'][player]['games'] * 100)
        row['BPG'] = round(data['players'][player]['blunders'] / data['players'][player]['games'], 2)
        row['BPM'] = round(data['players'][player]['blunders'] / data['players'][player]['moves'], 3)

        report.append(row)

    # sort report list by "Blunders" descending
    report.sort(key=lambda x: x['Blunders'], reverse=True)

    # pp = pprint.PrettyPrinter(indent=4)
    # pp.pprint(report)

    print(tabulate(report, headers="keys"))

def most_blundered_game():
    games = data['games']
    games.sort(key=lambda x: x['blunders'], reverse=True)

    # filter games to only the one with the most blunders or tied with the most blunders
    most_blunders = games[0]['blunders']
    games = list(filter(lambda x: x['blunders'] == most_blunders, games))
    print(f"Special shoutout to the most blunderful {'game' if len(games) == 1 else 'games'} of the week!")

    for game in games:
        print(f"- **{game['title']}** - <{game['url']}>")

def zerkers():
    zerkers = []
    for player in data['players']:
        if data['players'][player]['berserks'] == data['players'][player]['games']:
            zerkers.append({
                'name': player,
                'games': data['players'][player]['games']
            })

    zerkers.sort(key=lambda x: x['games'], reverse=True)

    # need at least 3 games to be considered a zerker
    zerkers = list(filter(lambda x: x['games'] >= 3, zerkers))

    print(f"Special shoutout to the {len(zerkers)} players who berserked all of their games!")
    for zerker in zerkers:
        print(f"- **{zerker['name']}** *(x{zerker['games']})*")

def summary():
    # total players, total games, and total blunders
    total_players = len(data['players'])
    total_games = len(data['games'])
    total_blunders = 0
    for player in data['players']:
        total_blunders += data['players'][player]['blunders']

    print(f"There were {total_players} players who played {total_games} games and made **{total_blunders} blunders**!")

print("## Blunder Report")
summary()
print('```')
player_report()
print('```')

print()
most_blundered_game()

print()
zerkers()
