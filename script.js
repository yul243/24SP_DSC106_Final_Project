const width = 960;
const height = 600;

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

d3.json("https://d3js.org/us-10m.v1.json").then(us => {
    svg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", "orange")
                .attr("transform", "scale(1.05)");

            const coordinates = d3.pointer(event);

            d3.select("#map").append("text")
                .attr("id", "tooltip")
                .attr("x", coordinates[0])
                .attr("y", coordinates[1])
                .attr("text-anchor", "middle")
                .text("State: " + d.properties.name);
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .style("fill", null)
                .attr("transform", "scale(1)");

            d3.select("#tooltip").remove();
        });
});
