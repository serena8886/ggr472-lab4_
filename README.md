# GGR472 Lab 4: Toronto Pedestrian & Cyclist Collision Hexgrid Map

## Overview
This web map visualizes road collisions involving pedestrians and cyclists 
in Toronto between 2006 and 2021. Collision point data is aggregated into 
a hexgrid using Turf.js, with a colour gradient representing the number 
of collisions in each hexagon.

## Data Source
City of Toronto Open Data:
(https://open.toronto.ca/dataset/motor-vehicle-collisions-involving-killed-or-seriously-injured-persons/)
- Time period: 2006 – 2021
- Features: 3,705 collision points involving pedestrians or cyclists

## Features
- Hexgrid map with colour gradient (low to high collision counts)
- Hover pop-up showing collision count for each hexagon
- Filter bar to show only hexagons above a minimum collision count
- Layer toggle to show or hide the hexgrid
- Legend indicating low to high collision density

## How It Works
1. Collision point data is fetched from the GitHub repository
2. A bounding box is created around the points using `turf.envelope()`
3. A hexgrid is generated within the bounding box using `turf.hexGrid()`
4. Points are aggregated into hexagons using `turf.collect()`
5. Each hexagon is coloured based on its collision count using a 
   Mapbox expression

## How to Use
- Hover over a hexagon to see the number of collisions
- Use the filter slider to show only high-collision areas
- Toggle the hexgrid layer on/off using the checkbox
