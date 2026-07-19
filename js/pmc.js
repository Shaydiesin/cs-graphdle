
let currentGraph = null;

// Global solution hint
let hintedVertices = [];
let hintUsed = false;


// Graph generator
function generatePMCGraph(){

    const p = randomInt(5,10);
    const n = 2*p;

    // ---------- Generate Perfect Matching Cut Graph ----------

    let left = [];
    let right = [];

    for(let i=0;i<n/2;i++) left.push(i);
    for(let i=n/2;i<n;i++) right.push(i);

    let edges = [];
    let matching = [];

    // Random perfect matching
    shuffle(right);

    for(let i=0;i<left.length;i++){
        let e = [left[i], right[i]];

        edges.push(e);
        matching.push(e);
    }

    // Generate connected graph inside one side
    function connectSide(side){

        let order = [...side];
        shuffle(order);

        // Random spanning tree
        for(let i=1;i<order.length;i++){

            let parent = Math.floor(rng()*i);

            edges.push([order[i], order[parent]]);
        }

        // Extra internal edges
        for(let i=0;i<side.length;i++){

            for(let j=i+1;j<side.length;j++){

                if(rng()<0.25){

                    let u = side[i];
                    let v = side[j];

                    let exists = edges.some(e =>
                        (e[0]==u && e[1]==v) ||
                        (e[0]==v && e[1]==u)
                    );

                    if(!exists)
                        edges.push([u,v]);
                }
            }
        }
    }

    connectSide(left);
    connectSide(right);

    // Random isomorphism
    let perm = [...Array(n).keys()];
    shuffle(perm);

    let graph = {

        vertices: [],

        edges: [],

        solution: []

    };

    // Vertices
    for (let i = 0; i < n; i++) {

        graph.vertices.push({
            id: i,
            label: String(i + 1)
        });

    }

    // Edges
    edges.forEach(([u, v]) => {

        graph.edges.push([
            perm[u],
            perm[v]
        ]);

    });

    // Solution
    graph.solution = matching.map(([u, v]) => [
        perm[u],
        perm[v]
    ]);

    return graph;

}

// Validation function to check the solution
function validatePMC() {

    // Check every vertex is colored
    for (const node of cy.nodes()) {
        if (node.data("state") === 0) {
            alert("Please color every vertex.");
            return false;
        }
    }

    // Reset styling
    cy.nodes().style({
        "border-color": "black",
        "border-width": 2
    });

    cy.edges().style({
        "line-color": "#555",
        "width": 2
    });

    let valid = true;

    cy.nodes().forEach(node => {

        const myColor = node.data("state");
        let oppositeCount = 0;

        const neighbors = node.neighborhood('node');

        // Check that the vertex has a neighbour
        if (neighbors.length === 0) {
            valid = false;
            node.style({
                "border-color": "orange",
                "border-width": 2
            });
            return;
        }

        neighbors.forEach(neighbor => {
            if (neighbor.data("state") !== myColor) {
                oppositeCount++;
            }
        });

        // Exactly one neighbour must be in the opposite partition
        if (oppositeCount !== 1) {
            valid = false;

            node.style({
                "border-color": "orange",
                "border-width": 2
            });
        }

    });

    if (valid) {
        alert("🎉 Perfect Matching Cut Found!");
    } else {
        alert("❌ Invalid Perfect Matching Cut.");
    }

    return valid;
}

// Reset functionality
function resetPMCGraph() {

    // Reset all nodes
    cy.nodes().forEach(node => {
        let id = Number(node.id());
        if (hintedVertices.includes(id))
            return;
        node.data("state", 0);
        updateNodeColor(node);
    });
}

// Helper Update the color of node
function updateNodeColor(node) {

    switch(node.data("state")) {

        case 0:
            node.style("background-color", "white");
            break;

        case 1:
            node.style("background-color", "red");
            break;

        case 2:
            node.style("background-color", "dodgerblue");
            break;
    }

}

// Function to show hint
function showHint() {

    if (hintUsed)
        return;

    hintUsed = true;

    let [u, v] = currentGraph.solution[
        Math.floor(rng() * currentGraph.solution.length)
    ];

    cy.$(`edge[source="${u}"][target="${v}"],
          edge[source="${v}"][target="${u}"]`)
      .style({
          "line-color": "green",
          "width": 3
      });
      
    hintedVertices = [u, v];

    // Color the endpoints
    let nodeU = cy.getElementById(String(u));
    let nodeV = cy.getElementById(String(v));

    nodeU.data("state", 1);   // Red
    updateNodeColor(nodeU);

    nodeV.data("state", 2);   // Blue
    updateNodeColor(nodeV);
}

// To initialize PMC
function initializePMC() {

    cy.nodes().forEach(node => {

        node.data("state", 0);

        node.on("tap", () => {

            if (hintedVertices.includes(Number(node.id())))
                return;

            node.style({
                "border-color": "black",
                "border-width": 2
            });

            let state = (node.data("state") + 1) % 3;
            node.data("state", state);

            updateNodeColor(node);
        });
    });
}

////////////////////////
/////////MAIN///////////
////////////////////////

const launchDatePMC = new Date("2026-07-17");

// Code to display puzzle number
document.getElementById("title").textContent =
    "CS-Graphdle PMC #" + getPuzzleNumber(launchDatePMC);

const today_date = new Date();

// Code to display the date
document.getElementById("date").textContent =
    today_date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

currentGraph = generatePMCGraph();
drawGraph(currentGraph);
initializePMC();

window.addEventListener("resize", () => {
    cy.resize();
    cy.fit();
});

