// Cytospace
let cy;


let rng = Math.random;

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

// Function to draw graph
function drawGraph(graph){

    let elements = [];

    // Vertices
    graph.vertices.forEach(v => {

        elements.push({
            data:{
                id: String(v.id),
                label: v.label
            }
        });

    });

    // Edges
    graph.edges.forEach(([u,v]) => {

        elements.push({
            data:{
                source: String(u),
                target: String(v)
            }
        });

    });

    if(cy){
        cy.destroy();
    }

    cy = cytoscape({

        container: document.getElementById("cy"),

        elements: elements,

        style:[

            {
                selector:'node',
                style:{
                    'background-color':'white',
                    'border-width':2,
                    'border-color':'black',
                    'label':'data(label)',
                    'text-valign':'center',
                    'text-margin-y':2,
                    'color':'black',
                    'width':35,
                    'height':35,

                    'font-family':'Nunito',
                    'font-size':16,
                    'font-weight':'700'
                }
            },

            {
                selector:'edge',
                style:{
                    'width': 4,
                    'line-color': '#555',
                    'events': 'yes',
                    'overlay-padding': 5
                }
            }

        ],

        layout:{
            name:'cose',
            fit:true,
            padding:50,
            animate:true
        }

    });

    cy.resize();
    cy.fit();

}

// Helper Shuffle FIsher Yates
function shuffle(arr){

    for(let i=arr.length-1;i>0;i--){

        let j=Math.floor(rng()*(i+1));

        [arr[i],arr[j]]=[arr[j],arr[i]];
    }

    return arr;
}

// Helper to generate graph
function randomInt(a,b){
    return Math.floor(rng()*(b-a+1))+a;
}

// Function to get puzzle number
function getPuzzleNumber(launch) {

    const today = new Date();

    // Ignore the time of day
    today.setHours(0, 0, 0, 0);

    
    launch.setHours(0, 0, 0, 0);

    const diff = today - launch;

    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}


