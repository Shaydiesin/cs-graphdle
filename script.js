let cy;
let rng = Math.random;

// Global solution hint
let solutionMatching = [];
let hintedVertices = [];
let hintUsed = false;

const today = new Date().toISOString().slice(0, 10);
const seed = xmur3(today);
rng = mulberry32(seed());

// Hashing the Seed
function xmur3(str) {
    let h = 1779033703 ^ str.length;

    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }

    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}

function mulberry32(a) {
    return function () {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Graph generator
function generateGraph(){

    const p = randomInt(5,10);
    const n = 2*p;

    let elements=[];

    // vertices
    for(let i=0;i<n;i++){
        elements.push({
            data:{
                id:String(i),
                label:String(i+1)
            }
        });
    }

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

    // Convert edges into Cytoscape elements
    edges.forEach(([u,v]) => {

        elements.push({
            data:{
                source:String(perm[u]),
                target:String(perm[v])
            }
        });

    });

    let permutedMatching = matching.map(([u,v]) => [
        perm[u],
        perm[v]
    ]);

    solutionMatching = permutedMatching;


    if(cy){
        cy.destroy();
    }

    cy = cytoscape({

        container:document.getElementById("cy"),

        elements:elements,

        style:[

            {
                selector:'node',
                style:{
                    'background-color':'white',
                    'border-width':2,
                    'border-color':'black',
                    'label':'data(label)',
                    'text-valign':'center',
                    'text-margin-y': 2,
                    'color':'black',
                    'width':35,
                    'height':35,

                    'font-family': 'Nunito',
                    'font-size': 16,
                    'font-weight': '700'
                }
            },

            {
                selector:'edge',
                style:{
                    'width':2,
                    'line-color':'#555'
                }
            }

        ],

        layout: {
            name: 'cose',
            fit: true,
            padding: 50,
            animate: true
        }

    });

    // Color cycling
    cy.nodes().forEach(node=>{

        node.data("state",0);

        node.on("tap", () => {

            // Remove previous validation highlights
            node.style({
                "border-color": "black",
                "border-width": 2
            });

            let state = (node.data("state") + 1) % 3;
            node.data("state", state);

            updateNodeColor(node);

        });

    });

    cy.resize();
    cy.fit();


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
function resetGraph() {

    // Reset all nodes
    cy.nodes().forEach(node => {
        let id = Number(node.id());
        if (hintedVertices.includes(id))
            return;
        node.data("state", 0);
        updateNodeColor(node);
    });
}

// Helper Shuffle FIsher Yates
function shuffle(arr){

    for(let i=arr.length-1;i>0;i--){

        let j=Math.floor(rng()*(i+1));

        [arr[i],arr[j]]=[arr[j],arr[i]];
    }

    return arr;
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

// Helper to generate graph
function randomInt(a,b){
    return Math.floor(rng()*(b-a+1))+a;
}

// Function to get puzzle number
function getPuzzleNumber() {

    const today = new Date();

    // Ignore the time of day
    today.setHours(0, 0, 0, 0);

    const launch = new Date("2026-07-17");
    launch.setHours(0, 0, 0, 0);

    const diff = today - launch;

    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

// Function to show hint
function showHint() {

    if (hintUsed)
        return;

    hintUsed = true;

    let [u, v] = solutionMatching[
        Math.floor(rng() * solutionMatching.length)
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

////////////////////////
/////////MAIN///////////
////////////////////////

const launchDate = new Date("2026-07-17");

// Code to display puzzle number
document.getElementById("title").textContent =
    "CS-Graphdle #" + getPuzzleNumber();

const today_date = new Date();

// Code to display the date
document.getElementById("date").textContent =
    today_date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

generateGraph();

window.addEventListener("resize", () => {
    cy.resize();
    cy.fit();
});
