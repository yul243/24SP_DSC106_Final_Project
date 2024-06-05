// Set up the choropleth map
var map = d3.geomap.choropleth()
    .geofile('https://d3-geomap.github.io/d3-geomap/map/json/usa.json')
    .projection(d3.geoAlbersUsa)
    .column('1998')
    .unitId('fips')
    .scale(1000)
    .legend(true);

// Load data and draw the map
d3.csv('Table.csv').then(data => {
    // Ensure the 'fips' column matches the expected format in the GeoJSON
    data.forEach(d => {
        d.fips = d.fips.padStart(5, '0'); // Ensures fips codes are 5 characters long
    });
    console.log(data); // Debugging line to check if data is loaded correctly
    map.draw(d3.select('#map').datum(data));
});
