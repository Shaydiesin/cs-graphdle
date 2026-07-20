let spanGraph = null;
let guessHistory = [];
let maxGuesses = 20;


function generateSpanningGraph(){

    const n = randomInt(8,15);

    // const n = 8;

    // ---------- Generate Random Tree ----------
    let order = [...Array(n).keys()];
    shuffle(order);

    let treeEdges = [];

    for(let i = 1; i < n; i++){

        let parent = randomInt(0, i - 1);

        treeEdges.push([
            order[i],
            order[parent]
        ]);

    }

    // ---------- Random Isomorphism ----------
    let perm = [...Array(n).keys()];
    shuffle(perm);

    let hiddenTree = treeEdges.map(([u,v]) => [
        perm[u],
        perm[v]
    ]);

    // ---------- Graph ----------
    let graph = {

        vertices: [],

        edges: [],

        hiddenTree: hiddenTree

    };

    // Vertices

    for(let i = 0; i < n; i++){

        graph.vertices.push({

            id: i,

            label: String(i + 1)

        });

    }

    // Start with tree edges

    hiddenTree.forEach(e => graph.edges.push(e));

    // Helper

    function edgeExists(u,v){

        return graph.edges.some(([a,b]) =>

            (a === u && b === v) ||

            (a === v && b === u)

        );

    }

    // ---------- Extra Edges ----------

    for(let i = 0; i < n; i++){

        for(let j = i + 1; j < n; j++){

            if(edgeExists(i,j))
                continue;

            if(rng() < 0.20){

                graph.edges.push([i,j]);

            }

        }

    }

    return graph;

}

// Initialize all edges for interaction
function initializeEdges(){

    cy.edges().forEach(edge => {

        edge.data("selected", false);

        updateEdgeStyle(edge);
        updateSelectedCount();

        edge.on("tap", () => {

            // Toggle selection
            edge.data(
                "selected",
                !edge.data("selected")
            );
            updateEdgeStyle(edge);
            updateSelectedCount();

        });

    });

}

// Helper to update the appearance of an edge
function updateEdgeStyle(edge){

    if(edge.data("selected")){

        edge.style({
            "line-color": "dodgerblue",
            "width": 4
        });

    }
    else{

        edge.style({
            "line-color": "#555",
            "width": 2
        });

    }

}

// Validating Spanning Tree
function validateSpan(){

    const n = cy.nodes().length;

    const selectedEdges = cy.edges().filter(edge =>
        edge.data("selected")
    );

    // Must select exactly n-1 edges
    if(selectedEdges.length !== n - 1){

        alert("Please select exactly " + (n - 1) + " edges.");

        return false;

    }

    // ---------- Union-Find ----------

    let parent = [];

    for(let i = 0; i < n; i++)
        parent[i] = i;

    function find(x){

        if(parent[x] !== x)
            parent[x] = find(parent[x]);

        return parent[x];

    }

    function unite(a,b){

        a = find(a);
        b = find(b);

        if(a === b)
            return false;

        parent[a] = b;

        return true;

    }

    // Check for cycles

    for(const edge of selectedEdges){

        const u = Number(edge.source().id());
        const v = Number(edge.target().id());

        if(!unite(u,v)){

            alert("Your selected edges contain a cycle.");

            return false;

        }

    }

    // Check connected

    const root = find(0);

    for(let i = 1; i < n; i++){

        if(find(i) !== root){

            alert("Your selected edges do not form a spanning tree.");

            return false;

        }

    }

    return true;

}

// Reset Selection
function resetSpan(){

    cy.edges().forEach(edge => {

        edge.data("selected", false);

        updateEdgeStyle(edge);

    });
    updateSelectedCount();

}

// Function to score the guess
function scoreGuess(){

    // ========== LOGGING THE ACTUAL SPANNIGN TREE=====
    console.log("Hidden Spanning Tree:");

    spanGraph.hiddenTree.forEach(([u, v]) => {
        console.log(`${u} -- ${v}`);
    });

    // ---------- Hidden tree ----------

    const solution = new Set();

    spanGraph.hiddenTree.forEach(([u,v]) => {

        const key = (u < v)
            ? `${u}-${v}`
            : `${v}-${u}`;

        solution.add(key);

    });

    // ---------- Selected edges ----------

    const selectedEdges = [];

    const selectedSet = new Set();

    let correctEdges = 0;

    cy.edges().forEach(edge => {

        if(!edge.data("selected"))
            return;

        const u = Number(edge.source().id());
        const v = Number(edge.target().id());

        selectedEdges.push([u,v]);

        const key = (u < v)
            ? `${u}-${v}`
            : `${v}-${u}`;

        selectedSet.add(key);

        if(solution.has(key))
            correctEdges++;

    });

    // ---------- Correct vertices ----------

    let correctVertices = [];

    cy.nodes().forEach(node => {

        const id = Number(node.id());

        let correct = true;

        node.connectedEdges().forEach(edge => {

            const u = Number(edge.source().id());
            const v = Number(edge.target().id());

            const key = (u < v)
                ? `${u}-${v}`
                : `${v}-${u}`;

            const inSolution = solution.has(key);
            const inGuess = selectedSet.has(key);

            if(inSolution !== inGuess)
                correct = false;

        });

        if(correct)
            correctVertices.push(id);

    });

    return {

        selectedEdges,

        correctEdges,

        correctVertices

    };

}

