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
    // Map data to state names and FIPS codes
    const incomeData = {};
    data.forEach(d => {
        incomeData[d.State] = +d["2023"];
    });

    // Debugging: Log incomeData to verify
    console.log("Income Data:", incomeData);

    // Create color scale
    const color = d3.scaleQuantize()
        .domain(d3.extent(data, d => +d["2023"]))
        .range(d3.schemeBlues[9]);

    // Load and display the map
    d3.json("https://unpkg.com/us-atlas/states-10m.json").then(function(us) {
        const states = topojson.feature(us, us.objects.states).features;

        // Debugging: Log state data to verify FIPS codes
        states.forEach(d => {
            console.log("State Name:", d.properties.name, "State ID:", d.id);
        });

        svg.append("g")
            .selectAll("path")
            .data(states)
            .enter().append("path")
            .attr("class", "state")
            .attr("d", path)
            .attr("fill", d => {
                const value = incomeData[d.properties.name];
                console.log("State:", d.properties.name, "Value:", value); // Log each state name and value
                return value ? color(value) : "#ccc"; // Use default color if no data
            })
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "orange");
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                const income = incomeData[d.properties.name];
                tooltip.html(d.properties.name + "<br>" + (income !== undefined ? income : "No data"))
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                const value = incomeData[d.properties.name];
                d3.select(this).style("fill", value ? color(value) : "#ccc");
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Add a legend
        const legendWidth = 300;
        const legendHeight = 20;
        const legendMargin = {top: 10, right: 10, bottom: 30, left: 10};

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - legendWidth - 50}, ${height - legendHeight - legendMargin.bottom})`);

        // Create legend scale
        const legendScale = d3.scaleLinear()
            .domain(color.domain())
            .range([0, legendWidth]);

        // Create legend axis
        const legendAxis = d3.axisBottom(legendScale)
            .tickSize(legendHeight)
            .tickValues(color.range().map(d => color.invertExtent(d)[0]));

        // Add colored rectangles for legend
        legend.selectAll("rect")
            .data(color.range().map(d => color.invertExtent(d)))
            .enter().append("rect")
            .attr("x", d => legendScale(d[0]))
            .attr("y", 0)
            .attr("width", d => legendScale(d[1]) - legendScale(d[0]))
            .attr("height", legendHeight)
            .attr("fill", d => color(d[0]));

        // Add legend axis
        legend.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis)
            .select(".domain")
            .remove();
    });
});
