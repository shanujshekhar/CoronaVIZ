// keep a dictionary of titles, just need to do this in one of the files
var titles = {'USA': 'USA Cases', 'India' : 'India Confirmed Cases', 'USA_Pop': 'USA Population', 'India_Pop' : 'India Population'};

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
      drawStatePlot(result, titles[id])
    },
    error: function(result) {
    $("#error").html(result);
    }
  });
}

function drawStatePlot(response, title) {

  console.log(response);
  const margin = {top: 100, right: 50, bottom: 100, left: 50};
  var width = 960;
  var height = 600;

  // Define the div for the tooltip
  var div = d3.select(".tooltip").style("opacity", 0);

  d3.select("#graph_plot").selectAll("svg").remove();// remove svg object if it exists
  // add a new svg object inside the graph_plot division
  var svg = d3.select("#graph_plot")
            .append("svg")
            .attr("width", width + margin.right + margin.left + 700)
            // .attr("width", width)
            .attr("height", height);

  // creating a grey rectangle for beauty
  svg.append("rect")
      .attr("width", width - 80)
      .attr("height", height)
      .attr("fill", "#112222");

  // giving a heading for understandablity
  svg.append("text")
       .attr("id", "title")
       .attr("transform", "translate(75,0)")
       .attr("x", width/2 - 200)
       .attr("y", margin.top/2) // x, y coordinate
       .attr("text-anchor", "middle")  
       .attr("font-size", "24px")
       .attr("fill", "white") 
       .attr("text-decoration", "underline") // underline
       .text(title);

  var barplot_width = width - margin.left - 400;
  var barplot_height = height - 30;
  var translate = width - margin.left + 65;

  var g = svg.append("g").attr("id", "barplot");

  g.append('rect')
    .attr("class", "barRect")
    .attr('transform', 'translate(' + translate + ',0)')
    .attr('height', barplot_height)
    .attr('width', barplot_width)
    .attr("fill", "#112222")
    .attr("opacity", .9);
  //plot

  if(title.includes('USA Cases')){
    // D3 Projection
    var projection = d3.geoAlbersUsa()
               .translate([(width/2-100), height/2])    // translate to center of screen
               .scale([1000]);          // scale things down so see entire US
            
    // Define path generator
    var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
             .projection(projection);  // tell path generator to use albersUsa projection

    var circle_color = {"cases" : "#CC7722", "deaths" : "#FF2400"};
    type = "Confirmed";
    
    var states = [];
    var confirmed = [];
    var deaths = [];


    response.usadata.forEach(function(d, i){
        states.push(d.state);
        confirmed.push(d.cases);
        deaths.push(d.deaths);
    });

    function draw(type){

      d3.selectAll("path").remove();
      d3.select("#confirmed_button").remove();
      d3.select("#deaths_button").remove();
      d3.select("#barplot").selectAll("*").remove();
      d3.selectAll(".legend").remove();

      g.append('rect')
        .attr("class", "barRect")
        .attr('transform', 'translate(' + translate + ',0)')
        .attr('height', barplot_height)
        .attr('width', barplot_width)
        .attr("fill", "#112222")
        .attr("opacity", .9);

      if(type=="Confirmed"){
        // Opacities for coloring of States in US
        var opacities = {1 : { 'Range' : '> 120k', 'States' : []}, 
                        0.85 : {'Range' : '50k - 120k', 'States' : []}, 
                        0.65 : {'Range' : '30k - 50k', 'States' : []}, 
                        0.55 : {'Range' : '10k - 30k', 'States' : []}, 
                        0.45 : {'Range' : '5k - 10k', 'States' : []}, 
                        0.35 : {'Range': '3k - 5k', 'States' : []},
                        0.25 : {'Range' : '< 3k', 'States' : []}};

        d3.select("#title").text("USA Confirmed Cases");
        svg.selectAll("path")
          .data(response.usafeatures)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", "state")
          .attr("id", function(d) { return 'i' + response.dict[d.properties.name];})
          .style("stroke", "black")
          .style("stroke-width", "1.2")
          .style("opacity", function(d){
            var value = response.usadata[response.dict[d.properties.name]]["cases"];
            if(value>=120000){
              opacities[1]['States'].push('i' + response.dict[d.properties.name]);
              return "1";
            }
            else if(value>=50000 & value<120000){
              opacities[0.85]['States'].push('i' + response.dict[d.properties.name]);
              return "0.85";
            }
            else if(value>=30000 & value<50000){
              opacities[0.65]['States'].push('i' + response.dict[d.properties.name]);
              return "0.65";
            }
            else if(value>=10000 & value<30000){
              opacities[0.55]['States'].push('i' + response.dict[d.properties.name]);
              return "0.55";
            }
            else if(value>=5000 & value<10000){
              opacities[0.45]['States'].push('i' + response.dict[d.properties.name]);
              return "0.45";
            }
            else if(value>=3000 & value<5000){
              opacities[0.35]['States'].push('i' + response.dict[d.properties.name]);
              return "0.35";
            }
            else if(value>=1 & value<3000){
              opacities[0.25]['States'].push('i' + response.dict[d.properties.name]);
              return "0.25";
            }
          })
          .attr("fill", function(d){
            var value = response.usadata[response.dict[d.properties.name]]["cases"];
            return circle_color["cases"];
            // if(value>=2000000)
              // return "rgb(123, 36, 28)";
            // else if(value>=1500000 & value<2000000)
              // return "rgb(231, 76, 60)";
            // else if(value>=500000 & value<1500000)
              // return "rgb(231, 76, 60)";
            // else if(value>=100000 & value<500000)
            //   return "rgb(255, 87, 34)";
            // else if(value>=50000 & value<100000)
            //   return "rgb(231, 76, 60)";
            // else if(value>=20000 & value<50000)
            //   return "rgb(255, 87, 34)";
            // else if(value>=1000 & value<20000)
            //   return "rgb(231, 76, 60)";
            // else if(value>=1 & value<1000)
            //   return "rgb(231, 76, 60)";
            })
          .on("mouseover", function(d) {
              div.transition()    
                  .duration(200)    
                  .style("opacity", .7);    
              div.html(d.properties.name + "<br/>" + "<br/>" +"Confirmed: " + response.usadata[response.dict[d.properties.name]]['cases'])  
                  .style("left", (d3.event.pageX + 15) + "px")   
                  .style("top", (d3.event.pageY - 28) + "px"); 
              d3.select("#i" + response.dict[d.properties.name])
                  .transition()
                  .duration(400)
                  .attr('fill', circle_color['deaths'])
                  .attr('fill-opacity', '1')
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale_con(response.usadata[response.dict[d.properties.name]]['cases']) + 10)
                  .attr('height', yScale.bandwidth() + 10);
          })
          .on("mouseout", function(d) {   
              div.transition()    
                  .duration(500)    
                  .style("opacity", 0); 
              d3.select("#i" + response.dict[d.properties.name])
                  .transition()
                  .duration(400)
                  .attr('fill', circle_color["cases"])
                  .attr('fill-opacity', '1')
                  .attr('stroke', "none")
                  .attr("stroke-width", "none")
                  .attr('height', yScale.bandwidth())
                  .attr("width", xScale_con(response.usadata[response.dict[d.properties.name]]['cases']));
          });
        
        // Legend
        var legend = svg.append('g')
            .attr('id', 'legend');
        var keys = Object.keys(opacities);
        // Adding rects for legend, and mouseover & mouseout events
        legend.selectAll(".legend")
          .data(d3.range(0, 7, 1)).enter()
            .append('rect')
            .attr("class", "legend")
            .attr('x', width-100)
            .attr('y', function(d, i) { return height/2 + (i*20);})
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', circle_color['cases'])
            .attr('fill-opacity', function(d, i){ return keys[i]; })
            .on("mouseover", function(d, i){

              d3.select(this).transition().duration(100).attr('width', 20).attr('height', 20);

              opacities[keys[i]]['States'].forEach(function(s){
                d3.selectAll("#" + s).attr("fill", "blue");
              });
            })
            .on("mouseout", function(d, i){
              d3.select(this).transition().duration(100).attr('width', 10).attr('height', 10);
              opacities[keys[i]]['States'].forEach(function(s){
                d3.selectAll("#" + s).attr("fill", circle_color['cases']);
              });
            })
          for (i=0 ; i<7 ; i++)
          {
            legend.append('text')
              .attr("class", "legend")
              .attr('x', width - 150)
              .attr('y', height/2 + (i*20) + 10)
              .attr('fill', 'white')
              .style('font-size', '10px')
              .text(opacities[keys[i]]['Range']);
          }


        yScale = d3.scaleBand().domain(states).range ([barplot_height, 0]).padding(0.4);
        xScale_con = d3.scaleLinear().domain([d3.min(confirmed) , d3.max(confirmed)]).range ([0, barplot_width - 20]);

        var yaxis = g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + translate + ",0)")
          .call(d3.axisLeft(yScale));

        var xaxis = g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + translate + "," + barplot_height + ")")
          .call(d3.axisBottom(xScale_con).ticks(10).tickFormat(d3.format(".2s")));

        var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        var bars = g.selectAll(".bar")
           .data(response.usadata)
           .enter().append("rect")
             .attr("class", "bar")
             .attr("id", function(d) { return 'i' + response.dict[d.state];})
             .attr("transform", "translate(" + translate + ",0)")
             .attr("fill", circle_color["cases"])
             .attr("width", function(d){ return xScale_con(d3.min(confirmed)); })
             .attr("y", function(d){ return yScale(d.state); })
             .attr("height", yScale.bandwidth());

        g.selectAll(".bar")
            .transition()
            .duration(800)
            .attr("width", function(d){ return xScale_con(d.cases); })
            .attr("y", function(d) { return yScale(d.state); })
            .delay(function(d,i){return(i*20)});

      }
      else{
        d3.select("#title").text("USA Death Cases");

        // Opacities for coloring of States in US
        var opacities = {1 : { 'Range' : '> 10k', 'States' : []}, 
                        0.85 : {'Range' : '4k - 10k', 'States' : []}, 
                        0.75 : {'Range' : '3k - 4k', 'States' : []}, 
                        0.65 : {'Range' : '2k - 3k', 'States' : []}, 
                        0.55 : {'Range' : '1k - 2k', 'States' : []}, 
                        0.45 : {'Range': '500 - 1k', 'States' : []},
                        0.35 : {'Range' : '200 - 500', 'States' : []}, 
                        0.25 : {'Range' : '100 - 200', 'States' : []},
                        0.15 : {'Range' : '< 100', 'States' : []}};

        svg.selectAll("path")
          .data(response.usafeatures)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", "state")
          .attr("id", function(d) { return 'i' + response.dict[d.properties.name];})
          .style("stroke", "black")
          .style("stroke-width", "1.2")
          .style("opacity", function(d){
            var value = response.usadata[response.dict[d.properties.name]]["deaths"];
            if(value>=10000){
              opacities[1]['States'].push('i' + response.dict[d.properties.name]);
              return "1";
            }
            else if(value>=4000 & value<10000){
              opacities[0.85]['States'].push('i' + response.dict[d.properties.name]);
              return "0.85";
            }
            else if(value>=3000 & value<4000){
              opacities[0.75]['States'].push('i' + response.dict[d.properties.name]);
              return "0.75";
            }
            else if(value>=2000 & value<3000){
              opacities[0.65]['States'].push('i' + response.dict[d.properties.name]);
              return "0.65";
            }
            else if(value>=1000 & value<2000){
              opacities[0.55]['States'].push('i' + response.dict[d.properties.name]);
              return "0.55";
            }
            else if(value>=500 & value<1000){
              opacities[0.45]['States'].push('i' + response.dict[d.properties.name]);
              return "0.45";
            }
            else if(value>=200 & value<500){
              opacities[0.35]['States'].push('i' + response.dict[d.properties.name]);
              return "0.35";
            }
            else if(value>=100 & value<200){
              opacities[0.25]['States'].push('i' + response.dict[d.properties.name]);
              return "0.25";
            }
            else if(value>=1 & value<100){
              opacities[0.15]['States'].push('i' + response.dict[d.properties.name]);
              return "0.15";
            }
          })
          .attr("fill", function(d){
            var value = response.usadata[response.dict[d.properties.name]]["deaths"];
            return circle_color["deaths"];
            // if(value>=80000)
            //   return "rgb(123, 36, 28)";
            // else if(value>=12000 & value<80000)
            //   return "rgb(231, 76, 60)";
            // else if(value>=5000 & value<12000)
            //   return "rgb(231, 76, 60)";
            // else if(value>=2000 & value<5000)
            //   return "rgb(255, 87, 34)";
            // else if(value>=1000 & value<2000)
            //   return "rgb(231, 76, 60)";
            // else if(value>=500 & value<1000)
            //   return "rgb(231, 76, 60)";
            // else if(value>=200 & value<500)
            //   return "rgb(255, 87, 34)";
            // else if(value>=100 & value<200)
            //   return "rgb(231, 76, 60)";
            // else if(value>=1 & value<100)
            //   return "rgb(231, 76, 60)";
            })
          .on("mouseover", function(d) {
              div.transition()    
                  .duration(200)    
                  .style("opacity", .7);    
              div.html(d.properties.name + "<br/>" + "<br/>" + "Deaths: " + response.usadata[response.dict[d.properties.name]]['deaths'])  
                  .style("left", (d3.event.pageX + 15) + "px")   
                  .style("top", (d3.event.pageY - 28) + "px");

              d3.select("#i" + response.dict[d.properties.name])
                  .transition()
                  .duration(400)
                  .attr('fill', "yellow")
                  .attr('fill-opacity', '0.8')
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale_deaths(response.usadata[response.dict[d.properties.name]]['deaths']) + 10)
                  .attr('height', yScale.bandwidth() + 10);
                  
              //     .attr('height', barplot_height - yScale(d.Confirmed) + 10);
              // g.append('text')
              //     .attr('id', 'text')
              //     .attr('x', xScale(d[0]))
              //     .attr('y', yScale(d[1]) - 20)
              //     .attr('fill', 'black')
              //     .attr('font-family', 'times-new-roman')
              //     .attr('font-size', '20px')
              //     .text(function(){return ['(' + d[0] + ', ' + d[1] + ')'];});  
          })
          .on("mouseout", function(d) {   
              div.transition()    
                  .duration(500)    
                  .style("opacity", 0);
              d3.select("#i" + response.dict[d.properties.name])
                  .transition()
                  .duration(400)
                  .attr('fill', circle_color["deaths"])
                  .attr('fill-opacity', '0.8')
                  .attr('stroke', "none")
                  .attr("stroke-width", "none")
                  .attr('height', yScale.bandwidth())
                  .attr("width", xScale_deaths(response.usadata[response.dict[d.properties.name]]['deaths']));
          });

        var legend = svg.append('g')
            .attr('id', 'legend');
        var keys = Object.keys(opacities);
        // Adding rects for legend, and mouseover & mouseout events
        legend.selectAll(".legend")
          .data(d3.range(0, 9, 1)).enter()
            .append('rect')
            .attr("class", "legend")
            .attr('x', width-100)
            .attr('y', function(d, i) { return height/2 + (i*20);})
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', circle_color['deaths'])
            .attr('fill-opacity', function(d, i){ return keys[i]; })
            .on("mouseover", function(d, i){

              d3.select(this).transition().duration(100).attr('width', 20).attr('height', 20);

              opacities[keys[i]]['States'].forEach(function(s){
                d3.selectAll("#" + s).attr("fill", "blue");
              });
            })
            .on("mouseout", function(d, i){
              d3.select(this).transition().duration(100).attr('width', 10).attr('height', 10);
              opacities[keys[i]]['States'].forEach(function(s){
                d3.selectAll("#" + s).attr("fill", circle_color['deaths']);
              });
            })
          for (i=0 ; i<9 ; i++)
          {
            legend.append('text')
              .attr("class", "legend")
              .attr('x', width - 150)
              .attr('y', height/2 + (i*20) + 10)
              .attr('fill', 'white')
              .style('font-size', '10px')
              .text(opacities[keys[i]]['Range']);
          }

        yScale = d3.scaleBand().domain(states).range ([barplot_height, 0]).padding(0.4);
        xScale_deaths = d3.scaleLinear().domain([d3.min(deaths) , d3.max(deaths)]).range ([0, barplot_width]);

        var yaxis = g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + translate + ",0)")
          .call(d3.axisLeft(yScale));

        var xaxis = g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + translate + "," + barplot_height + ")")
          .call(d3.axisBottom(xScale_deaths).ticks(8).tickFormat(d3.format(".2s")));

        var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        var bars1 = g.selectAll(".bar1")
           .data(response.usadata)
           .enter().append("rect")
             .attr("class", "bar1")
             .attr("id", function(d) { return 'i' + response.dict[d.state];})
             .attr("transform", "translate(" + translate + ",0)")
             .attr("fill", circle_color["deaths"])
             .attr("fill-opacity", "0.8")
             .attr("width", function(d){ return xScale_deaths(d3.min(deaths)); })
             .attr("y", function(d){ return yScale(d.state); })
             .attr("height", yScale.bandwidth());

        g.selectAll(".bar1")
          .transition()
          .duration(800)
          .attr("width", function(d){ return xScale_deaths(d.deaths); })
          .attr("y", function(d) { return yScale(d.state); })
          .delay(function(d,i){return(i*20)});

      }

    // Confirmed Button
     var radio_buttons = svg.append("g")
        .attr("id", "confirmed_button")
        .attr("transform", "translate(" + (width/2 - 150) + "," + (height-50) + ")")
        .attr("fill", "#3b3b3b")
        .attr("stroke", "#ffffff")
        .attr("fill-opacity", "1")
        .attr("stroke-opacity", "0.3")
        .on("mouseover", function(d){
          d3.select(this).attr("fill-opacity", "0.5");
          d3.select(this).select("circle").attr("fill", "red");
          d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", function(d){
          d3.select(this).attr("fill-opacity", "1");
          d3.select(this).select("circle").attr("fill", circle_color["cases"]);
        })
        .on("mousedown", function(d){
          d3.select(this).attr("fill", "red");
          draw("Confirmed");
        })
        .on("mouseup", function(d){
          d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
        });
      radio_buttons.append("path")
        .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
        .attr("cx", 20)
        .attr("cy", 18)
        .attr("fill", circle_color["cases"])
        .style("opacity", "1")
        .style("stroke", "#420D09")
        .style("stroke-width" , "2px")
        .attr("r", 10);
      radio_buttons.append("text")
        .attr("x", 50)
        .attr("y", 22)
        .attr("fill", "white")
        .attr("style", "font-size:20px;")
        .text("Confirmed");

      // Deaths Button
      var radio_buttons = svg.append("g")
        .attr("id", "deaths_button")
        .attr("transform", "translate(" + (width/2 + 50) + "," + (height-50) + ")")
        .attr("fill", "#3b3b3b")
        .attr("stroke", "#ffffff")
        .attr("fill-opacity", "1")
        .attr("stroke-opacity", "0.3")
        .on("mouseover", function(d){
            d3.select(this).attr("fill-opacity", "0.5");
            d3.select(this).select("circle").attr("fill", "red");
            d3.select(this).style("cursor", "pointer");
          })
          .on("mouseout", function(d){
            d3.select(this).attr("fill-opacity", "1");
            d3.select(this).select("circle").attr("fill", circle_color["deaths"]);
          })
        .on("mousedown", function(d){
          d3.select(this).attr("fill", "red");
          draw("Deaths");
        })
        .on("mouseup", function(d){
          d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
        });
      radio_buttons.append("path")
          .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
          .attr("cx", 20)
          .attr("cy", 18)
          .attr("fill", circle_color["deaths"])
          .style("opacity", "0.7")
          .style("stroke", "#420D09")
          .style("stroke-width" , "2px")
          .attr("r", 10);
      radio_buttons.append("text")
        .attr("x", 50)
        .attr("y", 22)
        .attr("fill", "white")
        .attr("style", "font-size:20px;")
        .text("Deaths");
    }

    d3.select("#title").text("USA Confirmed Cases");
    draw("Confirmed");     
  }
  else if(title.includes('India Confirmed Cases')){
    StatesData = {};

    response.indiafeatures.forEach(function(f){
      StatesData[f.id] = {'Active' : 0, 'Recovered' : 0, 'Deaths' : 0, 'Confirmed' : 0};
    });

    var case_type = {'Active' : [], 'Recovered' : [], 'Deaths' : [], 'Confirmed' : []};
    var types = Object.keys(case_type);
    var states = [];

    response.indiadata.forEach(function(d){
      var state = d.State;
      states.push(state);

      types.forEach(function(type){

        if(state in StatesData){
          StatesData[state][type] += d[type];
          case_type[type].push(d[type]);
        }
      });
    });

    console.log(case_type);
    var proj = d3.geoMercator().center([80,25]).translate([(width/2-100), height/2 - 30]).scale(1000);
    var path = d3.geoPath().projection(proj);

    var circle_color = {"Confirmed" : "#CC7722", "Deaths" : "#FF2400", 'Recovered' : '#A4DE02', 'Active' : 'yellow'};
    // Load GeoJSON data and merge with states data
    function draw(type){

      d3.selectAll("path").remove();
      d3.select("#confirmed_button").remove();
      d3.select("#deaths_button").remove();
      d3.select("#active_button").remove();
      d3.select("#recov_button").remove();
      d3.select("#barplot").selectAll("*").remove();
      d3.selectAll(".legend").remove();

      g.append('rect')
        .attr("class", "barRect")
        .attr('transform', 'translate(' + translate + ',0)')
        .attr('height', barplot_height)
        .attr('width', barplot_width)
        .attr("fill", "#112222")
        .attr("opacity", .9);

      if(type=="Active"){
        d3.select("#title").text("India Active Cases");
        
        // Opacities for coloring of States in US
        var opacities = {1 : { 'Range' : '> 5k', 'States' : []}, 
                        0.85 : {'Range' : '2k - 5k', 'States' : []}, 
                        0.75 : {'Range' : '1k - 2k', 'States' : []}, 
                        0.65 : {'Range' : '500 - 1k', 'States' : []}, 
                        0.55 : {'Range' : '200 - 500', 'States' : []}, 
                        0.45 : {'Range': '100 - 200', 'States' : []},
                        0.35 : {'Range' : '50 - 100', 'States' : []}, 
                        0.25 : {'Range' : '20 - 50', 'States' : []},
                        0.15 : {'Range' : '< 20', 'States' : []}};

        svg.selectAll("path")
          .data(response.indiafeatures)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", "state")
          .attr("id", function(d) { return 'i' + response.dict[d.id];})
          .style("stroke", "black")
          .style("stroke-width", "1")
          .style("opacity", function(d){
            var value = StatesData[d.id]['Active'];
            if(value>=5000){
              opacities[1]['States'].push('i' + response.dict[d.id]);
              return "1";
            }
            else if(value>=2000 & value<5000){
              opacities[0.85]['States'].push('i' + response.dict[d.id]);
              return "0.85";
            }
            else if(value>=1000 & value<2000){
              opacities[0.75]['States'].push('i' + response.dict[d.id]);
              return "0.75";
            }
            else if(value>=500 & value<1000){
              opacities[0.65]['States'].push('i' + response.dict[d.id]);
              return "0.65";
            }
            else if(value>=200 & value<500){
              opacities[0.55]['States'].push('i' + response.dict[d.id]);
              return "0.55";
            }
            else if(value>=100 & value<200){
              opacities[0.45]['States'].push('i' + response.dict[d.id]);
              return "0.45";
            }
            else if(value>=50 & value<100){
              opacities[0.35]['States'].push('i' + response.dict[d.id]);
              return "0.35";
            }
            else if(value>=20 & value<50){
              opacities[0.25]['States'].push('i' + response.dict[d.id]);
              return "0.25";
            }
            else if(value>=0 & value<20){
              opacities[0.15]['States'].push('i' + response.dict[d.id]);
              return "0.15";
            }
          })
          .attr("fill", function (d, i)  {
            var value = StatesData[d.id]['Active'];
            return circle_color['Active'];
            // if(value>=5000)
            //   return "rgb(123, 36, 28)";
            // else if(value>=1500 & value<5000)
            //   return "rgb(231, 76, 60)";
            // else if(value>=1000 & value<1500)
            //   return "rgb(231, 76, 60)";
            // else if(value>=500 & value<1000)
            //   return "rgb(255, 87, 34)";
            // else if(value>=200 & value<500)
            //   return "rgb(255, 87, 34)";
            // else if(value>=100 & value<200)
            //   return "rgb(231, 76, 60)";
            // else if(value>=50 & value<100)
            //   return "rgb(231, 76, 60)";
            // else if(value>=20 & value<50)
            //   return "rgb(255, 87, 34)";
            // else if(value>=0 & value<20)
            //   return "rgb(231, 76, 60)";
          })
          .on("mouseover", function(d) {
              div.transition()    
                  .duration(200)    
                  .style("opacity", .7);    
              div.html(d.id + "<br/>" + "<br/>" +"Active: " + StatesData[d.id]['Active'])  
                  .style("left", (d3.event.pageX + 15) + "px")   
                  .style("top", (d3.event.pageY - 28) + "px");
              d3.select("#i" + response.dict[d.id])
                  .transition()
                  .duration(400)
                  .attr('fill', "blue")
                  .attr('fill-opacity', '1')
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale(response.indiadata[response.dict[d.id]]['Active']) + 10)
                  .attr('height', yScale.bandwidth() + 10); 
          })
          .on("mouseout", function(d) {   
              div.transition()    
                  .duration(500)    
                  .style("opacity", 0); 

              d3.select("#i" + response.dict[d.id])
                  .transition()
                  .duration(400)
                  .attr('fill', circle_color["Active"])
                  .attr('fill-opacity', '1')
                  .attr('stroke', "none")
                  .attr("stroke-width", "none")
                  .attr('height', yScale.bandwidth())
                  .attr("width", xScale(response.indiadata[response.dict[d.id]]['Active']));
          });

        var legend = svg.append('g')
            .attr('id', 'legend');
        var keys = Object.keys(opacities);
        // Adding rects for legend, and mouseover & mouseout events
        legend.selectAll(".legend")
          .data(d3.range(0, 9, 1)).enter()
            .append('rect')
            .attr("class", "legend")
            .attr('x', width-100)
            .attr('y', function(d, i) { return height/2 + (i*20);})
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', circle_color['Active'])
            .attr('fill-opacity', function(d, i){ return keys[i]; })
            .on("mouseover", function(d, i){

              d3.select(this).transition().duration(100).attr('width', 20).attr('height', 20);

              opacities[keys[i]]['States'].forEach(function(s){
                d3.selectAll("#" + s).attr("fill", "blue");
              });
            })
            .on("mouseout", function(d, i){
              d3.select(this).transition().duration(100).attr('width', 10).attr('height', 10);
              opacities[keys[i]]['States'].forEach(function(s){
                d3.selectAll("#" + s).attr("fill", circle_color['Active']);
              });
            })
          for (i=0 ; i<9 ; i++)
          {
            legend.append('text')
              .attr("class", "legend")
              .attr('x', width - 150)
              .attr('y', height/2 + (i*20) + 10)
              .attr('fill', 'white')
              .style('font-size', '10px')
              .text(opacities[keys[i]]['Range']);
          }

        //Bar Plot for active cases in India
        var yScale = d3.scaleBand().domain(states).range ([barplot_height, 0]).padding(0.4);
        var xScale = d3.scaleLinear().domain([d3.min(case_type['Active']) , d3.max(case_type['Active'])]).range ([0, barplot_width - 20]);

        var yaxis = g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + translate + ",0)")
          .call(d3.axisLeft(yScale));

        var xaxis = g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + translate + "," + barplot_height + ")")
          .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".2s")));

        var bars = g.selectAll(".bar")
           .data(response.indiadata)
           .enter().append("rect")
             .attr("class", "bar")
             .attr("id", function(d) { return 'i' + response.dict[d.State];})
             .attr("transform", "translate(" + translate + ",0)")
             .attr("fill", circle_color["Active"])
             .attr("width", function(d){ return xScale(d3.min(case_type['Active'])); })
             .attr("y", function(d){ return yScale(d.State); })
             .attr("height", yScale.bandwidth());

        g.selectAll(".bar")
            .transition()
            .duration(800)
            .attr("width", function(d){ return xScale(d.Active); })
            .attr("y", function(d) { return yScale(d.State); })
            .delay(function(d,i){return(i*20)});
      }
      else if(type=="Confirmed"){
        // Opacities for coloring of States in US
        var opacities = {1 : { 'Range' : '> 5k', 'States' : []}, 
                        0.85 : {'Range' : '2k - 5k', 'States' : []}, 
                        0.75 : {'Range' : '1k - 2k', 'States' : []}, 
                        0.65 : {'Range' : '500 - 1k', 'States' : []}, 
                        0.55 : {'Range' : '200 - 500', 'States' : []}, 
                        0.45 : {'Range': '100 - 200', 'States' : []},
                        0.35 : {'Range' : '50 - 100', 'States' : []}, 
                        0.25 : {'Range' : '20 - 50', 'States' : []},
                        0.15 : {'Range' : '< 20', 'States' : []}};

        d3.select("#title").text("India Confirmed Cases");
        svg.selectAll("path")
          .data(response.indiafeatures)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", "state")
          .attr("id", function(d) { return 'i' + response.dict[d.id];})
          .style("stroke", "black")
          .style("stroke-width", "1")
          .style("opacity", function(d){
            var value = StatesData[d.id]['Confirmed'];
            if(value>=5000){
              opacities[1]['States'].push('i' + response.dict[d.id]);
              return "1";
            }
            else if(value>=2000 & value<5000){
              opacities[0.85]['States'].push('i' + response.dict[d.id]);
              return "0.85";
            }
            else if(value>=1000 & value<2000){
              opacities[0.75]['States'].push('i' + response.dict[d.id]);
              return "0.75";
            }
            else if(value>=500 & value<1000){
              opacities[0.65]['States'].push('i' + response.dict[d.id]);
              return "0.65";
            }
            else if(value>=200 & value<500){
              opacities[0.55]['States'].push('i' + response.dict[d.id]);
              return "0.55";
            }
            else if(value>=100 & value<200){
              opacities[0.45]['States'].push('i' + response.dict[d.id]);
              return "0.45";
            }
            else if(value>=50 & value<100){
              opacities[0.35]['States'].push('i' + response.dict[d.id]);
              return "0.35";
            }
            else if(value>=20 & value<50){
              opacities[0.25]['States'].push('i' + response.dict[d.id]);
              return "0.25";
            }
            else if(value>=0 & value<20){
              opacities[0.15]['States'].push('i' + response.dict[d.id]);
              return "0.15";
            }
          })
          .attr("fill", function (d, i)  {
            var value = StatesData[d.id]['Confirmed'];
            return circle_color['Confirmed'];
            // if(value>=5000)
            //   return "rgb(123, 36, 28)";
            // else if(value>=1500 & value<5000)
            //   return "rgb(231, 76, 60)";
            // else if(value>=1000 & value<1500)
            //   return "rgb(231, 76, 60)";
            // else if(value>=500 & value<1000)
            //   return "rgb(255, 87, 34)";
            // else if(value>=200 & value<500)
            //   return "rgb(255, 87, 34)";
            // else if(value>=100 & value<200)
            //   return "rgb(231, 76, 60)";
            // else if(value>=50 & value<100)
            //   return "rgb(231, 76, 60)";
            // else if(value>=20 & value<50)
            //   return "rgb(255, 87, 34)";
            // else if(value>=0 & value<20)
            //   return "rgb(231, 76, 60)";
          })
          .on("mouseover", function(d) {    
              div.transition()    
                  .duration(200)    
                  .style("opacity", .7);    
              div.html(d.id + "<br/>" + "<br/>" +"Confirmed: " + StatesData[d.id]['Confirmed'])  
                  .style("left", (d3.event.pageX + 15) + "px")   
                  .style("top", (d3.event.pageY - 28) + "px"); 

              d3.select("#i" + response.dict[d.id])
                  .transition()
                  .duration(400)
                  .attr('fill', "blue")
                  .attr('fill-opacity', '1')
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale(response.indiadata[response.dict[d.id]]['Confirmed']) + 10)
                  .attr('height', yScale.bandwidth() + 10); 
          })
          .on("mouseout", function(d) {   
              div.transition()    
                  .duration(500)    
                  .style("opacity", 0); 

              d3.select("#i" + response.dict[d.id])
                  .transition()
                  .duration(400)
                  .attr('fill', circle_color["Confirmed"])
                  .attr('fill-opacity', '1')
                  .attr('stroke', "none")
                  .attr("stroke-width", "none")
                  .attr('height', yScale.bandwidth())
                  .attr("width", xScale(response.indiadata[response.dict[d.id]]['Confirmed']));
          });

        var legend = svg.append('g')
            .attr('id', 'legend');
        var keys = Object.keys(opacities);
        // Adding rects for legend, and mouseover & mouseout events
        legend.selectAll(".legend")
          .data(d3.range(0, 9, 1)).enter()
            .append('rect')
            .attr("class", "legend")
            .attr('x', width-100)
            .attr('y', function(d, i) { return height/2 + (i*20);})
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', circle_color['Confirmed'])
            .attr('fill-opacity', function(d, i){ return keys[i]; })
            .on("mouseover", function(d, i){

              d3.select(this).transition().duration(100).attr('width', 20).attr('height', 20);

              opacities[keys[i]]['States'].forEach(function(s){
                d3.selectAll("#" + s).attr("fill", "blue");
              });
            })
            .on("mouseout", function(d, i){
              d3.select(this).transition().duration(100).attr('width', 10).attr('height', 10);
              opacities[keys[i]]['States'].forEach(function(s){
                d3.selectAll("#" + s).attr("fill", circle_color['Confirmed']);
              });
            })
          for (i=0 ; i<9 ; i++)
          {
            legend.append('text')
              .attr("class", "legend")
              .attr('x', width - 150)
              .attr('y', height/2 + (i*20) + 10)
              .attr('fill', 'white')
              .style('font-size', '10px')
              .text(opacities[keys[i]]['Range']);
          }        
        //Bar Plot for confirmed cases in India
        var yScale = d3.scaleBand().domain(states).range ([barplot_height, 0]).padding(0.4);
        var xScale = d3.scaleLinear().domain([d3.min(case_type['Confirmed']) , d3.max(case_type['Confirmed'])]).range ([0, barplot_width - 20]);

        var yaxis = g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + translate + ",0)")
          .call(d3.axisLeft(yScale));

        var xaxis = g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + translate + "," + barplot_height + ")")
          .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".2s")));

        var bars = g.selectAll(".bar")
           .data(response.indiadata)
           .enter().append("rect")
             .attr("class", "bar")
             .attr("id", function(d) { return 'i' + response.dict[d.State];})
             .attr("transform", "translate(" + translate + ",0)")
             .attr("fill", circle_color["Confirmed"])
             .attr("width", function(d){ return xScale(d3.min(case_type['Confirmed'])); })
             .attr("y", function(d){ return yScale(d.State); })
             .attr("height", yScale.bandwidth());

        g.selectAll(".bar")
            .transition()
            .duration(800)
            .attr("width", function(d){ return xScale(d.Confirmed); })
            .attr("y", function(d) { return yScale(d.State); })
            .delay(function(d,i){return(i*20)});
      }
      else if(type=="Recovered"){
        d3.select("#title").text("India Recovered Cases");

        // Opacities for coloring of States in US
        var opacities = {1 : { 'Range' : '> 1k', 'States' : []}, 
                        0.85 : {'Range' : '500 - 1k', 'States' : []}, 
                        0.75 : {'Range' : '250 - 500', 'States' : []}, 
                        0.65 : {'Range' : '150 - 250', 'States' : []}, 
                        0.55 : {'Range' : '100 - 150', 'States' : []}, 
                        0.45 : {'Range': '50 - 100', 'States' : []},
                        0.35 : {'Range' : '30 - 50', 'States' : []}, 
                        0.25 : {'Range' : '10 - 30', 'States' : []},
                        0.15 : {'Range' : '< 10', 'States' : []}};

        svg.selectAll("path")
          .data(response.indiafeatures)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", "state")
          .attr("id", function(d) { return 'i' + response.dict[d.id];})
          .style("stroke", "black")
          .style("stroke-width", "1")
          .style("opacity", function(d){
            var value = StatesData[d.id]['Recovered'];
            if(value>=1000){
              opacities[1]['States'].push('i' + response.dict[d.id]);
              return "1";
            }
            else if(value>=500 & value<1000){
              opacities[0.85]['States'].push('i' + response.dict[d.id]);
              return "0.85";
            }
            else if(value>=250 & value<500){
              opacities[0.75]['States'].push('i' + response.dict[d.id]);
              return "0.75";
            }
            else if(value>=150 & value<250){
              opacities[0.65]['States'].push('i' + response.dict[d.id]);
              return "0.65";
            }
            else if(value>=100 & value<150){
              opacities[0.55]['States'].push('i' + response.dict[d.id]);
              return "0.55";
            }
            else if(value>=50 & value<100){
              opacities[0.45]['States'].push('i' + response.dict[d.id]);
              return "0.45";
            }
            else if(value>=30 & value<50){
              opacities[0.35]['States'].push('i' + response.dict[d.id]);
              return "0.35";
            }
            else if(value>=10 & value<30){
              opacities[0.25]['States'].push('i' + response.dict[d.id]);
              return "0.25";
            }
            else if(value>=0 & value<10){
              opacities[0.15]['States'].push('i' + response.dict[d.id]);
              return "0.15";
            }
          })
          .attr("fill", function (d, i)  {
            var value = StatesData[d.id]['Recovered'];
            return circle_color['Recovered'];
            // if(value>=5000)
            //   return "rgb(123, 36, 28)";
            // else if(value>=1500 & value<5000)
            //   return "rgb(231, 76, 60)";
            // else if(value>=1000 & value<1500)
            //   return "rgb(231, 76, 60)";
            // else if(value>=500 & value<1000)
            //   return "rgb(255, 87, 34)";
            // else if(value>=200 & value<500)
            //   return "rgb(255, 87, 34)";
            // else if(value>=100 & value<200)
            //   return "rgb(231, 76, 60)";
            // else if(value>=50 & value<100)
            //   return "rgb(231, 76, 60)";
            // else if(value>=20 & value<50)
            //   return "rgb(255, 87, 34)";
            // else if(value>=0 & value<20)
            //   return "rgb(231, 76, 60)";
          })
          .on("mouseover", function(d) {    
              div.transition()    
                  .duration(200)    
                  .style("opacity", .7);    
              div.html(d.id + "<br/>" + "<br/>" +"Recovered: " + StatesData[d.id]['Recovered'])  
                  .style("left", (d3.event.pageX + 15) + "px")   
                  .style("top", (d3.event.pageY - 28) + "px");  

              d3.select("#i" + response.dict[d.id])
                  .transition()
                  .duration(400)
                  .attr('fill', "blue")
                  .attr('fill-opacity', '1')
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale(response.indiadata[response.dict[d.id]]['Recovered']) + 10)
                  .attr('height', yScale.bandwidth() + 10); 
          })
          .on("mouseout", function(d) {   
              div.transition()    
                  .duration(500)    
                  .style("opacity", 0); 

              d3.select("#i" + response.dict[d.id])
                  .transition()
                  .duration(400)
                  .attr('fill', circle_color["Recovered"])
                  .attr('fill-opacity', '1')
                  .attr('stroke', "none")
                  .attr("stroke-width", "none")
                  .attr('height', yScale.bandwidth())
                  .attr("width", xScale(response.indiadata[response.dict[d.id]]['Recovered']));
          });
        

        var legend = svg.append('g')
            .attr('id', 'legend');
        var keys = Object.keys(opacities);
        // Adding rects for legend, and mouseover & mouseout events
        legend.selectAll(".legend")
          .data(d3.range(0, 9, 1)).enter()
            .append('rect')
            .attr("class", "legend")
            .attr('x', width-100)
            .attr('y', function(d, i) { return height/2 + (i*20);})
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', circle_color['Recovered'])
            .attr('fill-opacity', function(d, i){ return keys[i]; })
            .on("mouseover", function(d, i){

              d3.select(this).transition().duration(100).attr('width', 20).attr('height', 20);

              opacities[keys[i]]['States'].forEach(function(s){
                d3.selectAll("#" + s).attr("fill", "blue");
              });
            })
            .on("mouseout", function(d, i){
              d3.select(this).transition().duration(100).attr('width', 10).attr('height', 10);
              opacities[keys[i]]['States'].forEach(function(s){
                d3.selectAll("#" + s).attr("fill", circle_color['Recovered']);
              });
            })
          for (i=0 ; i<9 ; i++)
          {
            legend.append('text')
              .attr("class", "legend")
              .attr('x', width - 150)
              .attr('y', height/2 + (i*20) + 10)
              .attr('fill', 'white')
              .style('font-size', '10px')
              .text(opacities[keys[i]]['Range']);
          } 


        //Bar Plot for recovered cases in India
        var yScale = d3.scaleBand().domain(states).range ([barplot_height, 0]).padding(0.4);
        var xScale = d3.scaleLinear().domain([d3.min(case_type['Recovered']) , d3.max(case_type['Recovered'])]).range ([0, barplot_width - 20]);

        var yaxis = g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + translate + ",0)")
          .call(d3.axisLeft(yScale));

        var xaxis = g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + translate + "," + barplot_height + ")")
          .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".2s")));

        var bars = g.selectAll(".bar")
           .data(response.indiadata)
           .enter().append("rect")
             .attr("class", "bar")
             .attr("id", function(d) { return 'i' + response.dict[d.State];})
             .attr("transform", "translate(" + translate + ",0)")
             .attr("fill", circle_color["Recovered"])
             .attr("width", function(d){ return xScale(d3.min(case_type['Recovered'])); })
             .attr("y", function(d){ return yScale(d.State); })
             .attr("height", yScale.bandwidth());

        g.selectAll(".bar")
            .transition()
            .duration(800)
            .attr("width", function(d){ return xScale(d.Recovered); })
            .attr("y", function(d) { return yScale(d.State); })
            .delay(function(d,i){return(i*20)});
      }
      else if(type=="Deaths"){
        d3.select("#title").text("India Deaths Cases");

        // Opacities for coloring of States in US
        var opacities = {1 : { 'Range' : '> 300', 'States' : []}, 
                        0.85 : {'Range' : '100 - 300', 'States' : []}, 
                        0.75 : {'Range' : '50 - 100', 'States' : []}, 
                        0.65 : {'Range' : '30 - 50', 'States' : []}, 
                        0.55 : {'Range' : '20 - 30', 'States' : []}, 
                        0.45 : {'Range': '10 - 20', 'States' : []},
                        0.35 : {'Range' : '5 - 10', 'States' : []}, 
                        0.25 : {'Range' : '0 - 5', 'States' : []},
                        0.15 : {'Range' : '= 0', 'States' : []}};

        svg.selectAll("path")
          .data(response.indiafeatures)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", "state")
          .attr("id", function(d) { return 'i' + response.dict[d.id];})
          .style("stroke", "black")
          .style("stroke-width", "1")
          .style("opacity", function(d){
            var value = StatesData[d.id]['Deaths'];
            if(value>=300){
              opacities[1]['States'].push('i' + response.dict[d.id]);
              return "1";
            }
            else if(value>=100 & value<300){
              opacities[0.85]['States'].push('i' + response.dict[d.id]);
              return "0.85";
            }
            else if(value>=50 & value<100){
              opacities[0.75]['States'].push('i' + response.dict[d.id]);
              return "0.75";
            }
            else if(value>=30 & value<50){
              opacities[0.65]['States'].push('i' + response.dict[d.id]);
              return "0.65";
            }
            else if(value>=20 & value<30){
              opacities[0.55]['States'].push('i' + response.dict[d.id]);
              return "0.55";
            }
            else if(value>=10 & value<20){
              opacities[0.45]['States'].push('i' + response.dict[d.id]);
              return "0.45";
            }
            else if(value>=5 & value<10){
              opacities[0.35]['States'].push('i' + response.dict[d.id]);
              return "0.35";
            }
            else if(value>0 & value<5){
              opacities[0.25]['States'].push('i' + response.dict[d.id]);
              return "0.25";
            }
            else if(value==0){
              opacities[0.15]['States'].push('i' + response.dict[d.id]);
              return "0.15";
            }
          })
          .attr("fill", function (d, i)  {
            var value = StatesData[d.id]['Deaths'];
            return circle_color['Deaths'];
            // if(value>=5000)
            //   return "rgb(123, 36, 28)";
            // else if(value>=1500 & value<5000)
            //   return "rgb(231, 76, 60)";
            // else if(value>=1000 & value<1500)
            //   return "rgb(231, 76, 60)";
            // else if(value>=500 & value<1000)
            //   return "rgb(255, 87, 34)";
            // else if(value>=200 & value<500)
            //   return "rgb(255, 87, 34)";
            // else if(value>=100 & value<200)
            //   return "rgb(231, 76, 60)";
            // else if(value>=50 & value<100)
            //   return "rgb(231, 76, 60)";
            // else if(value>=20 & value<50)
            //   return "rgb(255, 87, 34)";
            // else if(value>=0 & value<20)
            //   return "rgb(231, 76, 60)";
          })
          .on("mouseover", function(d) {    
              div.transition()    
                  .duration(200)    
                  .style("opacity", .7);    
              div.html(d.id + "<br/>" + "<br/>" +"Deaths: " + StatesData[d.id]['Deaths'])  
                  .style("left", (d3.event.pageX + 15) + "px")   
                  .style("top", (d3.event.pageY - 28) + "px");  

              d3.select("#i" + response.dict[d.id])
                  .transition()
                  .duration(400)
                  .attr('fill', "blue")
                  .attr('fill-opacity', '1')
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale(response.indiadata[response.dict[d.id]]['Deaths']) + 10)
                  .attr('height', yScale.bandwidth() + 10); 
          })
          .on("mouseout", function(d) {   
              div.transition()    
                  .duration(500)    
                  .style("opacity", 0); 

              d3.select("#i" + response.dict[d.id])
                  .transition()
                  .duration(400)
                  .attr('fill', circle_color["Deaths"])
                  .attr('fill-opacity', '1')
                  .attr('stroke', "none")
                  .attr("stroke-width", "none")
                  .attr('height', yScale.bandwidth())
                  .attr("width", xScale(response.indiadata[response.dict[d.id]]['Deaths']));
          });
        
                var legend = svg.append('g')
            .attr('id', 'legend');
        var keys = Object.keys(opacities);
        // Adding rects for legend, and mouseover & mouseout events
        legend.selectAll(".legend")
          .data(d3.range(0, 9, 1)).enter()
            .append('rect')
            .attr("class", "legend")
            .attr('x', width-100)
            .attr('y', function(d, i) { return height/2 + (i*20);})
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', circle_color['Deaths'])
            .attr('fill-opacity', function(d, i){ return keys[i]; })
            .on("mouseover", function(d, i){

              d3.select(this).transition().duration(100).attr('width', 20).attr('height', 20);

              opacities[keys[i]]['States'].forEach(function(s){
                d3.selectAll("#" + s).attr("fill", "blue");
              });
            })
            .on("mouseout", function(d, i){
              d3.select(this).transition().duration(100).attr('width', 10).attr('height', 10);
              opacities[keys[i]]['States'].forEach(function(s){
                d3.selectAll("#" + s).attr("fill", circle_color['Deaths']);
              });
            })
          for (i=0 ; i<9 ; i++)
          {
            legend.append('text')
              .attr("class", "legend")
              .attr('x', width - 150)
              .attr('y', height/2 + (i*20) + 10)
              .attr('fill', 'white')
              .style('font-size', '10px')
              .text(opacities[keys[i]]['Range']);
          } 

        //Bar Plot for death cases in India
        var yScale = d3.scaleBand().domain(states).range ([barplot_height, 0]).padding(0.4);
        var xScale = d3.scaleLinear().domain([d3.min(case_type['Deaths']) , d3.max(case_type['Deaths'])]).range ([0, barplot_width - 20]);

        var yaxis = g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + translate + ",0)")
          .call(d3.axisLeft(yScale));

        var xaxis = g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + translate + "," + barplot_height + ")")
          .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".2s")));

        var bars = g.selectAll(".bar")
           .data(response.indiadata)
           .enter().append("rect")
             .attr("class", "bar")
             .attr("id", function(d) { return 'i' + response.dict[d.State];})
             .attr("transform", "translate(" + translate + ",0)")
             .attr("fill", circle_color["Deaths"])
             .attr("width", function(d){ return xScale(d3.min(case_type['Deaths'])); })
             .attr("y", function(d){ return yScale(d.State); })
             .attr("height", yScale.bandwidth());

        g.selectAll(".bar")
            .transition()
            .duration(800)
            .attr("width", function(d){ return xScale(d.Deaths); })
            .attr("y", function(d) { return yScale(d.State); })
            .delay(function(d,i){return(i*20)});        
      }

      // Active Button
      var radio_buttons = svg.append("g")
        .attr("id", "active_button")
        .attr("transform", "translate(" + (width/2 - 450) + "," + (height-50) + ")")
        // .attr("fill", "#3b3b3b")
        .attr("fill", "#112222")
        .attr("stroke", "#ffffff")
        .attr("fill-opacity", "1")
        .attr("stroke-opacity", "0.3")
        .on("mouseover", function(d){
          d3.select(this).attr("fill-opacity", "0.5");
          d3.select(this).select("circle").attr("fill", "red");
          d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", function(d){
          d3.select(this).attr("fill-opacity", "1");
          d3.select(this).select("circle").attr("fill", circle_color["Active"]);
        })
        .on("mousedown", function(d){
          d3.select(this).attr("fill", "red");
          draw("Active");
        })
        .on("mouseup", function(d){
          d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
        });
      radio_buttons.append("path")
        .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
        .attr("cx", 20)
        .attr("cy", 18)
        .attr("fill", circle_color["Active"])
        .style("opacity", "1")
        .style("stroke", "#420D09")
        .style("stroke-width" , "2px")
        .attr("r", 10);
      radio_buttons.append("text")
        .attr("x", 50)
        .attr("y", 22)
        .attr("fill", "white")
        .attr("style", "font-size:20px;")
        .text("Active");

      // Confirmed Button
      var radio_buttons = svg.append("g")
        .attr("id", "confirmed_button")
        .attr("transform", "translate(" + (width/2 - 250) + "," + (height-50) + ")")
        .attr("fill", "#112222")
        .attr("stroke", "#ffffff")
        .attr("fill-opacity", "1")
        .attr("stroke-opacity", "0.3")
        .on("mouseover", function(d){
          d3.select(this).attr("fill-opacity", "0.5");
          d3.select(this).select("circle").attr("fill", "red");
          d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", function(d){
          d3.select(this).attr("fill-opacity", "1");
          d3.select(this).select("circle").attr("fill", circle_color["Confirmed"]);
        })
        .on("mousedown", function(d){
          d3.select(this).attr("fill", "red");
          draw("Confirmed");
        })
        .on("mouseup", function(d){
          d3.select(this).transition().delay(100).attr("fill", "#112222");
        });
      radio_buttons.append("path")
        .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
        .attr("cx", 20)
        .attr("cy", 18)
        .attr("fill", circle_color["Confirmed"])
        .style("opacity", "1")
        .style("stroke", "#420D09")
        .style("stroke-width" , "2px")
        .attr("r", 10);
      radio_buttons.append("text")
        .attr("x", 50)
        .attr("y", 22)
        .attr("fill", "white")
        .attr("style", "font-size:20px;")
        .text("Confirmed");

      // Recovered Button
      var radio_buttons = svg.append("g")
        .attr("id", "recov_button")
        .attr("transform", "translate(" + (width/2 - 50) + "," + (height-50) + ")")
        .attr("fill", "#112222")
        .attr("stroke", "#ffffff")
        .attr("fill-opacity", "1")
        .attr("stroke-opacity", "0.3")
        .on("mouseover", function(d){
          d3.select(this).attr("fill-opacity", "0.5");
          d3.select(this).select("circle").attr("fill", "red");
          d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", function(d){
          d3.select(this).attr("fill-opacity", "1");
          d3.select(this).select("circle").attr("fill", circle_color["Recovered"]);
        })
        .on("mousedown", function(d){
          d3.select(this).attr("fill", "red");
          draw("Recovered");
        })
        .on("mouseup", function(d){
          d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
        });
      radio_buttons.append("path")
        .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
        .attr("cx", 20)
        .attr("cy", 18)
        .attr("fill", circle_color["Recovered"])
        .style("opacity", "1")
        .style("stroke", "#420D09")
        .style("stroke-width" , "2px")
        .attr("r", 10);
      radio_buttons.append("text")
        .attr("x", 50)
        .attr("y", 22)
        .attr("fill", "white")
        .attr("style", "font-size:20px;")
        .text("Recovered");

      // Deaths Button
      var radio_buttons = svg.append("g")
        .attr("id", "deaths_button")
        .attr("transform", "translate(" + (width/2 + 150) + "," + (height-50) + ")")
        .attr("fill", "#112222")
        .attr("stroke", "#ffffff")
        .attr("fill-opacity", "1")
        .attr("stroke-opacity", "0.3")
        .on("mouseover", function(d){
          d3.select(this).attr("fill-opacity", "0.5");
          d3.select(this).select("circle").attr("fill", "red");
          d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", function(d){
          d3.select(this).attr("fill-opacity", "1");
          d3.select(this).select("circle").attr("fill", circle_color["Deaths"]);
        })
        .on("mousedown", function(d){
          d3.select(this).attr("fill", "red");
          draw("Deaths");
        })
        .on("mouseup", function(d){
          d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
        });
      radio_buttons.append("path")
        .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
        .attr("cx", 20)
        .attr("cy", 18)
        .attr("fill", circle_color["Deaths"])
        .style("opacity", "1")
        .style("stroke", "#420D09")
        .style("stroke-width" , "2px")
        .attr("r", 10);
      radio_buttons.append("text")
        .attr("x", 50)
        .attr("y", 22)
        .attr("fill", "white")
        .attr("style", "font-size:20px;")
        .text("Deaths");

    }
    draw('Confirmed');
  }
  else if(title.includes('USA Population')){

    // D3 Projection
    var projection = d3.geoAlbersUsa()
               .translate([(width/2-100), height/2])    // translate to center of screen
               .scale([1000]);          // scale things down so see entire US
            
    // Define path generator
    var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
             .projection(projection);  // tell path generator to use albersUsa projection

    var pop = [];
    var states = [];
    response.data.forEach(function(d) { 
      pop.push(d.Population); 
      states.push(d.state);
    });

    // Opacities for coloring of States in US
    var opacities = {1 : { 'Range' : '> 10k', 'States' : []}, 
                    0.85 : {'Range' : '7k - 10k', 'States' : []}, 
                    0.75 : {'Range' : '5k - 7k', 'States' : []}, 
                    0.65 : {'Range' : '3k - 5k', 'States' : []}, 
                    0.55 : {'Range': '2k - 3k', 'States' : []},
                    0.45 : {'Range': '1.5k - 2k', 'States' : []},
                    0.35 : {'Range': '1k - 1.5k', 'States' : []},
                    0.25 : {'Range' : '500 - 1k', 'States' : []}, 
                    0.15 : {'Range' : '< 500', 'States' : []}};

    var states_color = "#66ff66";

    svg.selectAll("path")
        .data(response.usafeatures)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "state")
        .attr("id", function(d) { return 'i' + response.dict[d.properties.name];})
        .style("stroke", "black")
        .style("stroke-width", "1.2")
        .style("opacity", function(d){
          var value = ~~response.data[response.dict[d.properties.name]]['Population'];
          if(value>=10000){
            opacities[1]['States'].push('i' + response.dict[d.properties.name]);
            return "1";
          }
          else if(value>=7000 & value<10000){
            opacities[0.85]['States'].push('i' + response.dict[d.properties.name]);
            return "0.85";
          }
          else if(value>=5000 & value<7000){
            opacities[0.75]['States'].push('i' + response.dict[d.properties.name]);
            return "0.75";
          }
          else if(value>=3000 & value<5000){
            opacities[0.65]['States'].push('i' + response.dict[d.properties.name]);
            return "0.65";
          }
          else if(value>=2000 & value<3000){
            opacities[0.55]['States'].push('i' + response.dict[d.properties.name]);
            return "0.55";
          }
          else if(value>=1500 & value<2000){
            opacities[0.45]['States'].push('i' + response.dict[d.properties.name]);
            return "0.45";
          }
          else if(value>=1000 & value<1500){
            opacities[0.35]['States'].push('i' + response.dict[d.properties.name]);
            return "0.35";
          }
          else if(value>=500 & value<1000){
            opacities[0.25]['States'].push('i' + response.dict[d.properties.name]);
            return "0.25";
          }
          else if(value<500){
            opacities[0.15]['States'].push('i' + response.dict[d.properties.name]);
            return "0.15";
          }
        })
        .attr("fill", states_color )
        .on("mouseover", function(d) {
            div.transition()    
                .duration(200)    
                .style("opacity", .7);    
            div.html(d.properties.name + "<br/>" + "<br/>" +"Confirmed Cases/M: " + ~~response.data[response.dict[d.properties.name]]['Population'] + "<br/>" + "Population: " + ~~(response.data[response.dict[d.properties.name]]['cases'] * 1000000 / response.data[response.dict[d.properties.name]]['Population']))  
                .style("left", (d3.event.pageX + 15) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
        })
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });
    
    var legend = svg.append('g')
        .attr('id', 'legend');
    var keys = Object.keys(opacities);

    // Adding rects for legend, and mouseover & mouseout events
    legend.selectAll(".legend")
      .data(d3.range(0, 9, 1)).enter()
        .append('rect')
        .attr("class", "legend")
        .attr('x', width-100)
        .attr('y', function(d, i) { return height/2 + (i*20);})
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', states_color)
        .attr('fill-opacity', function(d, i){ return keys[i]; })
        .on("mouseover", function(d, i){

          d3.select(this).transition().duration(100).attr('width', 20).attr('height', 20);

          opacities[keys[i]]['States'].forEach(function(s){
            d3.selectAll("#" + s).attr("fill", "blue");
          });
        })
        .on("mouseout", function(d, i){
          d3.select(this).transition().duration(100).attr('width', 10).attr('height', 10);
          opacities[keys[i]]['States'].forEach(function(s){
            d3.selectAll("#" + s).attr("fill", states_color);
          });
        })
      for (i=0 ; i<9 ; i++)
      {
        legend.append('text')
          .attr("class", "legend")
          .attr('x', width - 150)
          .attr('y', height/2 + (i*20) + 10)
          .attr('fill', 'white')
          .style('font-size', '10px')
          .text(opacities[keys[i]]['Range']);
      }    
      //Bar Plot for active cases in India
      var yScale = d3.scaleBand().domain(states).range ([barplot_height, 0]).padding(0.4);
      var xScale = d3.scaleLinear().domain([d3.min(pop) , d3.max(pop)]).range ([0, barplot_width - 20]);

      var yaxis = g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + ",0)")
        .call(d3.axisLeft(yScale));

      var xaxis = g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + "," + barplot_height + ")")
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".2s")));

      var bars = g.selectAll(".bar")
         .data(response.data)
         .enter().append("rect")
           .attr("class", "bar")
           .attr("id", function(d) { return 'i' + response.dict[d.state];})
           .attr("transform", "translate(" + translate + ",0)")
           .attr("fill", states_color)
           .attr("width", function(d){ return xScale(d3.min(pop)); })
           .attr("y", function(d){ return yScale(d.state); })
           .attr("height", yScale.bandwidth());

      g.selectAll(".bar")
          .transition()
          .duration(800)
          .attr("width", function(d){ return xScale(d.Population); })
          .attr("y", function(d) { return yScale(d.state); })
          .delay(function(d,i){return(i*20)});
  }
  else if(title.includes('India Population')){
    var proj = d3.geoMercator()
        .center([80,25])
              .translate([(width/2-100), height/2 - 30])
              .scale(1000);
        
    var path = d3.geoPath().projection(proj);

    var pop = [];
    var states = [];
    response.data.forEach(function(d) { 
      pop.push(d.Population); 
      states.push(d.State);
    });
    
    // Opacities for coloring of States in US
    var opacities = {1 : { 'Range' : '> 150', 'States' : []}, 
                    0.8 : {'Range' : '40 - 150', 'States' : []}, 
                    0.7 : {'Range' : '20 - 40', 'States' : []}, 
                    0.6 : {'Range': '10 - 20', 'States' : []},
                    0.5 : {'Range': '5 - 10', 'States' : []},
                    0.4 : {'Range': '2 - 5', 'States' : []},
                    0.3 : {'Range' : '1 - 2', 'States' : []}, 
                    0.2 : {'Range' : '0 - 1', 'States' : []}};

    var states_color = "#66ff66";
    // #0080ff

    // Load GeoJSON data and merge with states data
      svg.selectAll("path")
        .data(response.indiafeatures)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "state")
        .attr("id", function(d) { return 'i' + response.dict[d.id];})
        .style("stroke", "black")
        .style("stroke-width", "1")
        .style("opacity", function(d){
          var value = response.data[response.dict[d.id]]['Population'];
          if(value>=150){
            opacities[1]['States'].push('i' + response.dict[d.id]);
            return "1";
          }
          else if(value>=40 & value<150){
            opacities[0.8]['States'].push('i' + response.dict[d.id]);
            return "0.8";
          }
          else if(value>=20 & value<40){
            opacities[0.7]['States'].push('i' + response.dict[d.id]);
            return "0.7";
          }
          else if(value>=10 & value<20){
            opacities[0.6]['States'].push('i' + response.dict[d.id]);
            return "0.6";
          }
          else if(value>=5 & value<10){
            opacities[0.5]['States'].push('i' + response.dict[d.id]);
            return "0.5";
          }
          else if(value>=2 & value<5){
            opacities[0.4]['States'].push('i' + response.dict[d.id]);
            return "0.4";
          }
          else if(value>=1 & value<2){
            opacities[0.3]['States'].push('i' + response.dict[d.id]);
            return "0.3";
          }
          else if(value>=0 & value<1){
            opacities[0.2]['States'].push('i' + response.dict[d.id]);
            return "0.2";
          }
        })
        .attr("fill", states_color)
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

    var legend = svg.append('g')
        .attr('id', 'legend');
    var keys = Object.keys(opacities);

    // Adding rects for legend, and mouseover & mouseout events
    legend.selectAll(".legend")
      .data(d3.range(0, 8, 1)).enter()
        .append('rect')
        .attr("class", "legend")
        .attr('x', width-100)
        .attr('y', function(d, i) { return height/2 + (i*20);})
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', states_color)
        .attr('fill-opacity', function(d, i){ return keys[i]; })
        .on("mouseover", function(d, i){

          d3.select(this).transition().duration(100).attr('width', 20).attr('height', 20);

          opacities[keys[i]]['States'].forEach(function(s){
            d3.selectAll("#" + s).attr("fill", "blue");
          });
        })
        .on("mouseout", function(d, i){
          d3.select(this).transition().duration(100).attr('width', 10).attr('height', 10);
          opacities[keys[i]]['States'].forEach(function(s){
            d3.selectAll("#" + s).attr("fill", states_color);
          });
        })
      for (i=0 ; i<8 ; i++)
      {
        legend.append('text')
          .attr("class", "legend")
          .attr('x', width - 150)
          .attr('y', height/2 + (i*20) + 10)
          .attr('fill', 'white')
          .style('font-size', '10px')
          .text(opacities[keys[i]]['Range']);
      }    
      //Bar Plot for active cases in India
      var yScale = d3.scaleBand().domain(states).range ([barplot_height, 0]).padding(0.4);
      var xScale = d3.scaleLinear().domain([d3.min(pop) , d3.max(pop)]).range ([0, barplot_width - 20]);

      var yaxis = g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + ",0)")
        .call(d3.axisLeft(yScale));

      var xaxis = g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + "," + barplot_height + ")")
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".2s")));

      var bars = g.selectAll(".bar")
         .data(response.data)
         .enter().append("rect")
           .attr("class", "bar")
           .attr("id", function(d) { return 'i' + response.dict[d.State];})
           .attr("transform", "translate(" + translate + ",0)")
           .attr("fill", states_color)
           .attr("width", function(d){ return xScale(d3.min(pop)); })
           .attr("y", function(d){ return yScale(d.State); })
           .attr("height", yScale.bandwidth());

      g.selectAll(".bar")
          .transition()
          .duration(800)
          .attr("width", function(d){ return xScale(d.Population); })
          .attr("y", function(d) { return yScale(d.State); })
          .delay(function(d,i){return(i*20)});
  }
}