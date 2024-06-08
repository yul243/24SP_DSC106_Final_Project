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
    // Create a nested object with years as keys
    const incomeData = {};
    data.forEach(d => {
        for (let year = 1998; year <= 2023; year++) {
            if (!incomeData[year]) {
                incomeData[year] = {};
            }
            incomeData[year][d.State] = +d[year];
        }
    });

    // Debugging: Log incomeData to verify
    console.log("Income Data:", incomeData);

    // Create color scale
    const color = d3.scaleQuantize()
        .range(d3.schemeBlues[9]);

    // Update the legend with income ranges
    function updateLegend() {
        const legend = d3.select("#legend");
        legend.selectAll("*").remove(); // Clear any existing legend items

        const incomeRange = color.range().map(d => color.invertExtent(d));
        incomeRange.forEach(range => {
            legend.append("div")
                .attr("class", "legend-item")
                .style("background", `linear-gradient(to right, ${color(range[0])}, ${color(range[1])})`)
                .text(`${Math.round(range[0])} - ${Math.round(range[1])}`);
        });
    }

    // Load and display the map
    d3.json("https://unpkg.com/us-atlas/states-10m.json").then(function(us) {
        const states = topojson.feature(us, us.objects.states).features;

        svg.append("g")
            .selectAll("path")
            .data(states)
            .enter().append("path")
            .attr("class", "state")
            .attr("d", path)
            .attr("fill", "#ccc")
            .on("mouseover", function(event, d) {
                d3.select(this).style("fill", "orange");
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                const income = incomeData[currentYear][d.properties.name];
                console.log(`State: ${d.properties.name}, Year: ${currentYear}, Income: ${income}`); // Debugging
                tooltip.html(`${d.properties.name}<br>${income !== undefined ? `$${income}` : "No data"}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).style("fill", d => color(incomeData[currentYear][d.properties.name]));
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        let currentYear = 1998;

        function updateMap(year) {
            currentYear = year;
            color.domain(d3.extent(Object.values(incomeData[year])));

            svg.selectAll(".state")
                .attr("fill", d => {
                    const value = incomeData[year][d.properties.name];
                    return value ? color(value) : "#ccc";
                });

            // Update the year indicator
            d3.select("#year-indicator").text(year);

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);

            // Update legend for the current year
            updateLegend();
        }

        // Initialize map with 1998 data
        updateMap(1998);

        // Update map and progress bar on scroll
        d3.select(window).on("scroll", function() {
            const sections = d3.selectAll(".section");
            const scrollY = window.scrollY;
            const sectionHeight = window.innerHeight;
            const index = Math.min(Math.floor(scrollY / sectionHeight), sections.size() - 1);
            const year = 1998 + index;
            updateMap(year);

            const progress = (scrollY / ((sections.size() - 1) * sectionHeight)) * 100;
            d3.select("#progress-bar").style("width", progress + "%");
        });
    });
});
