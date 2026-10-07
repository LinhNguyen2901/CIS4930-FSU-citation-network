<script setup>
import { ref, onMounted } from "vue";
import { drawGraph } from "./forceGraph.js";

const svgRef = ref(null);
const status = ref("Loading...");

onMounted(async () => {
  try {
    const res = await fetch("http://127.0.0.1:5001/api/network");
    const data = await res.json();
    status.value = `${data.nodes.length} papers, ${data.links.length} citation links`;
    drawGraph(svgRef.value, data, { width: 1000, height: 650 });
  } catch (err) {
    status.value = "Could not load data. Is the Flask backend running?";
    console.error(err);
  }
});
</script>

<template>
  <div class="page">
    <h1>Citation Network Visualization in FSU (ltn23, Linh Nguyen)</h1>
    <p>{{ status }}</p>
    <svg ref="svgRef" class="graph"></svg>
  </div>
</template>

<style scoped>
.page { font-family: sans-serif; text-align: center; }
h1 { color: #782F40; }
.graph { width: 1000px; height: 650px; border: 1px solid #ccc; background: white; cursor: grab; }
</style>