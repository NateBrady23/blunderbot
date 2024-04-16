import json
import berserk
import chess
import chess.engine
import sys

tournament_id = sys.argv[1]
stockfish_path = sys.argv[2]

default_player = {'games': 0, 'moves': 0, 'blunders': 0, 'blunder_cpl_sum': 0, 'berserks': 0}

def winning_chance(cp):
    """
    Calculate the winning chance based on the given centipawn (cp) value.
    Uses a sigmoid function with a given multiplier and then linearly transforms it to a percentage.

    :param cp: The centipawn value.
    :return: The winning chance as a percentage.
    """
    MULTIPLIER = -0.00368208
    # Calculate the winning probability with the sigmoid function
    winning_probability = 2 / (1 + 10 ** (MULTIPLIER * cp)) - 1
    # Transform the winning probability to a percentage
    win_percent = 50 + (50 * winning_probability)
    # Ensure the result is within the range [0, 100]
    win_percent_clamped = max(0, min(100, win_percent))
    return win_percent_clamped

def stockfish_evaluation(board, time_limit=0.5):
    engine = chess.engine.SimpleEngine.popen_uci(stockfish_path)
    result = engine.analyse(board, chess.engine.Limit(time=time_limit))
    engine.close()
    cp = result['score'].white().score(mate_score=1000)
    return winning_chance(cp)

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

    # Assume starting chances are even
    prev_winning_chance = 50
    game_blunder_count = 0

    board = chess.Board()
    for move in game['moves'].split():
        players[white_player]['moves'] += 1
        players[black_player]['moves'] += 1

        board.push_san(move)
        if board.is_game_over():
            break

        current_winning_chance = stockfish_evaluation(board)

        # Calculate the change in winning chance
        delta_winning_chance = abs(current_winning_chance - prev_winning_chance)
        prev_winning_chance = current_winning_chance

        # Define a threshold for blunders, e.g., 30 change in winning chance
        if delta_winning_chance >= 30:
            print(f"  blunder at move {move}: {delta_winning_chance}")
            game_blunder_count += 1
            if board.turn == chess.WHITE:
                players[black_player]['blunders'] += 1
            else:
                players[white_player]['blunders'] += 1


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
