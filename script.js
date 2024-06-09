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

    // Create a color scale that transitions from light blue to dark blue
    const color = d3.scaleQuantize()
        .domain([20000, 100000]) // Set domain for personal income per capita
        .range([
            "#e0f3ff", // very light blue
            "#cce6ff",
            "#99ccff",
            "#66b3ff",
            "#3399ff",
            "#007fff",
            "#0066cc",
            "#004c99",
            "#003366"  // dark blue
        ]);

    // Load and display the map
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
            }) // Set initial color
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
                d3.select(this).style("fill", d => {
                    const value = incomeData[currentYear][d.properties.name];
                    return value ? color(value) : "#ccc";
                });
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        let currentYear = 1998;

        // Map of text content for each year
        const textContent = {
            1998: "This is one of the highest points before the 2008 crash. The economy was robust, with strong growth driven by the technology boom.",
            1999: "We start to see a gradual decrease in GDP. The economy was still strong, but there were early signs of a slowdown as the dot-com bubble began to deflate.",
            2000: "This is when America’s economy was at a slowly decreasing point but still considered as well. The dot-com bubble burst, leading to a significant market correction.",
            2001: "America’s economy dropped significantly. The recession was exacerbated by the September 11 terrorist attacks, leading to significant economic disruption.",
            2002: "America starts to get its economy back together from 2001. The economy showed signs of recovery with stimulus measures and low interest rates.",
            2003: "We see a large increase in economic growth and think that it won’t go back down. The recovery was bolstered by tax cuts and increased defense spending.",
            2004: "We now are at a peak. The economy was growing rapidly, driven by housing and consumer spending.",
            2005: "It was believed that the economy was still doing well but no one knew it was going down. Housing prices continued to rise, masking underlying issues.",
            2006: "People still believe that the economy is doing well. However, the housing market started showing signs of a bubble.",
            2007: "The year of deception as the expected GDP growth for the year was revised down from 2.1% to 1.3%. Everyone expected the economy to continue to grow from here. Early signs of the impending housing crisis became evident.",
            2008: "This is when the housing crisis happened causing a huge loss in the overall economy of the nation. The financial system nearly collapsed, leading to a severe recession.",
            2009: "This was when the economy was trying to get back up from the huge drop. The American Recovery and Reinvestment Act was implemented to stimulate the economy.",
            2010: "We see the economy stabilize for a while. The recovery was slow but steady, supported by fiscal and monetary policies.",
            2011: "We see the economy stabilize for a while. Continued slow recovery, with significant government intervention to support growth.",
            2012: "We see the economy stabilize for a while. The economy continued to recover gradually, with improvements in various sectors.",
            2013: "We see the economy stabilize for a while. The recovery remained slow but steady, with ongoing challenges in the labor market.",
            2014: "We see another slight dip in the economy. Some economic indicators showed weakness, but overall growth remained positive.",
            2015: "The economy was starting to get back onto its feet. Growth accelerated slightly, driven by consumer spending and a stronger job market.",
            2016: "We see the economy stabilize for a while. The economy continued its steady growth trajectory, with low unemployment and moderate inflation.",
            2017: "We see the economy stabilize for a while. The economy remained robust, with strong job growth and rising consumer confidence.",
            2018: "We see the economy stabilize for a while. The economy was strong, benefiting from tax cuts and increased government spending.",
            2019: "We see the economy going up. The economy was at a peak with low unemployment and high consumer spending.",
            2020: "During the nation wide lock down from Covid-19 the nation's economy dipped. The pandemic caused a severe economic downturn, with high unemployment and significant GDP contraction.",
            2021: "We see the economy start to boom back up. The economy rebounded strongly with vaccines rollout and stimulus measures.",
            2022: "We see the economy drop slightly. Rising inflation and supply chain disruptions tempered growth.",
            2023: "Job gains continued at a very strong pace in 2023, although down from the torrid rates seen in 2021 and 2022 immediately following the pandemic recession. Monthly nonfarm payrolls grew by 232,000 per month on average in 2023, 55,000 more jobs per month than the average pace in 2018 and 2019."
        };

        function updateMap(year) {
            if (currentYear === year) return; // Exit if the year hasn't changed
            currentYear = year;

            color.domain([20000, 100000]); // Ensure domain is consistent

            svg.selectAll(".state")
                .attr("fill", d => {
                    const value = incomeData[year][d.properties.name];
                    return value ? color(value) : "#ccc";
                });

            // Update the year indicator
            d3.select("#year-indicator").text(year);

            // Update the text container with fade in/out effect
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

        // Initialize map with 1998 data
        function initializeMap() {
            svg.selectAll(".state")
                .attr("fill", d => {
                    const value = incomeData[1998][d.properties.name];
                    return value ? color(value) : "#ccc";
                });

            d3.select("#text-content")
                .html(textContent[1998] || "No text available for this year.")
                .style("opacity", 1); // Ensure text is visible on load

            d3.select("#year-indicator").text(1998);
        }

        initializeMap(); // Ensure the map is correctly initialized

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
