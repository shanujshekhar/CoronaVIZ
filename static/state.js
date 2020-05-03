// keep a dictionary of titles, just need to do this in one of the files
var titles = {'USA': 'USA Confirmed Cases', 'India' : 'India Confirmed Cases', 'USA_Pop': 'USA Population', 'India_Pop' : 'India Population'};

function generateStatePlot(id) {
  console.log(titles[id]);
  $.ajax({
    type: 'GET',
    url: id,
    contentType: 'application/json; charset=utf-8',
    xhrFields: {
      withCredentials: false
    },
    headers: {},
    success: function(result) {
      // console.log(result)
      drawStatePlot(result, titles[id])
    },
    error: function(result) {
    $("#error").html(result);
    }
  });
}

function drawStatePlot(response, title) {
  document.getElementById("county_specific").style.visibility = "hidden";
  document.getElementById("state_specific_deaths").style.visibility = "hidden";
  console.log(response);
  const margin = {top: 100, right: 50, bottom: 100, left: 50};
  var width = 960;
  var height = 600;

  // Define the div for the tooltip
  var div = d3.select(".tooltip").style("opacity", 0);

  d3.select("#graph_plot").select("svg").remove();// remove svg object if it exists
  // add a new svg object inside the graph_plot division
  var svg = d3.select("#graph_plot")
            .append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom);
  // creating a grey rectangle for beauty
  svg.append("rect")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .attr("y", margin.right + 20)
      .attr("fill", "#f2f2f2");
  // giving a heading for understandablity
  svg.append("text")
       .attr("transform", "translate(75,0)")
       .attr("x", width/2 - 50)
       .attr("y", margin.top/2) // x, y coordinate
       .attr("text-anchor", "middle")  
       .attr("font-size", "24px") 
       .attr("text-decoration", "underline") // underline
       .text(title);

  //plot

  if(title.includes('USA Confirmed Cases')){
    // D3 Projection
    var projection = d3.geoAlbersUsa()
               .translate([width/2, height/2])    // translate to center of screen
               .scale([1000]);          // scale things down so see entire US
            
    // Define path generator
    var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
             .projection(projection);  // tell path generator to use albersUsa projection

    //Create SVG element and append map to the SVG
    var svg = d3.select("svg")
          .attr("width", width)
          .attr("height", height);
            
    svg.selectAll("path")
        .data(response.usafeatures)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "state")
        .style("stroke", "black")
        .style("stroke-width", "1.2")
        .style("opacity", function(d){
          var value = response.usadata[response.dict[d.properties.name]]['Confirmed'];
          if(value>=2000000)
            return "1";
          else if(value>=1500000 & value<2000000)
            return "0.85";
          else if(value>=500000 & value<1500000)
            return "0.65";
          else if(value>=100000 & value<500000)
            return "1";
          else if(value>=50000 & value<100000)
            return "0.55";
          else if(value>=20000 & value<50000)
            return "0.55";
          else if(value>=1000 & value<20000)
            return "0.35";
          else if(value>=1 & value<1000)
            return "0.25";
        })
        .attr("fill", function(d){
          var value = response.usadata[response.dict[d.properties.name]]['Confirmed'];
          if(value>=2000000)
            return "rgb(123, 36, 28)";
          else if(value>=1500000 & value<2000000)
            return "rgb(231, 76, 60)";
          else if(value>=500000 & value<1500000)
            return "rgb(231, 76, 60)";
          else if(value>=100000 & value<500000)
            return "rgb(255, 87, 34)";
          else if(value>=50000 & value<100000)
            return "rgb(231, 76, 60)";
          else if(value>=20000 & value<50000)
            return "rgb(255, 87, 34)";
          else if(value>=1000 & value<20000)
            return "rgb(231, 76, 60)";
          else if(value>=1 & value<1000)
            return "rgb(231, 76, 60)";
          })
        .on("mouseover", function(d) {
          // d3.select(this).attr("fill", "orange");
            div.transition()    
                .duration(200)    
                .style("opacity", .7);    
            div.html(d.properties.name + "<br/>" + "<br/>" +"Confirmed: " + response.usadata[response.dict[d.properties.name]]['Confirmed'] + "<br/>" + "Deaths: " + response.usadata[response.dict[d.properties.name]]['Deaths'])  
                .style("left", (d3.event.pageX + 15) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
        })
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });
  }
  else if(title.includes('India Confirmed Cases')){
    StatesData = {};

      response.indiafeatures.forEach(function(f){
        StatesData[f.id] = {'Active' : 0, 'Recovered' : 0, 'Deaths' : 0, 'Confirmed' : 0};
      });

      var case_type = ['Active', 'Recovered', 'Deaths', 'Confirmed']

      response.indiadata.forEach(function(d){
        var state = d.State;

        case_type.forEach(function(type){

          if(state in StatesData){
            StatesData[state][type] += d[type];
          }
        });
      });

    var proj = d3.geoMercator()
        .center([80,25])
              .translate([width/2, height/2])
              .scale(800);
        // .translate([0, height/2])
       //   .scale();
    var path = d3.geoPath().projection(proj);

    //Create SVG element and append map to the SVG
    var svg = d3.select("svg")
          .attr("width", width)
          .attr("height", height);

    // Load GeoJSON data and merge with states data
    // d3.json("india.json", function(json) {
      svg.selectAll("path")
        .data(response.indiafeatures)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "state")
        .style("stroke", "black")
        .style("stroke-width", "1")
        .style("opacity", function(d){
          var value = StatesData[d.id]['Confirmed'];
          if(value>=5000)
            return "1";
          else if(value>=1500 & value<5000)
            return "0.85";
          else if(value>=1000 & value<1500)
            return "0.65";
          else if(value>=500 & value<1000)
            return "1";
          else if(value>=200 & value<500)
            return "0.55";
          else if(value>=100 & value<200)
            return "0.55";
          else if(value>=50 & value<100)
            return "0.35";
          else if(value>=20 & value<50)
            return "0.25";
          else if(value>=0 & value<20)
            return "0.25";
        })
        .attr("fill", function (d, i)  {
          var value = StatesData[d.id]['Confirmed'];
          if(value>=5000)
            return "rgb(123, 36, 28)";
          else if(value>=1500 & value<5000)
            return "rgb(231, 76, 60)";
          else if(value>=1000 & value<1500)
            return "rgb(231, 76, 60)";
          else if(value>=500 & value<1000)
            return "rgb(255, 87, 34)";
          else if(value>=200 & value<500)
            return "rgb(255, 87, 34)";
          else if(value>=100 & value<200)
            return "rgb(231, 76, 60)";
          else if(value>=50 & value<100)
            return "rgb(231, 76, 60)";
          else if(value>=20 & value<50)
            return "rgb(255, 87, 34)";
          else if(value>=0 & value<20)
            return "rgb(231, 76, 60)";
        })
        .on("mouseover", function(d) {    
            div.transition()    
                .duration(200)    
                .style("opacity", .7);    
            div.html(d.id + "<br/>" + "<br/>" +"Confirmed: " + StatesData[d.id]['Confirmed'] + "<br/>" + "Deaths: " + StatesData[d.id]['Confirmed'])  
                .style("left", (d3.event.pageX + 15) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
        })
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });
  }
  else if(title.includes('USA Population')){
    // D3 Projection
    var projection = d3.geoAlbersUsa()
               .translate([width/2, height/2])    // translate to center of screen
               .scale([1000]);          // scale things down so see entire US
            
    // Define path generator
    var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
             .projection(projection);  // tell path generator to use albersUsa projection

    //Create SVG element and append map to the SVG
    var svg = d3.select("svg")
          .attr("width", width)
          .attr("height", height);

    svg.selectAll("path")
        .data(response.usafeatures)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "state")
        .style("stroke", "black")
        .style("stroke-width", "1.2")
        .style("opacity", function(d){
          var value = response.data[response.dict[d.properties.name]]['Population'];
          if(value>=100000)
            return "1";
          else if(value>=40000 & value<100000)
            return "0.9";
          else if(value>=20000 & value<40000)
            return "0.9";
          else if(value>=15000 & value<20000)
            return "0.7";
          else if(value>=10000 & value<15000)
            return "0.6";
          else if(value>=7000 & value<10000)
            return "0.5";
          else if(value>=5000 & value<7000)
            return "0.4";
          else if(value>=1 & value<5000)
            return "0.3";
        })
        .attr("fill", "rgb(17, 30, 108)" )
        .on("mouseover", function(d) {    
            div.transition()    
                .duration(200)    
                .style("opacity", .7);    
            div.html(d.properties.name + "<br/>" + "<br/>" +"Confirmed Cases/M: " + ~~response.data[response.dict[d.properties.name]]['Population'] + "<br/>" + "Population: " + ~~(response.data[response.dict[d.properties.name]]['Confirmed'] * 1000000 / response.data[response.dict[d.properties.name]]['Population']))  
                .style("left", (d3.event.pageX + 15) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
        })
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });
  }
  else if(title.includes('India Population')){
    var proj = d3.geoMercator()
        .center([80,25])
              .translate([width/2, height/2])
              .scale(800);
        // .translate([0, height/2])
       //   .scale();
    var path = d3.geoPath().projection(proj);

    //Create SVG element and append map to the SVG
    var svg = d3.select("svg")
          .attr("width", width)
          .attr("height", height);

    // Load GeoJSON data and merge with states data
      svg.selectAll("path")
        .data(response.indiafeatures)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "state")
        .style("stroke", "black")
        .style("stroke-width", "1")
        .style("opacity", function(d){
          var value = response.data[response.dict[d.id]]['Population'];
          if(value>=150)
            return "1";
          else if(value>=70 & value<150)
            return "0.9";
          else if(value>=40 & value<70)
            return "0.8";
          else if(value>=20 & value<40)
            return "0.7";
          else if(value>=10 & value<20)
            return "0.6";
          else if(value>=5 & value<10)
            return "0.5";
          else if(value>=2 & value<5)
            return "0.4";
          else if(value>=1 & value<2)
            return "0.3";
          else if(value>=0 & value<1)
            return "0.2";
        })
        .attr("fill", "rgb(17, 30, 108)")
        .on("mouseover", function(d) {    
            div.transition()    
                .duration(200)    
                .style("opacity", .7);    
            div.html(d.id + "<br/>" + "<br/>" +"Confirmed Cases/M: " + ~~response.data[response.dict[d.id]]['Population'] + "<br/>" + "Population: " + ~~(response.data[response.dict[d.id]]['Confirmed'] * 1000000 / response.data[response.dict[d.id]]['Population']))
                .style("left", (d3.event.pageX + 15) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
        })
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });
  }

  // centre the created bar_chart
  // d3.select("#graph_plot").attr("align","center");
}