// Set dimensions for the map
const width = 960;
const height = 600;

// Create an SVG element to hold the map
const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

// Define a projection and path generator
const projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Load and display the map
d3.json("https://unpkg.com/us-atlas/states-10m.json").then(function(us) {
    svg.append("g")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("class", "state")
        .attr("d", path)
        .on("mouseover", function(event, d) {
            d3.select(this).style("fill", "orange");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).style("fill", "#ccc");
        });
});
