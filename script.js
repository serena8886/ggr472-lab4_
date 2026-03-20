/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
mapboxgl.accessToken = 'pk.eyJ1Ijoic2VyZW5heGllIiwiYSI6ImNta2RnM29ocjBiYmQzZnB3ZjYxNnc0Y2YifQ.OKLpStuEaqsA1l9cHya4Hw'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/mapbox/dark-v11',  // ****ADD MAP STYLE HERE *****
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 11 // starting zoom level
});


/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
//HINT: Create an empty variable
let collisionData;
map.on('load', () => {
//      Use the fetch method to access the GeoJSON from your online repository
    fetch('https://raw.githubusercontent.com/serena8886/ggr472-lab4_/main/data/pedcyc_collision_06-21.geojson')
//      Convert the response to JSON format and then store the response in your new variable
        .then(response => response.json())
        .then(data => {
            collisionData = data;
            console.log(collisionData);

/*--------------------------------------------------------------------
    Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
//HINT: All code to create and view the hexgrid will go inside a map load event handler
//      First create a bounding box around the collision point data
            let envresult = turf.envelope(collisionData);
            let envScaled = turf.transformScale(envresult, 1.1);// ---Scale bounding box up by 10% to avoid missing edge points

            //      Access and store the bounding box coordinates as an array variable
            let bboxCoords = turf.bbox(envScaled); //--- Format: [minX, minY, maxX, maxY]

            //      Use bounding box coordinates as argument in the turf hexgrid function
            let hexgrid = turf.hexGrid(bboxCoords, 0.5, { units: 'kilometers' }); // ---Generate hexagon grid with 0.5km cell size within bounding box

           /// ---Add hexagon grid as data source

            map.addSource('hexgrid', {
                type: 'geojson',
                data: hexgrid
            });
//      **Option: You may want to consider how to increase the size of your bbox to enable greater geog coverage of your hexgrid
//                Consider return types from different turf functions and required argument types carefully here


/*--------------------------------------------------------------------
Step 4: AGGREGATE COLLISIONS BY HEXGRID
--------------------------------------------------------------------*/
//HINT: Use Turf collect function to collect all '_id' properties from the collision points data for each heaxagon
    // ---Aggregate collision points into hexagons using _id field, store in values property
                let collishex = turf.collect(hexgrid, collisionData, '_id', 'values');
                //      View the collect output in the console. Where there are no intersecting points in polygons, arrays will be empty
                console.log(collishex);
                //---Initialize maximum collision count to 0
                let maxcollis = 0;
                // ---Iterate through each hexagon
                collishex.features.forEach((feature) => {
                    // ---Calculate collision count from values array length, store in COUNT property
                    feature.properties.COUNT = feature.properties.values.length;

                    // ---Update maximum if current count exceeds recorded maximum
                    if (feature.properties.COUNT > maxcollis) {
                        maxcollis = feature.properties.COUNT;
                    }
                });

                //---Print maximum collision count for verification
                console.log('Max collisions:', maxcollis);


// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
//      Add a legend and additional functionality including pop-up windows


// Replace data source with updated data containing COUNT property
            map.addSource('hexgrid-final', {
                type: 'geojson',
                data: collishex
            });

            map.addLayer({
                id: 'hexgrid-fill',
                type: 'fill',
                source: 'hexgrid-final',
                // ---Only show hexagons with collision records
                filter: ['>', ['get', 'COUNT'], 0],

                paint: {
                    'fill-color': [
                        //---Interpolate between values
                        'interpolate',    
                        // ---Linear interpolation
                        ['linear'],       
                        //--- Base color on COUNT value
                        ['get', 'COUNT'],  

                        // ---Value-to-color (low to high)
                        0,                          '#ffffcc',
                        Math.round(maxcollis*0.25), '#fd8d3c',
                        Math.round(maxcollis*0.5),  '#f03b20',
                        maxcollis,                  '#bd0026'
                    ],
                    'fill-opacity': 0.7
                 }
            });
                    // ---Listen for click events to show popup
                        map.on('click', 'hexgrid-fill', (e) => {
                            let count = e.features[0].properties.COUNT;
                            new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(`<strong>Collisions: ${count}</strong>`)
                                .addTo(map);
                        });

                        // ---Change cursor to pointer on hover
                        map.on('mouseenter', 'hexgrid-fill', () => {
                            map.getCanvas().style.cursor = 'pointer';
                        });

                        // ---Restore default cursor on mouse leave
                        map.on('mouseleave', 'hexgrid-fill', () => {
                            map.getCanvas().style.cursor = '';
                        });

        });
 });