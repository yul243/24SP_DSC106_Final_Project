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

// Create a tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load and process data
d3.csv("Table.csv").then(function(data) {
    // Map data to state fips code
    const incomeData = {};
    data.forEach(d => {
        incomeData[d.fips] = +d["2023"];
    });

    // Create color scale
    const color = d3.scaleQuantize()
        .domain(d3.extent(data, d => +d["2023"]))
        .range(d3.schemeBlues[9]);

    // Load and display the map
    d3.json("https://unpkg.com/us-atlas/states-10m.json").then(function(us) {
        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("class", "state")
            .attr("d", path)
            .attr("fill", d => {
                const value = incomeData[d.id];
                return value ? color(value) : "#ccc"; // Use default color if no data
            })
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "orange");
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.properties.name + "<br>" + incomeData[d.id])
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                const value = incomeData[d.id];
                d3.select(this).style("fill", value ? color(value) : "#ccc");
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    });
});
