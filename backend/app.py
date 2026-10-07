from pathlib import Path
import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

CSV = Path(__file__).parent / "data" / "paper_citation_links_within_fsu.csv"

def build_network():
    df = pd.read_csv(CSV, dtype=str)

    # one link per unique (citing, cited) pair; value = number of repeats
    links_df = (df.groupby(["paper_id_1", "paper_id_2"])
                  .size().reset_index(name="value"))

    # nodes = unique ids across BOTH columns
    ids = pd.unique(df[["paper_id_1", "paper_id_2"]].values.ravel())

    return {
        "nodes": [{"id": str(i), "group": 1} for i in ids],
        "links": [{"source": str(s), "target": str(t), "value": int(v)}
                  for s, t, v in links_df.itertuples(index=False)],
    }

@app.get("/api/network")
def network():
    return jsonify(build_network())

@app.get("/api/stats")
def stats():
    net = build_network()
    return jsonify({"n_nodes": len(net["nodes"]), "n_links": len(net["links"])})

if __name__ == "__main__":
    app.run(port=5001, debug=True)