// Set up dimensions
const width = 960;
const height = 600;

// Create an SVG to hold the map
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Create a projection and path generator
const projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Create a color scale
const color = d3.scaleQuantize()
    .range(d3.schemeBlues[9]);

// Load the data and GeoJSON
Promise.all([
    d3.json("https://d3js.org/us-10m.v1.json"),
    d3.csv("Table.csv")
]).then(([us, data]) => {
    // Process the CSV data
    const dataMap = {};
    data.forEach(d => {
        dataMap[d.fips] = +d["2023"]; // Using 2023 data
    });

    // Set the domain of the color scale
    color.domain(d3.extent(data, d => d["2023"]));

    // Draw the states
    svg.append("g")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .join("path")
        .attr("fill", d => {
            const fips = d.id;
            const value = dataMap[fips];
            if (value) {
                return color(value);
            } else {
                console.log(`No data for FIPS: ${fips}`);
                return '#ccc'; // Use grey color if no data
            }
        })
        .attr("d", path)
        .append("title")
        .text(d => {
            const fips = d.id;
            const income = dataMap[fips] ? dataMap[fips] : 'No data';
            return `State: ${d.properties.name}\nIncome: ${income}`;
        });
}).catch(error => {
    console.error('Error loading the data:', error);
});
