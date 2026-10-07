import * as d3 from "d3";

export function drawGraph(svgEl, data, { width = 1000, height = 650 } = {}) {
  const svg = d3.select(svgEl)
    .attr("viewBox", [0, 0, width, height]);
  svg.selectAll("*").remove();

  const g = svg.append("g");

    //Data
  const nodes = data.nodes.map(d => ({ ...d }));
  const links = data.links.map(d => ({ ...d }));

  // Draw links and nodes with join(), like the bars in the lab
  const link = g.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

  const node = g.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
      .attr("r", 4)
      .attr("fill", "#782F40"); 

  // Tooltip
  d3.select("body").selectAll(".graph-tooltip").remove();
  const tooltip = d3.select("body").append("div")
    .attr("class", "graph-tooltip")
    .style("position", "absolute")
    .style("background", "rgba(0,0,0,0.8)")
    .style("color", "#fff")
    .style("padding", "8px 12px")
    .style("border-radius", "6px")
    .style("font-size", "13px")
    .style("max-width", "320px")
    .style("text-align", "left")
    .style("pointer-events", "none")
    .style("opacity", 0);

  const truncate = (s, n) => (s.length > n ? s.slice(0, n) + "…" : s);

  node
    .on("mouseover", function (event, d) {
      d3.select(this).attr("r", 7).attr("fill", "#CEB888");
      tooltip
        .html(
          `<strong>${truncate(d.title, 100)}</strong><br/>` +
          `Year: ${d.year}<br/>Venue: ${truncate(d.venue, 60)}<br/>` +
          `Authors: ${truncate(d.authors, 120)}`
        )
        .style("opacity", 1);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 14 + "px")
        .style("top", event.pageY - 36 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("r", 4).attr("fill", "#782F40");
      tooltip.style("opacity", 0);
    });

  // Force simulation
  const simulation = d3.forceSimulation(nodes)
    .alphaDecay(0.05) 
    .force("link", d3.forceLink(links).id(d => d.id).distance(20))
    .force("charge", d3.forceManyBody().strength(-20))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.05))
    .force("y", d3.forceY(height / 2).strength(0.05));

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
  });

  // Zoom + pan: attached to the svg, applied to the group
  const zoom = d3.zoom()
    .scaleExtent([0.05, 20])
    .on("zoom", event => g.attr("transform", event.transform));
  svg.call(zoom);

  // Zoom-to-fit (runs early, then again when the simulation settles)
  function zoomToFit(duration = 750) {
    const [x0, x1] = d3.extent(nodes, d => d.x);
    const [y0, y1] = d3.extent(nodes, d => d.y);
    if (x0 === undefined || x1 === x0 || y1 === y0) return;
    const k = 0.9 * Math.min(width / (x1 - x0), height / (y1 - y0));
    const t = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(k)
      .translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    svg.transition().duration(duration).call(zoom.transform, t);
  }

  setTimeout(() => zoomToFit(500), 2000);   // first fit after ~2 seconds
  simulation.on("end", () => zoomToFit(750)); // final fit when settled

  // Drag individual nodes
  node.call(
    d3.drag()
      .on("start", event => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on("drag", event => {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on("end", event => {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      })
  );
}