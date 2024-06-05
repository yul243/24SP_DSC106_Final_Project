<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>US Household Income Visualization</title>
    <script src="https://d3js.org/d3.v6.min.js"></script>
    <title>US State GDP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        .state {
            fill: #cccccc;
            stroke: #ffffff;
            stroke-width: 1.5;
            fill: #ccc;
            stroke: #fff;
            stroke-width: 1;
        }
        .highlighted {
        .state:hover {
            fill: orange;
        }
    </style>
</head>
<body>
    <h1>US Household Income Visualization</h1>
    <svg width="960" height="600"></svg>

    <script>
        const width = 960;
        const height = 600;

        const svg = d3.select("svg")
            .attr("width", width)
            .attr("height", height);

        const projection = d3.geoAlbersUsa()
            .scale(1000)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        d3.json("https://d3js.org/us-10m.v1.json").then(us => {
            svg.append("g")
                .selectAll("path")
                .data(topojson.feature(us, us.objects.states).features)
                .enter().append("path")
                .attr("class", "state")
                .attr("d", path)
                .on("mouseover", function(d) {
                    d3.select(this).classed("highlighted", true);
                })
                .on("mouseout", function(d) {
                    d3.select(this).classed("highlighted", false);
                });
        });
    </script>
    <div id="map"></div>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <script src="https://unpkg.com/topojson@3"></script>
    <script src="https://unpkg.com/us-atlas/states-10m.json"></script>
    <script src="script.js"></script>
</body>
</html>

 31 changes: 31 additions & 0 deletions31  
script.js
Original file line number	Diff line number	Diff line change
@@ -0,0 +1,31 @@
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
