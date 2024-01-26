import json
import berserk
import chess
import chess.engine
import sys

tournament_id = sys.argv[1]
stockfish_path = sys.argv[2]

default_player = {'games': 0, 'moves': 0, 'blunders': 0, 'blunder_cpl_sum': 0, 'berserks': 0}

def stockfish_evaluation(board, time_limit = 0.1):
    engine = chess.engine.SimpleEngine.popen_uci(stockfish_path)
    result = engine.analyse(board, chess.engine.Limit(time=time_limit))
    engine.close()
    return result['score']

client = berserk.Client()

lichess_games = []

for game in client.tournaments.export_arena_games(tournament_id):
    lichess_games.append(game)

games = []
players = {}

for game in lichess_games:
    white_player = game['players']['white']['user']['name']
    black_player = game['players']['black']['user']['name']

    if 'title' in game['players']['white']['user']:
        white_player = f"{game['players']['white']['user']['title']} {white_player}"
    if 'title' in game['players']['black']['user']:
        black_player = f"{game['players']['black']['user']['title']} {black_player}"

    print(f"{len(games)}/{len(lichess_games)} done: Analyzing https://lichess.org/{game['id']} - {white_player} vs {black_player} ")

    if white_player not in players:
        players[white_player] = default_player.copy()
    if black_player not in players:
        players[black_player] = default_player.copy()

    players[white_player]['games'] += 1
    players[black_player]['games'] += 1

    if 'berserk' in game['players']['white']:
        players[white_player]['berserks'] += 1
    if 'berserk' in game['players']['black']:
        players[black_player]['berserks'] += 1

    last_eval = 0
    game_blunder_count = 0

    board = chess.Board()
    for move in game['moves'].split():
        players[white_player]['moves'] += 1
        players[black_player]['moves'] += 1

        board.push_san(move)
        if board.is_game_over():
            break

        result = stockfish_evaluation(board)

        if result.is_mate():
            score = result.white().mate() * 1000
        else:
            score = result.white().score()

        score = max(-850, min(850, score))

        blunder_level = abs(score - last_eval)
        last_eval = score

        if blunder_level > 200:
            print(f"  blunder at move {move}: {str(blunder_level)}")
            game_blunder_count += 1
            if board.turn == chess.WHITE:
                players[black_player]['blunders'] += 1
                players[black_player]['blunder_cpl_sum'] += blunder_level
            else:
                players[white_player]['blunders'] += 1
                players[white_player]['blunder_cpl_sum'] += blunder_level

    games.append({
        'url': f"https://lichess.org/{game['id']}",
        'title': f"{white_player} vs {black_player}",
        'blunders': game_blunder_count,
    })

    f = open("results.json", "w")
    f.write(json.dumps({
        'games': games,
        'players': players
    }, indent=2))

print("Done!")
