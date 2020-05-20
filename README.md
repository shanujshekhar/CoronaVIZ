# CoronaVIZ

Link to Youtube Video: https://www.youtube.com/watch?v=3fKE13DtB70&feature=youtu.be

## Introduction
COVID-19 has changed life as we know it. This deadly virus is an active crisis that is affecting people all over the globe leaving a large number of people unemployed. We are focusing on USA and India and aim to create a useful visualization about the spread and effects of COVID-19 in these countries.

## Overview
I have created a dashboard for visualizing COVID-19 cases in the USA, how the disease spread and how it affected the country’s unemployment rates. We created two modes for our dashboard - one for the unemployment data and one for the COVID-19 case data to show the spread in different states and counties. Our backend uses flask while our frontend work is done using d3. We used choropleths and bubble plots on topojson maps to show the spread of the virus and its deadly trail. Since the data we obtained was timestamped we were able to animate the data to show a live visualization of how the spread occurred over the country and how unemployment rate increased as a
result. The figures show how our dashboard looks.

## Tools and Languages Used
- Flask for backend data loading
- d3.js v4 for rendering visualizations. (https://d3js.org/)
- Python v3

## Features

- ***County Level and State Level:***\
I can zoom into a county-level view from a state level view and see how the state as a whole stands. We have supporting visualizations in the form of a pie chart and a bar chart on the right side.\
Screenshot - ![ State Level Visualization](/Screenshots/State_Level.JPG?raw=true "State Level Visualization")
- ***Top 5 Affected States in US (Bar plot & Pie Plot):***\
The bar chart shows where the state stands with the top 5 most affected states while the pie chart shows how much the selected state accounts for the country’s infected count/ deaths.\
Screenshot - ![ State Level Visualization](/Screenshots/County_Level.JPG?raw=true "County Level Visualization")
- ***Spread of COVID-19 (Bubble Plot):***\
I have also also used bubble plot to visualize the rate of change in the number of infections in the states and counties. We can understand how highly infected a place is based on the size of the bubble and on hovering over it we can get the exact data of the place. This lets us analyze “centers” of infections and how the virus spread. If we could get flight data to match the time line it could be even more insightful.\
Screenshot - ![ State Level Visualization](/Screenshots/Spread_County_Level.JPG?raw=true "Bubble Plot Visualization")
- ***Animated Time Series Viz:***\
I have created an animated visualization which lets us see how the spread changes with time. We also have the functionality of pausing when we like and then resuming again from that point. This lets the user explore the data at that point in time.
- ***Unemployment Rate Spike due to COVID-19:***\
Unemployment Rates have increased drastically due to COVID-19 disease. This visualization shows this trend using time series animation.\
Screenshot - ![ State Level Visualization](/Screenshots/Unemployment_Rates.JPG?raw=true "Unemployment Rate Visualization")

## Insights:
- While visualizing the COVID-19 cases in the USA and India using chloropleths, it was interesting to see how the count per million value conveyed more information than the absolute counts. This is a better measure of how a state was affected by COVID-19 because it takes into account the population of the state. For example a state having 150 cases can seem to be better off than one recording 1000 cases.
- However if the population of the latter state is 500,000 and the population of the former is 300, visualizing the actual counts can lead to a bias.The bubble plot allows us to visualize centers of infections effectively.
