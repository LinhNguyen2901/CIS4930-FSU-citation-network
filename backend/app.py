from pathlib import Path
import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

CSV = Path(__file__).parent / "data" / "paper_citation_links_within_fsu.csv"
WORKS = Path(__file__).parent / "data" / "fsu_works_2021_2026.csv"

def build_network():
    df = pd.read_csv(CSV, dtype=str)

    links_df = (df.groupby(["paper_id_1", "paper_id_2"])
                  .size().reset_index(name="value"))
    ids = pd.unique(df[["paper_id_1", "paper_id_2"]].values.ravel())

    # paper metadata, looked up by id
    works = (pd.read_csv(WORKS, dtype=str)
               .drop_duplicates("openalex_id")
               .set_index("openalex_id")[["title", "publication_year", "venue", "authors"]]
               .fillna("")
               .to_dict("index"))

    def short_authors(s):
        names = [a for a in s.split("; ") if a]
        return "; ".join(names[:5]) + (f" (+{len(names) - 5} more)" if len(names) > 5 else "")

    nodes = []
    for i in ids:
        i = str(i)
        m = works.get(i, {})
        nodes.append({
            "id": i,
            "group": 1,
            "title": m.get("title", "") or "(no title)",
            "year": m.get("publication_year", ""),
            "venue": m.get("venue", "") or "(no venue)",
            "authors": short_authors(m.get("authors", "")),
        })

    return {
        "nodes": nodes,
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