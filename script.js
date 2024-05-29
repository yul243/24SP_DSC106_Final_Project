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

const color = d3.scaleQuantize([0, 100000], d3.schemeBlues[9]);

d3.json("https://d3js.org/us-10m.v1.json").then(us => {
    svg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", d => color(Math.random() * 100000))
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
                .style("fill", d => color(Math.random() * 100000))
                .attr("transform", "scale(1)");

            d3.select("#tooltip").remove();
        });

    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("class", "state-borders")
        .attr("d", path);
});

