## Setup

```bash
pip install -r requirements.txt
```

Download stockfish binary from https://stockfishchess.org/

## Usage

Separated into 2 steps for easier debugging. You can re-run the report without having to re-fetch/analyze the games.

1. Fetch and analyze the games

    ```bash
    # python analyze.py <tournament-id> <path/to/stockfish>

    python analyze.py hs6U04DP stockfish/stockfish-ubuntu-x86-64-avx2
    ```

    Saves to `results.json`

2. Parse the results and generate a report

    ```bash
    python report.py
    ```
