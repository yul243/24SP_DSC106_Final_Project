// Function to initialize the map
function initializeMap(incomeData, color) {
    d3.json("https://unpkg.com/us-atlas/states-10m.json").then(function(us) {
        const states = topojson.feature(us, us.objects.states).features;

        svg.append("g")
            .selectAll("path")
            .data(states)
            .enter().append("path")
            .attr("class", "state")
            .attr("d", path)
            .attr("fill", d => {
                const value = incomeData[1998][d.properties.name];
                return value ? color(value) : "#ccc";
            })
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                const income = incomeData[currentYear][d.properties.name];
                tooltip.html(`${d.properties.name}<br>${income !== undefined ? `$${income}` : "No data"}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(event, d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Initialize the map with the 1998 data
        updateMap(incomeData, color, 1998);

        // Attach scroll event
        d3.select(window).on("scroll", function() {
            const sections = d3.selectAll(".section");
            const scrollY = window.scrollY;
            const sectionHeight = window.innerHeight;
            const index = Math.min(Math.floor(scrollY / sectionHeight), sections.size() - 1);
            const year = 1998 + index;

            updateMap(incomeData, color, year);

            const progress = (scrollY / ((sections.size() - 1) * sectionHeight)) * 100;
            d3.select("#progress-bar").style("width", progress + "%");
        });
    });
}

// Function to update the map based on the current year
function updateMap(incomeData, color, year) {
    if (currentYear === year) return;
    currentYear = year;

    svg.selectAll(".state")
        .each(function(d) {
            const value = incomeData[year][d.properties.name];
            const fillColor = value ? color(value) : "#ccc";
            d3.select(this).attr("fill", fillColor);
        });

    d3.select("#year-indicator").text(year);
    d3.select("#text-content")
        .transition()
        .duration(500)
        .style("opacity", 0)
        .on("end", function() {
            d3.select(this).html(textContent[year] || "No text available for this year.")
                .transition()
                .duration(500)
                .style("opacity", 1);
        });

    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}
