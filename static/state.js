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
  document.getElementById("date_specific").style.visibility = "hidden";
  document.getElementById("usa_widespread").style.visibility = "hidden";

  

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
            .attr("width", width + margin.right + margin.left + 700)
            // .attr("width", width)
            .attr("height", height);

  // creating a grey rectangle for beauty
  svg.append("rect")
      .attr("width", width - 200)
      .attr("height", height)
      .attr("fill", "#f2f2f2");

  // giving a heading for understandablity
  svg.append("text")
       .attr("transform", "translate(75,0)")
       .attr("x", width/2 - 200)
       .attr("y", margin.top/2) // x, y coordinate
       .attr("text-anchor", "middle")  
       .attr("font-size", "24px") 
       .attr("text-decoration", "underline") // underline
       .text(title);

  var barplot_width = width - margin.left - 160;
  // var barplot_height = height - 100;
  var barplot_height = height - 17;
  var translate = width - 210;

  var g = svg.append("g")
                .attr("class", "barplot");
  g.append('rect')
    .attr('transform', 'translate(' + translate + ',0)')
    .attr('height', barplot_height)
    .attr('width', barplot_width)
    .attr("fill", "#112222")
      .attr("opacity", .9);
  //plot

  if(title.includes('USA Confirmed Cases')){
    // D3 Projection
    var projection = d3.geoAlbersUsa()
               .translate([(width/2-100), height/2])    // translate to center of screen
               .scale([1000]);          // scale things down so see entire US
            
    // Define path generator
    var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
             .projection(projection);  // tell path generator to use albersUsa projection

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

    var states = [];
    var confirmed = [];
    var deaths = [];

    data = response.usadata.sort(function (a, b) {
            return d3.ascending(a.Confirmed, b.Confirmed);
    })

    data.forEach(function(d, i){
        states.push(d.State);
        confirmed.push(d.Confirmed);
        deaths.push(d.Deaths);
    });
    

    yScale = d3.scaleBand().domain(states).range ([barplot_height, 0]).padding(0.4);
    xScale_con = d3.scaleLinear().domain([d3.min(confirmed) , d3.max(confirmed)]).range ([0, barplot_width]);
    xScale_deaths = d3.scaleLinear().domain([d3.min(deaths) , d3.max(deaths)]).range ([0, barplot_width]);

    var yaxis = g.append("g")
      .attr("transform", "translate(" + barplot_width + ",0)")
      .call(d3.axisLeft(yScale));

    var xaxis = g.append("g")
     .attr("transform", "translate(" + barplot_width + "," + barplot_height + ")")
     .call(d3.axisBottom(xScale_con));

    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    var bars = g.selectAll(".bar")
       .data(response.usadata)
       .enter().append("rect")
         .attr("class", "bar")
         .attr("transform", "translate(" + barplot_width + ",0)")
         .attr("fill", "red")
         // .attr("fill", function(d,i){
         //  return colorScale(i);
         // }) 
         .attr("width", function(d){ return xScale_con(0); })
         .attr("y", function(d){ return yScale(d.State); })
         .attr("height", yScale.bandwidth());

    g.selectAll(".bar")
        .transition()
        .duration(100)
        .attr("width", function(d){ return xScale_con(d.Confirmed); })
        .attr("y", function(d) { return yScale(d.State); })
        .delay(function(d,i){return(i*100)});

     var bars1 = g.selectAll(".bar1")
       .data(response.usadata)
       .enter().append("rect")
         .attr("class", "bar1")
         .attr("transform", "translate(" + barplot_width + ",0)")
         .attr("fill", "white")
         .attr("fill-opacity", "0.5")
         .attr("width", function(d){ return xScale_deaths(0); })
         .attr("y", function(d){ return yScale(d.State); })
         .attr("height", yScale.bandwidth());

      g.selectAll(".bar1")
        .transition()
        .duration(800)
        .attr("width", function(d){ return xScale_deaths(d.Deaths); })
        .attr("y", function(d) { return yScale(d.State); })
        .delay(function(d,i){return(i*100)});

    //purple
     //     .on("mouseover", function(d) {
     //    d3.select(this)
     //      .transition()
     //            .duration(400)
     //      .attr('fill', '#396AB1')
     //      .attr('width', xScale.bandwidth() + 10)
     //      .attr("y", yScale(d.Confirmed) - 10)
     //      .attr('height', barplot_height - yScale(d.Confirmed) + 10);
     //    g.append('text')
     //        .attr('id', 'text')
     //        .attr('x', xScale(d[0]))
     //        .attr('y', yScale(d[1]) - 20)
     //        .attr('fill', 'black')
     //        .attr('font-family', 'times-new-roman')
     //        .attr('font-size', '20px')
     //        .text(function(){return ['(' + d[0] + ', ' + d[1] + ')'];});
     // })
     //     .on("mouseout", function(d) {
     //        d3.select(this)
     //          .transition()
     //            .duration(400)
     //      .attr("fill", "#cf1b5a")
     //      .attr('width', xScale.bandwidth())
     //      .attr("y", function(d) { return yScale(d[1]); })
     //      .attr('height', graphHeight - yScale(d[1]) );
     //    svg.select('#text').remove();
     //     })
     // .attr("x", function(d, i){ return xScale(states[i]); })
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
              .translate([(width/2-100), height/2 - 30])
              .scale(1000);

    var path = d3.geoPath().projection(proj);

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
               .translate([(width/2-100), height/2])    // translate to center of screen
               .scale([1000]);          // scale things down so see entire US
            
    // Define path generator
    var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
             .projection(projection);  // tell path generator to use albersUsa projection

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
              .translate([(width/2-100), height/2 - 30])
              .scale(1000);
        // .translate([0, height/2])
       //   .scale();
    var path = d3.geoPath().projection(proj);

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
}