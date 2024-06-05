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

// Define a color scale
const color = d3.scaleQuantize()
    .domain([20000, 90000]) // Adjust the domain based on your data range
    .range(d3.schemeBlues[9]);

// Load and display the map
d3.json("https://unpkg.com/us-atlas/states-10m.json").then(function(us) {
    d3.csv("Table.csv").then(function(data) {
        const gdpData = {};
        data.forEach(d => {
            gdpData[d.GeoFips] = +d["1998"]; // Use 1998 data
        });

        console.log("GDP Data:", gdpData); // Debugging line

        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("class", "state")
            .attr("d", path)
            .style("fill", d => {
                const gdp = gdpData[d.id];
                console.log("State ID:", d.id, "GDP:", gdp); // Debugging line
                return gdp ? color(gdp) : "#ccc";
            })
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "orange");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).style("fill", d => {
                    const gdp = gdpData[d.id];
                    return gdp ? color(gdp) : "#ccc";
                });
            });

        // Add a legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(20,20)");

        const legendWidth = 300;
        const legendHeight = 10;

        const x = d3.scaleLinear()
            .domain(color.domain())
            .range([0, legendWidth]);

        const xAxis = d3.axisBottom(x)
            .ticks(9)
            .tickFormat(d3.format(".0f"));

        legend.selectAll("rect")
            .data(color.range().map(d => {
                const invert = color.invertExtent(d);
                if (invert[0] == null) invert[0] = x.domain()[0];
                if (invert[1] == null) invert[1] = x.domain()[1];
                return invert;
            }))
            .enter().append("rect")
            .attr("height", legendHeight)
            .attr("x", d => x(d[0]))
            .attr("width", d => x(d[1]) - x(d[0]))
            .attr("fill", d => color(d[0]));

        legend.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(xAxis);
    }).catch(function(error) {
        console.error('Error loading CSV data:', error);
    });
}).catch(function(error) {
    console.error('Error loading JSON data:', error);
});