// Check Guess 
function checkGuess(){

    if(!validateSpan())
        return;

    const feedback = scoreGuess();

    guessHistory.push(feedback);

    renderSpanningHistory();

    if (feedback.correctEdges === cy.nodes().length - 1) {

        alert("🎉 You found the hidden spanning tree!");

        return;
    }

    // console.log(feedback);

    // renderHistory();

    // resetSpan();

}

// Render the history
function renderSpanningHistory(){

    const history = document.getElementById("spanning-guess-history");

    history.innerHTML = "";

    const visible = guessHistory.slice(-5).reverse();

    visible.forEach((guess, index) => {

        const guessNumber =
            guessHistory.length - index;

        const card = document.createElement("div");

        card.className = "spanning-guess-card";

        card.innerHTML = `
            <div class="guess-header">

                <span class="guess-title">
                    Guess ${guessNumber}
                </span>

                <span class="guess-score">
                    ✓ ${guess.correctEdges}/${cy.nodes().length - 1}
                </span>

            </div>

            <div
                class="mini-span-graph"
                id="mini-span-${guessNumber}">
            </div>

            <div class="guess-footer">
                🟢 ${guess.correctVertices.length} vertices
            </div>
        `;

        history.appendChild(card);

        drawMiniSpanGraph(
            `mini-span-${guessNumber}`,
            guess
        );

    });

}
// Display Tree Size

function updateTreeSize(){

    const size = spanGraph.vertices.length - 1;

    document.querySelectorAll(".tree-size").forEach(el => {
        el.textContent = size;
    });

}

// Mini Spanning Graph
function drawMiniSpanGraph(containerId, guess){

    let elements = [];

    // ---------- Nodes ----------

    cy.nodes().forEach(node => {

        elements.push({

            data:{
                id:node.id(),
                label:node.data("label")
            },

            position:{
                x:node.position("x"),
                y:node.position("y")
            }

        });

    });

    // ---------- Selected edges ----------

    const selected = new Set();

    guess.selectedEdges.forEach(([u,v]) => {

        const key =
            (u<v)
            ? `${u}-${v}`
            : `${v}-${u}`;

        selected.add(key);

    });

    cy.edges().forEach(edge => {

        const u = Number(edge.source().id());
        const v = Number(edge.target().id());

        const key =
            (u<v)
            ? `${u}-${v}`
            : `${v}-${u}`;

        elements.push({

            data:{
                source:String(u),
                target:String(v),
                selected:selected.has(key)
            }

        });

    });

    // ---------- Mini Cytoscape ----------

    cytoscape({

        container:document.getElementById(containerId),

        elements,

        style:[

            {

                selector:"node",

                style:{

                    "background-color":ele =>
                    guess.correctVertices.includes(Number(ele.id()))
                        ? "#2ecc71"
                        : "#ffffff",

                    "border-width":2,

                    "border-color":ele =>

                        guess.correctVertices.includes(
                            Number(ele.id())
                        )
                        ? "green"
                        : "black",

                    "label":"",

                    "width":10,

                    "height":10

                }

            },

            {

                selector:"edge",

                style:{

                    "width":2,

                    "line-color":ele =>

                        ele.data("selected")
                        ? "dodgerblue"
                        : "#cccccc"

                }

            }

        ],

        layout:{
            name:"preset"
        },

        userZoomingEnabled:false,
        userPanningEnabled:false,
        boxSelectionEnabled:false,
        autoungrabify:true,
        autolock:true

    });

}


// Update selected count
function updateSelectedCount(){

    const count = cy.edges().filter(edge => edge.data("selected")).length;

    const span =
        document.getElementById("selected-count");

    span.textContent = count;

    const target = cy.nodes().length - 1;

    if(count < target)
        span.style.color = "#e67e22";

    else if(count === target)
        span.style.color = "#16a34a";

    else
        span.style.color = "#dc2626";

}

////////////////////////
/////////MAIN///////////
////////////////////////



const launchDateSpanning = new Date("2026-07-19");

// Code to display puzzle number
document.getElementById("title").textContent =
    "CS-Graphdle Spanning Tree #" + getPuzzleNumber(launchDateSpanning);

const today_date = new Date();

// Code to display the date
document.getElementById("date").textContent =
    today_date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

spanGraph = generateSpanningGraph();

drawGraph(spanGraph);
updateTreeSize();

initializeEdges();

window.addEventListener("resize", () => {
    cy.resize();
    cy.fit();
});
