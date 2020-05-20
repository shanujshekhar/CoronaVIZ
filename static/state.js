// keep a dictionary of titles, just need to do this in one of the files
var titles = {'USA': 'County Level Visualization', 'India' : 'Confirmed Cases in India', 'USA_Pop': 'USA Population', 'India_Pop' : 'India Population', 'county_specific' : 'County Level Visualization', 'cases_by_state' : 'USA Cases'};

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
            .attr("width", width + margin.right + margin.left + 450)
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
       .attr("x", width/2 - 50)
       .attr("y", margin.top/2 + 30) // x, y coordinate
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

        d3.select("#title").text("Confirmed Cases");
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
                  .attr('fill', "yellow")
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

        svg.append('text')
            .attr('x', barplot_width + 285)
            .attr('y', barplot_height/2)
            .attr('fill', 'white')
            .text('Legend');

        var legend = svg.append('g')
            .attr('id', 'legend');
        var keys = Object.keys(opacities);
        // Adding rects for legend, and mouseover & mouseout events
        legend.selectAll(".legend")
          .data(d3.range(0, 7, 1)).enter()
            .append('rect')
            .attr("class", "legend")
            .attr('x', width-120)
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
              .attr('x', width - 170)
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
             .attr("height", yScale.bandwidth())
             .on('mouseover', function(d){
              d3.select(this)
                .append('title')
                .html('Positive Cases: ' + d.cases);

              d3.select(this)
                  .transition()
                  .duration(400)
                  .attr('fill', "blue")
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale_con(d.cases) + 10)
                  .attr('height', yScale.bandwidth() + 10);

             })
             .on('mouseout', function(d){
                d3.select(this).select('title').remove();
                d3.select(this)
                    .transition()
                    .duration(400)
                    .attr('fill', circle_color["cases"])
                    .attr('stroke', "none")
                    .attr("stroke-width", "none")
                    .attr('height', yScale.bandwidth())
                    .attr("width", xScale_con(d.cases));
             });

        g.selectAll(".bar")
            .transition()
            .duration(800)
            .attr("width", function(d){ return xScale_con(d.cases); })
            .attr("y", function(d) { return yScale(d.state); })
            .delay(function(d,i){return(i*20)});

      }
      else{
        d3.select("#title").text("Deaths Due to COVID-19");

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

        // Legend
        svg.append('text')
          .attr('x', barplot_width + 285)
          .attr('y', barplot_height/2)
          .attr('fill', 'white')
          .text('Legend');

        var legend = svg.append('g')
            .attr('id', 'legend');
        var keys = Object.keys(opacities);
        // Adding rects for legend, and mouseover & mouseout events
        legend.selectAll(".legend")
          .data(d3.range(0, 9, 1)).enter()
            .append('rect')
            .attr("class", "legend")
            .attr('x', width-120)
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
              .attr('x', width - 170)
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
             .attr("height", yScale.bandwidth())
             .on('mouseover', function(d){
              d3.select(this)
                .append('title')
                .html('Deaths: ' + d.deaths);

              d3.select(this)
                  .transition()
                  .duration(400)
                  .attr('fill', "blue")
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale_deaths(d.deaths) + 10)
                  .attr('height', yScale.bandwidth() + 10);

             })
             .on('mouseout', function(d){
                d3.select(this).select('title').remove();
                d3.select(this)
                    .transition()
                    .duration(400)
                    .attr('fill', circle_color["deaths"])
                    .attr('stroke', "none")
                    .attr("stroke-width", "none")
                    .attr('height', yScale.bandwidth())
                    .attr("width", xScale_deaths(d.deaths));
             });

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
    
    g.append('text')
      .attr('x', 2 * barplot_width + 100)
      .attr('y', 20)
      .attr('fill', 'white')
      .text('Hover over State or Bars to see details');

    g.append('text')
      .attr('x', 2 * barplot_width + 50)
      .attr('y', 40)
      .attr('fill', 'white')
      .text('Hover over Legend to see States having cases in that range');

    // See USA COVID Cases
    var radio_buttons = svg.append("g")
        .attr("id", "case1")
        .attr("transform", "translate(" + 10 + "," + 10 + ")")
        .attr("fill", "#3b3b3b")
        .attr("stroke", "#ffffff")
        .attr("fill-opacity", "1")
        .attr("stroke-opacity", "0.3")
        .on("mouseover", function(d){
          d3.select(this).attr("fill-opacity", "0.5");
          d3.select(this).style("cursor", "pointer");
          d3.select(this).select("circle").attr("fill", "red");
        })
        .on("mouseout", function(d){
          d3.select(this).attr("fill-opacity", "1");
          d3.select(this).select("circle").attr("fill", "white");
        })
        .on("mousedown", function(d){
          d3.select(this).attr("fill", "red");
          d3.selectAll(".circle").remove();
          drawStatePlot(response, titles["cases_by_state"]);
        })
        .on("mouseup", function(d){
          d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
        });
    radio_buttons.append("path")
        .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
    radio_buttons.append("circle")
        .attr("cx", 20)
        .attr("cy", 18)
        .attr("fill", "white")
        .style("opacity", "0.7")
        .style("stroke", "#420D09")
        .style("stroke-width" , "2px")
        .attr("r", 10);
    radio_buttons.append("text")
        .attr("x", 50)
        .attr("y", 22)
        .attr("fill", "white")
        .attr("style", "font-size:11px;")
        .text("Cases By State");

    // See Population Wise Cases
    var radio_buttons = svg.append("g")
          .attr("id", "case2")
          .attr("transform", "translate(" + 210 + "," + 10 + ")")
          .attr("fill", "#3b3b3b")
          .attr("stroke", "#ffffff")
          .attr("fill-opacity", "1")
          .attr("stroke-opacity", "0.3")
          .on("mouseover", function(d){
            d3.select(this).attr("fill-opacity", "0.5");
            d3.select(this).style("cursor", "pointer");
            d3.select(this).select("circle").attr("fill", "red");
          })
          .on("mouseout", function(d){
            d3.select(this).attr("fill-opacity", "1");
            d3.select(this).select("circle").attr("fill", "white");
          })
          .on("mousedown", function(d){
            d3.select(this).attr("fill", "red");
            drawStatePlot(response, titles["USA_Pop"]);
          })
          .on("mouseup", function(d){
            d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
          });
      radio_buttons.append("path")
          .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
          .attr("cx", 20)
          .attr("cy", 18)
          .attr("fill", "white")
          .style("opacity", "0.7")
          .style("stroke", "#420D09")
          .style("stroke-width" , "2px")
          .attr("r", 10);
      radio_buttons.append("text")
          .attr("x", 50)
          .attr("y", 22)
          .attr("fill", "white")
          .attr("style", "font-size:12px;")
          .text("Cases Per Million");

    // Cases By County
    var radio_buttons = svg.append("g")
          .attr("id", "case2")
          .attr("transform", "translate(" + 410 + "," + 10 + ")")
          .attr("fill", "#3b3b3b")
          .attr("stroke", "#ffffff")
          .attr("fill-opacity", "1")
          .attr("stroke-opacity", "0.3")
          .on("mouseover", function(d){
            d3.select(this).attr("fill-opacity", "0.5");
            d3.select(this).style("cursor", "pointer");
            d3.select(this).select("circle").attr("fill", "red");
          })
          .on("mouseout", function(d){
            d3.select(this).attr("fill-opacity", "1");
            d3.select(this).select("circle").attr("fill", "white");
          })
          .on("mousedown", function(d){
            d3.select(this).attr("fill", "red");
            drawStatePlot(response, titles["county_specific"]);
          })
          .on("mouseup", function(d){
            d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
          });
      radio_buttons.append("path")
          .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
          .attr("cx", 20)
          .attr("cy", 18)
          .attr("fill", "white")
          .style("opacity", "0.7")
          .style("stroke", "#420D09")
          .style("stroke-width" , "2px")
          .attr("r", 10);
      radio_buttons.append("text")
          .attr("x", 40)
          .attr("y", 22)
          .attr("fill", "white")
          .attr("style", "font-size:12px;")
          .text("Cases By County");

    }

    d3.select("#title").text("Confirmed Cases");
    draw("Confirmed");     
  }
  else if(title.includes('Confirmed Cases in India')){
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
        d3.select("#title").text("Active Cases in India");
        
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

        // Legend
        svg.append('text')
          .attr('x', barplot_width + 285)
          .attr('y', barplot_height/2)
          .attr('fill', 'white')
          .text('Legend');

        var legend = svg.append('g')
            .attr('id', 'legend');
        var keys = Object.keys(opacities);
        // Adding rects for legend, and mouseover & mouseout events
        legend.selectAll(".legend")
          .data(d3.range(0, 9, 1)).enter()
            .append('rect')
            .attr("class", "legend")
            .attr('x', width-120)
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
              .attr('x', width - 170)
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
             .attr("height", yScale.bandwidth())
             .on('mouseover', function(d){
              d3.select(this)
                .append('title')
                .html('Active Cases: ' + d.Active);

              d3.select(this)
                  .transition()
                  .duration(400)
                  .attr('fill', "blue")
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale(d.Active) + 10)
                  .attr('height', yScale.bandwidth() + 10);

             })
             .on('mouseout', function(d){
                d3.select(this).select('title').remove();
                d3.select(this)
                    .transition()
                    .duration(400)
                    .attr('fill', circle_color["Active"])
                    .attr('stroke', "none")
                    .attr("stroke-width", "none")
                    .attr('height', yScale.bandwidth())
                    .attr("width", xScale(d.Active));
             });

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

        d3.select("#title").text("Confirmed Cases in India");
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

        // Legend
        svg.append('text')
          .attr('x', barplot_width + 285)
          .attr('y', barplot_height/2)
          .attr('fill', 'white')
          .text('Legend');

        var legend = svg.append('g')
            .attr('id', 'legend');
        var keys = Object.keys(opacities);
        // Adding rects for legend, and mouseover & mouseout events
        legend.selectAll(".legend")
          .data(d3.range(0, 9, 1)).enter()
            .append('rect')
            .attr("class", "legend")
            .attr('x', width-120)
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
              .attr('x', width - 170)
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
             .attr("height", yScale.bandwidth())
             .on('mouseover', function(d){
              d3.select(this)
                .append('title')
                .html('Confirmed Cases: ' + d.Confirmed);

              d3.select(this)
                  .transition()
                  .duration(400)
                  .attr('fill', "blue")
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale(d.Confirmed) + 10)
                  .attr('height', yScale.bandwidth() + 10);

             })
             .on('mouseout', function(d){
                d3.select(this).select('title').remove();
                d3.select(this)
                    .transition()
                    .duration(400)
                    .attr('fill', circle_color["Confirmed"])
                    .attr('stroke', "none")
                    .attr("stroke-width", "none")
                    .attr('height', yScale.bandwidth())
                    .attr("width", xScale(d.Confirmed));
             });

        g.selectAll(".bar")
            .transition()
            .duration(800)
            .attr("width", function(d){ return xScale(d.Confirmed); })
            .attr("y", function(d) { return yScale(d.State); })
            .delay(function(d,i){return(i*20)});
      }
      else if(type=="Recovered"){
        d3.select("#title").text("Recovered Cases in India");

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
        
        // Legend
        svg.append('text')
          .attr('x', barplot_width + 285)
          .attr('y', barplot_height/2)
          .attr('fill', 'white')
          .text('Legend');

        var legend = svg.append('g')
            .attr('id', 'legend');
        var keys = Object.keys(opacities);
        // Adding rects for legend, and mouseover & mouseout events
        legend.selectAll(".legend")
          .data(d3.range(0, 9, 1)).enter()
            .append('rect')
            .attr("class", "legend")
            .attr('x', width-120)
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
              .attr('x', width - 170)
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
             .attr("height", yScale.bandwidth())
             .on('mouseover', function(d){
              d3.select(this)
                .append('title')
                .html('Recovered Cases: ' + d.Recovered);

              d3.select(this)
                  .transition()
                  .duration(400)
                  .attr('fill', "blue")
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale(d.Recovered) + 10)
                  .attr('height', yScale.bandwidth() + 10);

             })
             .on('mouseout', function(d){
                d3.select(this).select('title').remove();
                d3.select(this)
                    .transition()
                    .duration(400)
                    .attr('fill', circle_color["Recovered"])
                    .attr('stroke', "none")
                    .attr("stroke-width", "none")
                    .attr('height', yScale.bandwidth())
                    .attr("width", xScale(d.Recovered));
             });

        g.selectAll(".bar")
            .transition()
            .duration(800)
            .attr("width", function(d){ return xScale(d.Recovered); })
            .attr("y", function(d) { return yScale(d.State); })
            .delay(function(d,i){return(i*20)});
      }
      else if(type=="Deaths"){
        d3.select("#title").text("Deaths in India");

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
        
        // Legend
        svg.append('text')
          .attr('x', barplot_width + 285)
          .attr('y', barplot_height/2)
          .attr('fill', 'white')
          .text('Legend');

        var legend = svg.append('g')
          .attr('id', 'legend');
        var keys = Object.keys(opacities);
        // Adding rects for legend, and mouseover & mouseout events
        legend.selectAll(".legend")
          .data(d3.range(0, 9, 1)).enter()
            .append('rect')
            .attr("class", "legend")
            .attr('x', width-120)
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
              .attr('x', width - 170)
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
             .attr("height", yScale.bandwidth())
             .on('mouseover', function(d){
              d3.select(this)
                .append('title')
                .html('Deaths: ' + d.Deaths);

              d3.select(this)
                  .transition()
                  .duration(400)
                  .attr('fill', "blue")
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale(d.Deaths) + 10)
                  .attr('height', yScale.bandwidth() + 10);

             })
             .on('mouseout', function(d){
                d3.select(this).select('title').remove();
                d3.select(this)
                    .transition()
                    .duration(400)
                    .attr('fill', circle_color["Deaths"])
                    .attr('stroke', "none")
                    .attr("stroke-width", "none")
                    .attr('height', yScale.bandwidth())
                    .attr("width", xScale(d.Deaths));
             });

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

    g.append('text')
      .attr('x', 2 * barplot_width + 100)
      .attr('y', 20)
      .attr('fill', 'white')
      .text('Hover over State or Bars to see details');

    g.append('text')
      .attr('x', 2 * barplot_width + 50)
      .attr('y', 40)
      .attr('fill', 'white')
      .text('Hover over Legend to see States having cases in that range');

    // See India COVID Cases
      var radio_buttons = svg.append("g")
          .attr("id", "case1")
          .attr("transform", "translate(" + 10 + "," + 10 + ")")
          .attr("fill", "#3b3b3b")
          .attr("stroke", "#ffffff")
          .attr("fill-opacity", "1")
          .attr("stroke-opacity", "0.3")
          .on("mouseover", function(d){
            d3.select(this).attr("fill-opacity", "0.5");
            d3.select(this).style("cursor", "pointer");
            d3.select(this).select("circle").attr("fill", "red");
          })
          .on("mouseout", function(d){
            d3.select(this).attr("fill-opacity", "1");
            d3.select(this).select("circle").attr("fill", "white");
          })
          .on("mousedown", function(d){
            d3.select(this).attr("fill", "red");
            d3.selectAll(".circle").remove();
            drawStatePlot(response, titles["India"]);
          })
          .on("mouseup", function(d){
            d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
          });
      radio_buttons.append("path")
          .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
          .attr("cx", 20)
          .attr("cy", 18)
          .attr("fill", "white")
          .style("opacity", "0.7")
          .style("stroke", "#420D09")
          .style("stroke-width" , "2px")
          .attr("r", 10);
      radio_buttons.append("text")
          .attr("x", 50)
          .attr("y", 22)
          .attr("fill", "white")
          .attr("style", "font-size:11px;")
          .text("Cases By State");

    // See Population Wise Cases
    var radio_buttons = svg.append("g")
          .attr("id", "case2")
          .attr("transform", "translate(" + 210 + "," + 10 + ")")
          .attr("fill", "#3b3b3b")
          .attr("stroke", "#ffffff")
          .attr("fill-opacity", "1")
          .attr("stroke-opacity", "0.3")
          .on("mouseover", function(d){
            d3.select(this).attr("fill-opacity", "0.5");
            d3.select(this).style("cursor", "pointer");
            d3.select(this).select("circle").attr("fill", "red");
          })
          .on("mouseout", function(d){
            d3.select(this).attr("fill-opacity", "1");
            d3.select(this).select("circle").attr("fill", "white");
          })
          .on("mousedown", function(d){
            d3.select(this).attr("fill", "red");
            drawStatePlot(response, titles["India_Pop"]);
          })
          .on("mouseup", function(d){
            d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
          });
      radio_buttons.append("path")
          .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
          .attr("cx", 20)
          .attr("cy", 18)
          .attr("fill", "white")
          .style("opacity", "0.7")
          .style("stroke", "#420D09")
          .style("stroke-width" , "2px")
          .attr("r", 10);
      radio_buttons.append("text")
          .attr("x", 50)
          .attr("y", 22)
          .attr("fill", "white")
          .attr("style", "font-size:12px;")
          .text("Cases Per Million");


    }
    draw('Confirmed');
  }
  else if(title.includes('USA Population')){

    d3.select("#title").text("Confirmed Cases per Million");

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
        .attr("id", function(d) { return 'i' + response.pop_dict[d.properties.name];})
        .style("stroke", "black")
        .style("stroke-width", "1.2")
        .style("opacity", function(d){
          var value = ~~response.data[response.pop_dict[d.properties.name]]['Population'];
          if(value>=10000){
            opacities[1]['States'].push('i' + response.pop_dict[d.properties.name]);
            return "1";
          }
          else if(value>=7000 & value<10000){
            opacities[0.85]['States'].push('i' + response.pop_dict[d.properties.name]);
            return "0.85";
          }
          else if(value>=5000 & value<7000){
            opacities[0.75]['States'].push('i' + response.pop_dict[d.properties.name]);
            return "0.75";
          }
          else if(value>=3000 & value<5000){
            opacities[0.65]['States'].push('i' + response.pop_dict[d.properties.name]);
            return "0.65";
          }
          else if(value>=2000 & value<3000){
            opacities[0.55]['States'].push('i' + response.pop_dict[d.properties.name]);
            return "0.55";
          }
          else if(value>=1500 & value<2000){
            opacities[0.45]['States'].push('i' + response.pop_dict[d.properties.name]);
            return "0.45";
          }
          else if(value>=1000 & value<1500){
            opacities[0.35]['States'].push('i' + response.pop_dict[d.properties.name]);
            return "0.35";
          }
          else if(value>=500 & value<1000){
            opacities[0.25]['States'].push('i' + response.pop_dict[d.properties.name]);
            return "0.25";
          }
          else if(value<500){
            opacities[0.15]['States'].push('i' + response.pop_dict[d.properties.name]);
            return "0.15";
          }
        })
        .attr("fill", states_color )
        .on("mouseover", function(d) {
            div.transition()    
                .duration(200)    
                .style("opacity", .7);    
            div.html(d.properties.name + "<br/>" + "<br/>" +"Confirmed Cases/M: " + ~~response.data[response.pop_dict[d.properties.name]]['Population'] + "<br/>" + "Population: " + ~~(response.data[response.pop_dict[d.properties.name]]['cases'] * 1000000 / response.data[response.pop_dict[d.properties.name]]['Population']))  
                .style("left", (d3.event.pageX + 15) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");

            d3.select("#i" + response.pop_dict[d.properties.name])
                  .transition()
                  .duration(400)
                  .attr('fill', "blue")
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale(response.data[response.pop_dict[d.properties.name]]['Population']) + 10)
                  .attr('height', yScale.bandwidth() + 10);
          })
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0);
            d3.select("#i" + response.pop_dict[d.properties.name])
                  .transition()
                  .duration(400)
                  .attr('fill', states_color)
                  .attr('stroke', "none")
                  .attr("stroke-width", "none")
                  .attr('height', yScale.bandwidth())
                  .attr("width", xScale(response.data[response.pop_dict[d.properties.name]]['Population'])); 
        });
    // Legend
    svg.append('text')
      .attr('x', barplot_width + 285)
      .attr('y', barplot_height/2)
      .attr('fill', 'white')
      .text('Legend');

    var legend = svg.append('g')
        .attr('id', 'legend');
    var keys = Object.keys(opacities);

    // Adding rects for legend, and mouseover & mouseout events
    legend.selectAll(".legend")
      .data(d3.range(0, 9, 1)).enter()
        .append('rect')
        .attr("class", "legend")
        .attr('x', width-120)
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
          .attr('x', width - 170)
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
           .attr("id", function(d) { return 'i' + response.pop_dict[d.state];})
           .attr("transform", "translate(" + translate + ",0)")
           .attr("fill", states_color)
           .attr("width", function(d){ return xScale(d3.min(pop)); })
           .attr("y", function(d){ return yScale(d.state); })
           .attr("height", yScale.bandwidth())
           .on("mouseover", function(d){
            d3.select(this)
                .append('title')
                .html('Cases per Million: ' + ~~d.Population);

            d3.select(this)
                .transition()
                .duration(400)
                .attr('fill', "blue")
                // .attr('fill-opacity', '0.8')
                .attr('stroke', "white")
                .attr("stroke-width", "2px")
                .attr("width", xScale(d.Population) + 10)
                .attr('height', yScale.bandwidth() + 10);

           })
           .on('mouseout', function(d){
              d3.select(this).select('title').remove();
              d3.select(this)
                  .transition()
                  .duration(400)
                  .attr('fill', states_color)
                  // .attr('fill-opacity', '1')
                  .attr('stroke', "none")
                  .attr("stroke-width", "none")
                  .attr('height', yScale.bandwidth())
                  .attr("width", xScale(d.Population));
           });

      g.selectAll(".bar")
          .transition()
          .duration(800)
          .attr("width", function(d){ return xScale(d.Population); })
          .attr("y", function(d) { return yScale(d.state); })
          .delay(function(d,i){return(i*20)});

      g.append('text')
        .attr('x', 2 * barplot_width + 100)
        .attr('y', 20)
        .attr('fill', 'white')
        .text('Hover over State or Bars to see details');

      g.append('text')
        .attr('x', 2 * barplot_width + 50)
        .attr('y', 40)
        .attr('fill', 'white')
        .text('Hover over Legend to see States having cases in that range');

      // See USA COVID Cases
      var radio_buttons = svg.append("g")
          .attr("id", "case1")
          .attr("transform", "translate(" + 10 + "," + 10 + ")")
          .attr("fill", "#3b3b3b")
          .attr("stroke", "#ffffff")
          .attr("fill-opacity", "1")
          .attr("stroke-opacity", "0.3")
          .on("mouseover", function(d){
            d3.select(this).attr("fill-opacity", "0.5");
            d3.select(this).style("cursor", "pointer");
            d3.select(this).select("circle").attr("fill", "red");
          })
          .on("mouseout", function(d){
            d3.select(this).attr("fill-opacity", "1");
            d3.select(this).select("circle").attr("fill", "white");
          })
          .on("mousedown", function(d){
            d3.select(this).attr("fill", "red");
            d3.selectAll(".circle").remove();
            drawStatePlot(response, titles["cases_by_state"]);
          })
          .on("mouseup", function(d){
            d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
          });
      radio_buttons.append("path")
          .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
          .attr("cx", 20)
          .attr("cy", 18)
          .attr("fill", "white")
          .style("opacity", "0.7")
          .style("stroke", "#420D09")
          .style("stroke-width" , "2px")
          .attr("r", 10);
      radio_buttons.append("text")
          .attr("x", 50)
          .attr("y", 22)
          .attr("fill", "white")
          .attr("style", "font-size:11px;")
          .text("Cases By State");

    // See Population Wise Cases
    var radio_buttons = svg.append("g")
          .attr("id", "case2")
          .attr("transform", "translate(" + 210 + "," + 10 + ")")
          .attr("fill", "#3b3b3b")
          .attr("stroke", "#ffffff")
          .attr("fill-opacity", "1")
          .attr("stroke-opacity", "0.3")
          .on("mouseover", function(d){
            d3.select(this).attr("fill-opacity", "0.5");
            d3.select(this).style("cursor", "pointer");
            d3.select(this).select("circle").attr("fill", "red");
          })
          .on("mouseout", function(d){
            d3.select(this).attr("fill-opacity", "1");
            d3.select(this).select("circle").attr("fill", "white");
          })
          .on("mousedown", function(d){
            d3.select(this).attr("fill", "red");
            drawStatePlot(response, titles["USA_Pop"]);
          })
          .on("mouseup", function(d){
            d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
          });
      radio_buttons.append("path")
          .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
          .attr("cx", 20)
          .attr("cy", 18)
          .attr("fill", "white")
          .style("opacity", "0.7")
          .style("stroke", "#420D09")
          .style("stroke-width" , "2px")
          .attr("r", 10);
      radio_buttons.append("text")
          .attr("x", 50)
          .attr("y", 22)
          .attr("fill", "white")
          .attr("style", "font-size:12px;")
          .text("Cases Per Million");

    // Cases By County
    var radio_buttons = svg.append("g")
          .attr("id", "case2")
          .attr("transform", "translate(" + 410 + "," + 10 + ")")
          .attr("fill", "#3b3b3b")
          .attr("stroke", "#ffffff")
          .attr("fill-opacity", "1")
          .attr("stroke-opacity", "0.3")
          .on("mouseover", function(d){
            d3.select(this).attr("fill-opacity", "0.5");
            d3.select(this).style("cursor", "pointer");
            d3.select(this).select("circle").attr("fill", "red");
          })
          .on("mouseout", function(d){
            d3.select(this).attr("fill-opacity", "1");
            d3.select(this).select("circle").attr("fill", "white");
          })
          .on("mousedown", function(d){
            d3.select(this).attr("fill", "red");
            drawStatePlot(response, titles["county_specific"]);
          })
          .on("mouseup", function(d){
            d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
          });
      radio_buttons.append("path")
          .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
          .attr("cx", 20)
          .attr("cy", 18)
          .attr("fill", "white")
          .style("opacity", "0.7")
          .style("stroke", "#420D09")
          .style("stroke-width" , "2px")
          .attr("r", 10);
      radio_buttons.append("text")
          .attr("x", 40)
          .attr("y", 22)
          .attr("fill", "white")
          .attr("style", "font-size:12px;")
          .text("Cases By County");
  }
  else if(title.includes('India Population')){
    d3.select("#title").text("Confirmed Cases per Million");
    
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

            d3.select("#i" + response.dict[d.id])
                  .transition()
                  .duration(400)
                  .attr('fill', "blue")
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale(response.data[response.dict[d.id]]['Population']) + 10)
                  .attr('height', yScale.bandwidth() + 10);
        })
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 

            d3.select("#i" + response.dict[d.id])
                  .transition()
                  .duration(400)
                  .attr('fill', states_color)
                  .attr('stroke', "none")
                  .attr("stroke-width", "none")
                  .attr('height', yScale.bandwidth())
                  .attr("width", xScale(response.data[response.dict[d.id]]['Population']));
        });
    // Legend
    svg.append('text')
      .attr('x', barplot_width + 285)
      .attr('y', barplot_height/2)
      .attr('fill', 'white')
      .text('Legend');

    var legend = svg.append('g')
        .attr('id', 'legend');
    var keys = Object.keys(opacities);

    // Adding rects for legend, and mouseover & mouseout events
    legend.selectAll(".legend")
      .data(d3.range(0, 8, 1)).enter()
        .append('rect')
        .attr("class", "legend")
        .attr('x', width-120)
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
          .attr('x', width - 170)
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
           .attr("height", yScale.bandwidth())
           .on('mouseover', function(d){
              d3.select(this)
                .append('title')
                .html('Cases per Million: ' + ~~d.Population);

              d3.select(this)
                  .transition()
                  .duration(400)
                  .attr('fill', "blue")
                  .attr('stroke', "white")
                  .attr("stroke-width", "2px")
                  .attr("width", xScale(d.Population) + 10)
                  .attr('height', yScale.bandwidth() + 10);

           })
           .on('mouseout', function(d){
              d3.select(this).select('title').remove();
              d3.select(this)
                  .transition()
                  .duration(400)
                  .attr('fill', states_color)
                  .attr('stroke', "none")
                  .attr("stroke-width", "none")
                  .attr('height', yScale.bandwidth())
                  .attr("width", xScale(d.Population));
           });

      g.selectAll(".bar")
          .transition()
          .duration(800)
          .attr("width", function(d){ return xScale(d.Population); })
          .attr("y", function(d) { return yScale(d.State); })
          .delay(function(d,i){return(i*20)});

      g.append('text')
        .attr('x', 2 * barplot_width + 100)
        .attr('y', 20)
        .attr('fill', 'white')
        .text('Hover over State or Bars to see details');

      g.append('text')
        .attr('x', 2 * barplot_width + 50)
        .attr('y', 40)
        .attr('fill', 'white')
        .text('Hover over Legend to see States having cases in that range');

          // See India COVID Cases
      var radio_buttons = svg.append("g")
          .attr("id", "case1")
          .attr("transform", "translate(" + 10 + "," + 10 + ")")
          .attr("fill", "#3b3b3b")
          .attr("stroke", "#ffffff")
          .attr("fill-opacity", "1")
          .attr("stroke-opacity", "0.3")
          .on("mouseover", function(d){
            d3.select(this).attr("fill-opacity", "0.5");
            d3.select(this).style("cursor", "pointer");
            d3.select(this).select("circle").attr("fill", "red");
          })
          .on("mouseout", function(d){
            d3.select(this).attr("fill-opacity", "1");
            d3.select(this).select("circle").attr("fill", "white");
          })
          .on("mousedown", function(d){
            d3.select(this).attr("fill", "red");
            d3.selectAll(".circle").remove();
            drawStatePlot(response, titles["India"]);
          })
          .on("mouseup", function(d){
            d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
          });
      radio_buttons.append("path")
          .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
          .attr("cx", 20)
          .attr("cy", 18)
          .attr("fill", "white")
          .style("opacity", "0.7")
          .style("stroke", "#420D09")
          .style("stroke-width" , "2px")
          .attr("r", 10);
      radio_buttons.append("text")
          .attr("x", 50)
          .attr("y", 22)
          .attr("fill", "white")
          .attr("style", "font-size:11px;")
          .text("Cases By State");

    // See Population Wise Cases
    var radio_buttons = svg.append("g")
          .attr("id", "case2")
          .attr("transform", "translate(" + 210 + "," + 10 + ")")
          .attr("fill", "#3b3b3b")
          .attr("stroke", "#ffffff")
          .attr("fill-opacity", "1")
          .attr("stroke-opacity", "0.3")
          .on("mouseover", function(d){
            d3.select(this).attr("fill-opacity", "0.5");
            d3.select(this).style("cursor", "pointer");
            d3.select(this).select("circle").attr("fill", "red");
          })
          .on("mouseout", function(d){
            d3.select(this).attr("fill-opacity", "1");
            d3.select(this).select("circle").attr("fill", "white");
          })
          .on("mousedown", function(d){
            d3.select(this).attr("fill", "red");
            drawStatePlot(response, titles["India_Pop"]);
          })
          .on("mouseup", function(d){
            d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
          });
      radio_buttons.append("path")
          .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
          .attr("cx", 20)
          .attr("cy", 18)
          .attr("fill", "white")
          .style("opacity", "0.7")
          .style("stroke", "#420D09")
          .style("stroke-width" , "2px")
          .attr("r", 10);
      radio_buttons.append("text")
          .attr("x", 50)
          .attr("y", 22)
          .attr("fill", "white")
          .attr("style", "font-size:12px;")
          .text("Cases Per Million");
  }
  else if(title.includes("County Level Visualization")){
    d3.select("#graph_plot").selectAll("svg").remove();// remove svg object if it exists

    var div = d3.select(".tooltip").style("opacity", 0);

    const margin = {top: 100, right: 50, bottom: 100, left: 50};
    var width = 860;
    var height = 600;

    var active = d3.select(null);

    // add a new svg object inside the graph_plot division
    var svg = d3.select("#graph_plot")
              .append("svg")
              .attr("width", width)
              .attr("height", height);

    // creating a grey rectangle for beauty
    svg.append("rect")
        .attr("width", width)
        .attr("height", height + margin.top + margin.bottom)
        .attr("fill", "#112222");
        // .on('click', clicked);

    var path_button_width = width - 200;
    var path_button_height = height - 220;

    // giving a heading for understandablity
    svg.append("text")
         .attr("id", "title")
         .attr("transform", "translate(75,30)")
         .attr("x", width/2 - 50)
         .attr("y", margin.top/2) // x, y coordinate
         .attr("text-anchor", "middle")  
         .attr("font-size", "24px") 
         .attr("fill", "white")
         .attr("text-decoration", "underline") // underline
         .text(title);

    var bar_svg = d3.select("#graph_plot")
                    .append("svg")
                      .attr("id", "bar_svg")
                      .attr("transform", "translate(" + 0 + "," + "0)")
                      .attr("width", width - 225)
                      .attr("height", height);

    var plot_width = width - margin.left - 200;
    var plot_height = height - 30;
    // var translate = width - margin.left + 65;
    var translate = 80;

    var bar_g = bar_svg.append("g").attr("id", "barplot");

    bar_g.append('rect')
      .attr("class", "barRect")
      .attr('transform', 'translate(' + translate + ',0)')
      .attr('height', plot_height)
      .attr('width', plot_width)
      .attr("fill", "#112222")
      .attr("opacity", .9);

    //plot

    var projection = d3.geoAlbersUsa()
                      .translate([width /2 , height / 2])
                      .scale([1000]);

    var path = d3.geoPath()
        .projection(projection);

    var g = svg.append("g")
        .attr('class', 'center-container center-items us-state')
        // .attr('transform', 'translate('+margin.left+','+margin.top+')')
        // .attr('width', width + margin.left + margin.right)
        .attr('width', width - 200)
        .attr('height', height + margin.top + margin.bottom)

    var color = "#e1e1dd";
    // var color = "#4d4b50";

    var coordinates = {};
    var coords = [];

    var circle_color = {"cases" : "yellow", "deaths" : "#FF2400"};

    // See USA COVID Cases
    var radio_buttons = svg.append("g")
        .attr("id", "case1")
        .attr("transform", "translate(" + 10 + "," + 10 + ")")
        .attr("fill", "#3b3b3b")
        .attr("stroke", "#ffffff")
        .attr("fill-opacity", "1")
        .attr("stroke-opacity", "0.3")
        .on("mouseover", function(d){
          d3.select(this).attr("fill-opacity", "0.5");
          d3.select(this).style("cursor", "pointer");
          d3.select(this).select("circle").attr("fill", "red");
        })
        .on("mouseout", function(d){
          d3.select(this).attr("fill-opacity", "1");
          d3.select(this).select("circle").attr("fill", "white");
        })
        .on("mousedown", function(d){
          d3.select(this).attr("fill", "red");
          d3.selectAll(".circle").remove();
          drawStatePlot(response, titles["cases_by_state"]);
        })
        .on("mouseup", function(d){
          d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
        });
    radio_buttons.append("path")
        .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
    radio_buttons.append("circle")
        .attr("cx", 20)
        .attr("cy", 18)
        .attr("fill", "white")
        .style("opacity", "0.7")
        .style("stroke", "#420D09")
        .style("stroke-width" , "2px")
        .attr("r", 10);
    radio_buttons.append("text")
        .attr("x", 50)
        .attr("y", 22)
        .attr("fill", "white")
        .attr("style", "font-size:11px;")
        .text("Cases By State");

    // See Population Wise Cases
    var radio_buttons = svg.append("g")
          .attr("id", "case2")
          .attr("transform", "translate(" + 210 + "," + 10 + ")")
          .attr("fill", "#3b3b3b")
          .attr("stroke", "#ffffff")
          .attr("fill-opacity", "1")
          .attr("stroke-opacity", "0.3")
          .on("mouseover", function(d){
            d3.select(this).attr("fill-opacity", "0.5");
            d3.select(this).style("cursor", "pointer");
            d3.select(this).select("circle").attr("fill", "red");
          })
          .on("mouseout", function(d){
            d3.select(this).attr("fill-opacity", "1");
            d3.select(this).select("circle").attr("fill", "white");
          })
          .on("mousedown", function(d){
            d3.select(this).attr("fill", "red");
            drawStatePlot(response, titles["USA_Pop"]);
          })
          .on("mouseup", function(d){
            d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
          });
      radio_buttons.append("path")
          .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
          .attr("cx", 20)
          .attr("cy", 18)
          .attr("fill", "white")
          .style("opacity", "0.7")
          .style("stroke", "#420D09")
          .style("stroke-width" , "2px")
          .attr("r", 10);
      radio_buttons.append("text")
          .attr("x", 50)
          .attr("y", 22)
          .attr("fill", "white")
          .attr("style", "font-size:12px;")
          .text("Cases Per Million");

    // Cases By County
    var radio_buttons = svg.append("g")
          .attr("id", "case2")
          .attr("transform", "translate(" + 410 + "," + 10 + ")")
          .attr("fill", "#3b3b3b")
          .attr("stroke", "#ffffff")
          .attr("fill-opacity", "1")
          .attr("stroke-opacity", "0.3")
          .on("mouseover", function(d){
            d3.select(this).attr("fill-opacity", "0.5");
            d3.select(this).style("cursor", "pointer");
            d3.select(this).select("circle").attr("fill", "red");
          })
          .on("mouseout", function(d){
            d3.select(this).attr("fill-opacity", "1");
            d3.select(this).select("circle").attr("fill", "white");
          })
          .on("mousedown", function(d){
            d3.select(this).attr("fill", "red");
            drawStatePlot(response, titles["county_specific"]);
          })
          .on("mouseup", function(d){
            d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
          });
      radio_buttons.append("path")
          .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
      radio_buttons.append("circle")
          .attr("cx", 20)
          .attr("cy", 18)
          .attr("fill", "white")
          .style("opacity", "0.7")
          .style("stroke", "#420D09")
          .style("stroke-width" , "2px")
          .attr("r", 10);
      radio_buttons.append("text")
          .attr("x", 40)
          .attr("y", 22)
          .attr("fill", "white")
          .attr("style", "font-size:12px;")
          .text("Cases By County");


    totalCases = null;
    datewise = [];

    function cases_in_us(){

      for (let [key, value] of Object.entries(response.states_datewise)) {
        cases = 0;
        deaths = 0;

        for (let [state, state_data] of Object.entries(value)) {
          cases += state_data.cases;
          deaths += state_data.deaths;
        }
        datewise.push({'date' : key, 'cases' : cases , 'deaths' : deaths});
      }

      totalCases = datewise[datewise.length - 1];  
    }
    
    cases_in_us();

    g.append("g")
      .attr("id", "counties")
      .selectAll("path")
      .data(topojson.feature(response.usa, response.usa.objects.counties).features)
      .enter().append("path")
        .attr("d", path)
        .attr("class", "county-boundary")
        .attr("stroke", "white")
        .on("click", reset)
        .attr("fill", function(d){
          if( path.centroid(d)!=null )
            coordinates[parseInt(d.id)] = path.centroid(d);
          else{
            if(d.geometry.coordinates[0][0].length>2){
              if(projection(d.geometry.coordinates[0][0][0])!=null)
                coordinates[parseInt(d.id)] = projection(d.geometry.coordinates[0][0][0]);
            }
            else{
              if(projection(d.geometry.coordinates[0][0])!=null)
                coordinates[parseInt(d.id)] = projection(d.geometry.coordinates[0][0]);
            }  
          }
          return color;
        });
        

    g.append("g")
      .attr("id", "states")
      .selectAll("path")
      .data(topojson.feature(response.usa, response.usa.objects.states).features)
      .enter().append("path")
        .attr("class", "state")
        .attr("d", path)
        .style("fill", color)
        .style("stroke", "black")
        .on("mouseover", function(d){
          // console.log(d);
          d3.select(this).style("fill", "red");
          d3.select(this).style("cursor", "pointer");
          div.transition()    
                .duration(200)    
                .style("opacity", .7);    
            div.html(d.properties.name + "<br/>" + "<br/>" +"Positive Cases: " + response.usadata[response.dict[d.properties.name]]['cases'] + "<br/>" + "Deaths: " + response.usadata[response.dict[d.properties.name]]['deaths'])  
                .style("left", (d3.event.pageX + 15) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d){
          d3.select(this).style("fill", color);
          div.transition()
                  .duration(500)    
                  .style("opacity", 0);
        })
        .on("click", clicked);

    g.append("path")
        .datum(topojson.mesh(response.usa, response.usa.objects.states, function(a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", path);

    var type = "cases";
    var color_type = circle_color[type];
    var selectedState = null;

    // Positive Cases
    var radio_buttons = svg.append("g")
        .attr("id", "confirmed_button")
        .attr("transform", "translate(" + path_button_width + "," + path_button_height + ")")
        .attr("fill", "#3b3b3b")
        .attr("stroke", "#ffffff")
        .attr("fill-opacity", "1")
        .attr("stroke-opacity", "0.3")
        .on("mouseover", function(d){
          d3.select(this).attr("fill-opacity", "0.5");
          d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", function(d){
          d3.select(this).attr("fill-opacity", "1");
          type = "cases";
        })
        .on("mousedown", function(d){
          d3.select(this).attr("fill", "red");
          d3.selectAll(".circle").remove();
          type = "cases";
          color_type = circle_color[type];
          // if(selectedState)
          draw(selectedState, type, color_type);
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
        .style("opacity", "0.7")
        .style("stroke", "#420D09")
        .style("stroke-width" , "2px")
        .attr("r", 10);
    radio_buttons.append("text")
        .attr("x", 50)
        .attr("y", 22)
        .attr("fill", "white")
        .attr("style", "font-size:15px;")
        .text("Positive Cases");

    // Death Cases
    var radio_buttons = svg.append("g")
      .attr("id", "deaths_button")
      .attr("transform", "translate(" + path_button_width + "," + (path_button_height + margin.left) + ")")
      .attr("fill", "#3b3b3b")
      .attr("stroke", "#ffffff")
      .attr("fill-opacity", "1")
      .attr("stroke-opacity", "0.3")
      .on("mouseover", function(d){
          d3.select(this).attr("fill-opacity", "0.5");
          d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", function(d){
          d3.select(this).attr("fill-opacity", "1");
        })
      .on("mousedown", function(d){
        d3.select(this).attr("fill", "red");
        d3.selectAll(".circle").remove();
        type = "deaths";
        color_type = circle_color[type];
        // if(selectedState)
        draw(selectedState, type, color_type);
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
        .attr("style", "font-size:15px;")
        .text("Deaths");

    
    var selected = [];
    var zoomTranslate;

    function clicked(d) {
      if (d3.select('.background').node() === this) return reset();

      if (active.node() === this) return reset();

      active.classed("active", false);
      active = d3.select(this).classed("active", true);

      var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / width, dy / height);
      zoomTranslate = [width / 2 - scale * x, height / 2 - scale * y];

      selectedState = d;

      g.transition()
          .duration(750)
          .attr("transform", "translate(" + zoomTranslate + ")scale(" + scale + ")");
      
      draw(d, type, color_type);
    }

    var xScale;
    var yScale;

    function reset(d) {
      active.classed("active", false);
      active = d3.select(null);

      selectedState = null;
      selected = [];

      d3.select("#barplot").selectAll("*").remove();

      bar_g.append('rect')
        .attr("class", "barRect")
        .attr('transform', 'translate(' + translate + ',0)')
        .attr('height', plot_height)
        .attr('width', plot_width)
        .attr("fill", "#112222")
        .attr("opacity", .9);

      d3.selectAll(".circle").remove();
      // selected.forEach(function(k){
      //   d3.select("#i" + k).remove();
      // });
      g.transition()
          .delay(100)
          .duration(750)
          .attr('transform', 'translate('+0+','+0+')');
          // .attr('transform', 'translate('+margin.left+','+margin.top+')');
      var top5 = Object.assign([], response.usadata);
      bar(selectedState, type);
      pieplot(selectedState, type);

    }

    function draw(d, type, color_type){

      d3.select("#barplot").selectAll("*").remove();

      bar_g.append('rect')
        .attr("class", "barRect")
        .attr('transform', 'translate(' + translate + ',0)')
        .attr('height', plot_height)
        .attr('width', plot_width)
        .attr("fill", "#112222")
        .attr("opacity", .9);

      selected = [];

      if(d!=null){
      for (let [key, value] of Object.entries(coordinates)) {

        if (key in response.counties_data){

          if(response.counties_data[key]['state']==d.properties.name){
            selected.push(key);
            var cases;

            if(type=="cases")
            {
              cases = response.counties_data[key]['cases'];
              cases = Math.pow(cases, 0.25);
            }
            else
            {
              cases = response.counties_data[key]['deaths'];
              cases = Math.pow(cases, 0.3); 
            }
            g.append("circle")
                .attr("id", 'i' + key)
                .attr("class", "circle")
                .attr("cx", value[0])
                .attr("cy", value[1])
                .attr("r", cases)
                .attr("fill", color_type)
                .style("opacity", "0.7")
                .style("stroke", "#420D09")
                .style("stroke-width" , "0.2px")
                .on("mouseover", function(d){
                  d3.select(this).style("fill" , "black")
                    .style("opacity" , "0.7")
                    .style("stroke" , "red");

                  div.transition()    
                        .duration(200)    
                        .style("opacity", .7);

                  if(type=="cases")
                  {
                    div.html(response.counties_data[key]['county'] + "<br/>" + "State: " + response.counties_data[key]['state'] + "<br/>" + "Positive Cases: " + response.counties_data[key]['cases'])
                      .style("left", (d3.event.pageX + 15) + "px")   
                      .style("top", (d3.event.pageY - 28) + "px");
                  }
                  else
                  {
                    div.html(response.counties_data[key]['county'] + "<br/>" + "State: " + response.counties_data[key]['state'] + "<br/>" + "Deaths: " + response.counties_data[key]['deaths'])
                      .style("left", (d3.event.pageX + 15) + "px")   
                      .style("top", (d3.event.pageY - 28) + "px"); 
                  }
                })
                .on("mouseout", function(d){
                  d3.select(this).style("fill" , color_type)
                      .style("opacity" , "0.7")
                      .style("stroke" , "#420D09");

                  div.transition()
                        .duration(500)    
                        .style("opacity", 0);
                });
            }
        }
      }
      }
      // barPlot(selected, type);
      bar(selectedState, type);
      pieplot(selectedState, type);
    }

    function barPlot(selected, type){

      var selectedCounties = [];
      var yvalues = [];
      var counties = [];

      selected.forEach(function(s){
        if(type=="cases")
          yvalues.push(response.counties_data[s]['cases']);
        else
          yvalues.push(response.counties_data[s]['deaths']);

        county = response.counties_data[s];
        county['id'] = s;
        selectedCounties.push(county);
        counties.push(response.counties_data[s]['county']);
      });

      // Top 50 counties to remove clutter of data
      if(yvalues.length>50)
      {
        selectedCounties = [];
        counties = [];

        yvalues.sort(function(a, b){return b-a});
        sortedyvalues = yvalues.slice(0,50);
        min = sortedyvalues[sortedyvalues.length - 1];
        max = sortedyvalues[0];
        yvalues = [];

        i = 0;
        selected.forEach(function(s){
            
          if(type=="cases")
          {
            if(i<50 && response.counties_data[s]['cases'] >= min && response.counties_data[s]['cases'] <= max)
            { 
              i += 1; 
              yvalues.push(response.counties_data[s]['cases']);
              county = response.counties_data[s];
              county['id'] = s;
              selectedCounties.push(county);
              counties.push(response.counties_data[s]['county']); 
            }
          }
          else
          {
            if(i<50 && response.counties_data[s]['deaths'] >= min && response.counties_data[s]['deaths'] <= max)
            {  
              i += 1;
              yvalues.push(response.counties_data[s]['deaths']);
              county = response.counties_data[s];
              county['id'] = s;
              selectedCounties.push(county);
              counties.push(response.counties_data[s]['county']); 
            }
          }
        });

      }

      // console.log(selectedCounties);

      xScale = d3.scaleLinear().domain([d3.min(yvalues) , d3.max(yvalues)]).range([0, plot_width - 100]);
      yScale = d3.scaleBand().domain(counties).range([plot_height, 0]).padding(0.4);

      var yaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + ",0)")
        .call(d3.axisLeft(yScale));

      var xaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + "," + plot_height + ")")
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format(".2s")));

      var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      bar_g.selectAll(".bar")
         .data(selectedCounties)
         .enter().append("rect")
           .attr("id", function(d){ return ('bar' + d.id); })
           .attr("class", "bar")
           .attr("transform", "translate(" + translate + ",0)")
           .attr("width", function(d){return xScale(d3.min(yvalues)); })
           .attr("y", function(d){ return yScale(d.county); })
           .attr("height", yScale.bandwidth())
           .on('mouseover', function(d){
              d3.select('#i' + d.id).style("fill" , "black")
                      .style("opacity" , "0.7")
                      .style("stroke" , "red");
              d3.select(this)
                      .transition()
                      .duration(400)
                      .attr('fill', 'blue')
                      .attr('fill-opacity', '1')
                      .attr('stroke', "white")
                      .attr("stroke-width", "2px")
                      .attr("width", xScale(response.counties_data[d.id][type]) + 10)
                      .attr('height', yScale.bandwidth() + 10);

              // div.transition()    
              //       .duration(200)    
              //       .style("opacity", 1);

              if(type=="cases")
              {
                d3.select(this).append("text")
                  // .attr("class", "below")
                  .attr("x", 100)
                  .attr("y", yScale(d.county))
                  // .attr("text-anchor", "left")
                  .style("fill", "white")
                  .text(d.cases);
                  
              }
              else
              {
                d3.select(this).append("text")
                  .attr("class", "below")
                  .attr("x", 12)
                  .attr("dy", "1.2em")
                  // .attr("text-anchor", "left")
                  .style("fill", "white")
                  .text(d.deaths);
                  
              }
           })
           .on('mouseout', function(d){
              d3.select('#i' + d.id).style("fill" , color_type)
                        .style("opacity" , "0.7")
                        .style("stroke" , "#420D09");
              d3.select(this)
                      .transition()
                      .duration(400)
                      .attr('fill', circle_color[type])
                      .attr('fill-opacity', '1')
                      .attr('stroke', 'none')
                      .attr("stroke-width", 'none')
                      .attr("width", xScale(response.counties_data[d.id][type]))
                      .attr('height', yScale.bandwidth());

           });

      if(type=="cases")
      {
        bar_g.selectAll(".bar")
          .transition()
          .duration(800)
          .attr("fill", circle_color['cases'])
          .attr("width", function(d){ return xScale(d.cases); })
          .attr("y", function(d) { return yScale(d.county); })
          .delay(function(d,i){return(i*20)});
      }
      else{
        bar_g.selectAll(".bar")
          .transition()
          .duration(800)
          .attr("fill", circle_color['deaths'])
          .attr("width", function(d){ return xScale(d.deaths); })
          .attr("y", function(d) { return yScale(d.county); })
          .delay(function(d,i){return(i*20)});
      }
    }

    
    var top5 = Object.assign([], response.usadata);
    var sortedStates = [];
    var colors = {};
    bar(selectedState, type);
    pieplot(selectedState, type);

    function bar(selectedState, type){
      var states = [];
      var yvalues = [];

      if(type=='cases'){

        top5.sort(function(first, second) {
          return second['cases'] - first['cases'];
        });

        if(selectedState==null)
        {
          sortedStates = top5.slice(0, 5);
          sortedStates.forEach(function(s){
            states.push(s.state);
            yvalues.push(s.cases);
          });
        }
        else if(selectedState!=null)
        {
          sortedStates = [];
          i = 0;
          while(sortedStates.length < 5)
          {
            if(top5[i].state!=selectedState.properties.name)
            {
              sortedStates.push(top5[i]);
              states.push(top5[i].state);
              yvalues.push(top5[i].cases);
            }

            i += 1;
          }

          var record = response.usadata[response.dict[selectedState.properties.name]];
          sortedStates.push(record);
          states.push(selectedState.properties.name);
          yvalues.push(record.cases);
        }

      }
      else{
        top5.sort(function(first, second) {
          return second['deaths'] - first['deaths'];
        }); 

        if(selectedState==null)
        {
          sortedStates = top5.slice(0, 5);
          sortedStates.forEach(function(s){
            states.push(s.state);
            yvalues.push(s.deaths);
          });
        }
        else if(selectedState!=null)
        {
          sortedStates = [];
          i = 0;
          while(sortedStates.length < 5)
          {
            if(top5[i].state!=selectedState.properties.name)
            {
              sortedStates.push(top5[i]);
              states.push(top5[i].state);
              yvalues.push(top5[i].deaths);
            }

            i += 1;
          }

          var record = response.usadata[response.dict[selectedState.properties.name]];
          sortedStates.push(record);
          states.push(selectedState.properties.name);
          yvalues.push(record.deaths);
        }
      }

      // console.log(sortedStates);
      // console.log(states);
      // console.log(yvalues);
      
      var color = d3.scaleOrdinal(d3.schemeCategory10);
      
      for(let i=0 ; i<sortedStates.length ; i++)
        colors[sortedStates[i]['state']] = color(i);

      colors['Rest'] = '#9a1f40';
      
      d3.select("#barplot").selectAll("*").remove();

      bar_g.append('rect')
        .attr("class", "barRect")
        .attr('transform', 'translate(' + translate + ',0)')
        .attr('height', plot_height)
        .attr('width', plot_width)
        .attr("fill", "#112222")
        .attr("opacity", .9);


      var barplot_width = plot_width - 100;
      var barplot_height = plot_height/2 - 20;

      var xScale = d3.scaleBand().domain(states).range([0, barplot_width]).padding(0.4);
      var yScale = d3.scaleLinear().domain([d3.min(yvalues)/10 , d3.max(yvalues)]).range([barplot_height, 0]);

      var yaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + ",10)")
        .call(d3.axisLeft(yScale).tickFormat(d3.format(".2s")));

      var xaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + "," + (barplot_height+10) + ")")
        .call(d3.axisBottom(xScale));

      bar_g.append("rect")
            .attr("transform", "translate(" + translate + ",0)")
            .attr("width", barplot_width + 45)
            .attr("height", barplot_height + 10)
            .attr("style", "stroke:white;stroke-width:1px;")
            .attr("fill", "#17223b");

      bar_g.selectAll(".bar")
         .data(sortedStates)
         .enter().append("rect")
           // .attr("id", function(d){ return ('bar' + d.id); })
           .attr("class", "bar")
           .attr("transform", "translate(" + translate + ",10)")
           .attr("x", function(d) { return xScale(d.state); })
           .attr("width", xScale.bandwidth())
           .attr("y", function(d){return yScale(d3.min(yvalues)/10); })
           .attr("height", function(d){return barplot_height - yScale(d3.min(yvalues)/10); })
           .on('mouseover', function(d){
              d3.select(this)
                .attr('stroke', 'black')
                .attr('stroke-width', '3px')
                .attr('fill', 'white')
                .attr('fill-opacity', '0.5');

              if(type=='cases')
              {
                d3.select(this)
                  .append('title')
                  .html('Positive Cases: ' + d.cases);

                d3.select(this)
                    .transition()
                    .duration(400)
                    .attr("height", barplot_height - yScale(d.cases) + 10)
                    .attr('width', xScale.bandwidth() + 10);
              }
              else
              {
                d3.select(this)
                  .append('title')
                  .html('Deaths: ' + d.deaths);

                d3.select(this)
                    .transition()
                    .duration(400)
                    .attr("height", barplot_height - yScale(d.deaths) + 10)
                    .attr('width', xScale.bandwidth() + 10);
              }

           })
           .on('mouseout', function(d){
              d3.select(this).select('title').remove();

              if(type=='cases')
              {
                d3.select(this)
                    .transition()
                    .duration(400)
                    .attr('fill', colors[d.state])
                    .attr('fill-opacity', '1')
                    .attr('stroke', "none")
                    .attr("stroke-width", "none")
                    .attr('height', barplot_height - yScale(d.cases))
                    .attr("width", xScale.bandwidth());
              }
              else
              {
                d3.select(this)
                    .transition()
                    .duration(400)
                    .attr('fill', colors[d.state])
                    .attr('fill-opacity', '1')
                    .attr('stroke', "none")
                    .attr("stroke-width", "none")
                    .attr('height', barplot_height - yScale(d.deaths))
                    .attr("width", xScale.bandwidth());
              }
           });
      
      if(type=="cases")
      {
        bar_g.selectAll(".bar")
          .transition()
          .duration(2000)
          .attr("fill", function(d) { return colors[d.state];})
          .attr("y", function(d) { return yScale(d.cases); })
          .attr("height", function(d){return barplot_height - yScale(d.cases); })
          .delay(function(d,i){return(i*20)});

        bar_g.append('text')
        .attr("transform", "translate(" + translate + ",0)")
        .attr('x', 170)
        .attr('y', 20)
        .attr('fill', 'white')
        .text('Top 5 States - Positive Cases');
      }
      else{
        bar_g.selectAll(".bar")
          .transition()
          .duration(2000)
          .attr("fill", function(d) { return colors[d.state];})
          .attr("y", function(d) { return yScale(d.deaths); })
          .attr("height", function(d){return barplot_height - yScale(d.deaths); })
          .delay(function(d,i){return(i*20)});

      bar_g.append('text')
        .attr("transform", "translate(" + translate + ",0)")
        .attr('x', 170)
        .attr('y', 20)
        .attr('fill', 'white')
        .text('Top 5 States - Deaths');
      }
    }

    function pieplot(selectedState, type){
      
      var states = [];
      var yvalues = [];

      var top5cases = 0;
      var pieData = Object.assign([], sortedStates);
      
      totalCases['state'] = 'Rest'
      var pieTotalCases = Object.assign([], totalCases);
      
      states.push('Rest');

      if(selectedState!=null){
          pieData = [];
          pieData.push(response.usadata[response.dict[selectedState.properties.name]]);

          if(type=='cases'){
            pieTotalCases['cases'] -= pieData[0]['cases'];
            pieData.push(pieTotalCases);
            yvalues.push(pieData[0]['cases']);
            yvalues.push(pieTotalCases['cases']);
            states.push(selectedState.properties.name);
          }
          else{
            pieTotalCases['deaths'] -= pieData[0]['deaths'];
            pieData.push(pieTotalCases); 
            yvalues.push(pieData[0]['deaths']);
            yvalues.push(pieTotalCases['deaths']);
            states.push(selectedState.properties.name);
          }

      }
      else{
        
        if(type=='cases'){

          sortedStates.forEach(function(s){

            top5cases += s.cases;

            states.push(s.state);
            yvalues.push(s.cases);
          });

          pieTotalCases['cases'] -= top5cases
          yvalues.push(pieTotalCases['cases']);
          pieData.push(pieTotalCases);

        }
        else{
          sortedStates.forEach(function(s){

            top5cases += s.deaths;

            states.push(s.state);
            yvalues.push(s.deaths);
          });

          pieTotalCases['deaths'] -= top5cases
          yvalues.push(pieTotalCases['deaths']);
          pieData.push(pieTotalCases);

        }

      }

      var pieplot_width = plot_width - 100;
      var pieplot_height = plot_height/2;

      bar_g.append("rect")
          .attr("transform", "translate(" + translate + "," + (pieplot_height+50) + ")")
          .attr("width", pieplot_width + 45)
          .attr("height", pieplot_height - 20)
          .attr("style", "stroke:white;stroke-width:1px;")
          .attr("fill", "#17223b");

      var pie = d3.pie()
          .sort(null)
          .value(function(d){
            if(type=='cases')
              return d.cases;
            else
              return d.deaths;
          });
  

      var radius = Math.min(pieplot_width, pieplot_height)/2;

      // Arc for pie slices
      var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius * 0.6);

      // Outerarc for labels and polylines
      var outerArc = d3.arc()
          .outerRadius(radius * 0.9)
          .innerRadius(radius * 0.9);
      
      var plotArea = bar_g.append('g')
                  .attr("transform", "translate(" + translate + "," + (pieplot_height+50) + ")")

      // Add path for pie slices
      plotArea.selectAll('path')
        .data(pie(pieData))
        .enter()
        .append('path')
        .attr("transform", "translate(" + (pieplot_width/2 + 22) + "," + (pieplot_height/2 - 30) + ")")
        .attr('fill', function(d){ return colors[d.data.state]; })
        .attr('stroke', 'white')
        .attr('d', arc)
        .on('mouseover', function(d){
          d3.select(this)
            .attr('stroke', 'black')
            .attr('stroke-width', '3px')
            .attr('fill', 'white')
            .attr('fill-opacity', '0.5');
          if(type=='cases')
          {
            d3.select(this)
            .append('title')
            .html('Positive Cases: ' + d.data.cases);
          }
          else
          {
            d3.select(this)
            .append('title')
            .html('Confirmed Death Cases: ' + d.data.deaths);
          }
        })
        .on('mouseout', function(d){
          d3.select(this)
            .attr('stroke', 'white')
            .attr('stroke-width', 'none')
            .attr('fill', colors[d.data.state])
            .attr('fill-opacity', '1');
          d3.select(this).select('title').remove();
        });

      // console.log(top5);

      // Add polylines for labelling of slices
      plotArea.selectAll('.polyline')
        .data(pie(pieData))
        .enter().append('polyline')
        .attr('class', '.polyline')
        .attr("transform", "translate(" + (pieplot_width/2 + 22) + "," + (pieplot_height/2 - 30) + ")")
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('opacity', '0.6')
        .attr('stroke-width', '1px')
        .attr('points', function(d) {
            // see label transform function for explanations of these three lines.
            var pos = outerArc.centroid(d);
            pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
            return [arc.centroid(d), outerArc.centroid(d), pos]
        });

      // Add State Labels to pie slices
      plotArea.selectAll('.pieLabel')
        .data(pie(pieData))
        .enter().append('text')
        .attr('class', 'pieLabel')
        .attr('dy', '.35em')
        .attr('fill', 'white')
        .attr('font-size', '10')
        .text(function(d){
          if(type=='cases')
            return d.data.state + ' (' + (d.data.cases/totalCases['cases'] * 100).toFixed(1) + '%)';
          else
            return d.data.state + ' (' +  (d.data.deaths/totalCases['deaths'] * 100).toFixed(1) + '%)';
        })
        .attr('transform', function(d) {
            var pos = outerArc.centroid(d);
            pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1) + (pieplot_width/2 + 22);
            pos[1] += (pieplot_height/2 - 30);
            return 'translate(' + pos + ')';
        })
        .style('text-anchor', function(d) {
            return (midAngle(d)) < Math.PI ? 'start' : 'end';
        });

        function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }

      if(selectedState==null){
        plotArea.append('text')
          .attr("transform", "translate(" + translate + ",0)")
          .attr('x', 130)
          .attr('y', 20)
          .attr('fill', 'white')
          .text('Top 5 States VS Rest');
      }
      else{
        plotArea.append('text')
          .attr("transform", "translate(" + translate + ",0)")
          .attr('x', 140)
          .attr('y', 20)
          .attr('fill', 'white')
          .text('Rest VS ' + selectedState.properties.name);
      }
    }
  }
}