// keep a dictionary of titles, just need to do this in one of the files
var titles1 = {'USA_Counties': 'USA Counties', 'county_specific' : 'County Specific Cases', 'state_specific_deaths' : 'State Cases Deaths'};

function generateCountiesPlot(id) {
  console.log(titles1[id]);
  $.ajax({
    type: 'GET',
    url: id,
    contentType: 'application/json; charset=utf-8',
    xhrFields: {
      withCredentials: false
    },
    headers: {},
    success: function(result) {
      // console.log(result);
      drawCountiesPlot(result, titles1[id])
    },
    error: function(result) {
    $("#error").html(result);
    }
  });
}

function drawCountiesPlot(response, title) {

  d3.select("#graph_plot").select("svg").remove();// remove svg object if it exists

  d3.select("#county_specific").attr("style", "visibility:visible;position: fixed;left: 100px;top: 130px;border: 2px solid black;");
  d3.select("#state_specific_deaths").attr("style", "visibility:visible;position: fixed;left: 300px;top: 130px;border: 2px solid black;");

  // Define the div for the tooltip
  var div = d3.select(".tooltip").style("opacity", 0);

  const margin = {top: 100, right: 50, bottom: 100, left: 50};
  var width = 960;
  var height = 600;

  var active = d3.select(null);

  // add a new svg object inside the graph_plot division
  var svg = d3.select("#graph_plot")
            .append("svg")
            // .attr('class', 'foo');
            .attr("width", width + margin.right + margin.left)
            .attr("height", height);

  // creating a grey rectangle for beauty
  svg.append("rect")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      // .attr("y", margin.right + 20)
      .attr("fill", "#f2f2f2")
      .on('click', clicked);

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

  var projection = d3.geoAlbersUsa()
                    .translate([width /2 , height / 2])
                    .scale([1000]);

  var path = d3.geoPath()
      .projection(projection);

  // var svg = d3.select("svg")
  //             .attr("width", width)
  //             .attr("height", height);

  var g = svg.append("g")
      .attr('class', 'center-container center-items us-state')
      // .attr('transform', 'translate('+margin.left+','+margin.top+')')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)

  var color = "#e1e1dd";
  // var color = "#4d4b50";

  var coordinates = {};
  var coords = [];

  if(title=="USA Counties"){
    g.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(response.usa, response.usa.objects.states).features)
        .enter().append("path")
          .attr("class", "state")
          .attr("d", path)
          .style("fill", color)
          .style("stroke", "black");

    g.append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(response.usa, response.usa.objects.counties).features)
      .enter().append("path")
        .attr("d", path)
        .style("fill", function(d, i){
          if(d.geometry.coordinates[0][0].length>2){
            if(projection(d.geometry.coordinates[0][0][0])!=null){
              coordinates[parseInt(d.id)] = projection(d.geometry.coordinates[0][0][0]);
            }
          }
          else{
            if(projection(d.geometry.coordinates[0][0])!=null){
              coordinates[parseInt(d.id)] = projection(d.geometry.coordinates[0][0]);
            }
          }
          return color;
        });

    var radio_buttons = g.append("g")
        .attr("id", "confirmed_button")
        .attr("transform", "translate(" + (width-100) + "," + (height-200) + ")")
        .attr("fill", "#3b3b3b")
        .attr("stroke", "#ffffff")
        .attr("fill-opacity", "1")
        .attr("stroke-opacity", "0.3")
        .on("mouseover", function(d){
          d3.select(this).attr("fill-opacity", "0.5");
        })
        .on("mouseout", function(d){
          d3.select(this).attr("fill-opacity", "1");
        })
        .on("mousedown", function(d){
          d3.select(this).attr("fill", "red");
          d3.selectAll(".circle").remove();
          draw("confirmed", "red");
        })
        .on("mouseup", function(d){
          d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
          // d3.select(this).attr("fill", "");
        });
    radio_buttons.append("path")
        .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
    radio_buttons.append("circle")
        .attr("cx", 20)
        .attr("cy", 18)
        .attr("fill", "red")
        .style("opacity", "0.7")
        .style("stroke", "#420D09")
        .style("stroke-width" , "2px")
        .attr("r", 10);
    radio_buttons.append("text")
        .attr("x", 50)
        .attr("y", 22)
        .attr("fill", "white")
        .attr("style", "font-size:20px;")
        .text("Confirmed");



    var radio_buttons = g.append("g")
      .attr("id", "deaths_button")
      .attr("transform", "translate(" + (width-100) + "," + (height-150) + ")")
      .attr("fill", "#3b3b3b")
      .attr("stroke", "#ffffff")
      .attr("fill-opacity", "1")
      .attr("stroke-opacity", "0.3")
      .on("mouseover", function(d){
          d3.select(this).attr("fill-opacity", "0.5");
        })
        .on("mouseout", function(d){
          d3.select(this).attr("fill-opacity", "1");
        })
      .on("mousedown", function(d){
        d3.select(this).attr("fill", "red");
        d3.selectAll(".circle").remove();
        draw("deaths", "blue");
      })
      .on("mouseup", function(d){
        d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
      });
    radio_buttons.append("path")
        .attr("id", "cases_button")
        .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
    radio_buttons.append("circle")
        .attr("cx", 20)
        .attr("cy", 18)
        .attr("fill", "blue")
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
    
  function draw(type, color){
      for (let [key, value] of Object.entries(coordinates)) {

        if (key in response.counties_data){
          var cases;
          
          if(type=='confirmed')
            cases = response.counties_data[key]['cases'];
          else
            cases = response.counties_data[key]['deaths'];

          cases = Math.pow(cases, 0.2) ;

          svg.append("circle")
              .attr("class", "circle")
              .attr("cx", value[0])
              .attr("cy", value[1])
              // .attr("cx", value[0] + margin.left)
              // .attr("cy", value[1] + margin.top)
              .attr("r", cases)
              .attr("fill", color)
              .style("opacity", "0.7")
              .style("stroke", "#420D09")
              .style("stroke-width" , "2px")
              .on("mouseover", function(d){
                d3.select(this).style("fill" , "black")
                  .style("opacity" , "0.7")
                  .style("stroke" , "red")
                  .style("stroke-width" , "2px");

                div.transition()    
                      .duration(200)    
                      .style("opacity", .7);
                if(type=="confirmed")
                {
                  div.html(response.counties_data[key]['county'] + "<br/>" + "State: " + response.counties_data[key]['state'] + "<br/>" + "Confirmed: " + response.counties_data[key]['cases'])
                  .style("left", (d3.event.pageX + 15) + "px")   
                  .style("top", (d3.event.pageY - 28) + "px");
                }
                else{
                  div.html(response.counties_data[key]['county'] + "<br/>" + "State: " + response.counties_data[key]['state'] + "<br/>" + "Deaths: " + response.counties_data[key]['deaths'])
                  .style("left", (d3.event.pageX + 15) + "px")   
                  .style("top", (d3.event.pageY - 28) + "px");
                }
              })
              .on("mouseout", function(d){
                d3.select(this).style("fill" , color)
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
  else if(title=="State Cases Deaths"){
    g.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(response.usa, response.usa.objects.states).features)
        .enter().append("path")
          .attr("class", "state")
          .attr("d", path)
          .style("fill", color)
          .style("stroke", "black");

    g.append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(response.usa, response.usa.objects.counties).features)
      .enter().append("path")
        .attr("d", path)
        .attr("fill", function(d){
            if(d.geometry.coordinates[0][0].length>2){
              if(projection(d.geometry.coordinates[0][0][0])!=null)
                coordinates[parseInt(d.id)] = projection(d.geometry.coordinates[0][0][0]);
            }
            else{
              if(projection(d.geometry.coordinates[0][0])!=null)
                coordinates[parseInt(d.id)] = projection(d.geometry.coordinates[0][0]);
            }
            return color;
          });

    var type = "confirmed";
    var color = "red";
    var seletedDate = null;

    var radio_buttons = g.append("g")
        .attr("id", "confirmed_button")
        .attr("transform", "translate(" + (width-100) + "," + (height-200) + ")")
        .attr("fill", "#3b3b3b")
        .attr("stroke", "#ffffff")
        .attr("fill-opacity", "1")
        .attr("stroke-opacity", "0.3")
        .on("mouseover", function(d){
          d3.select(this).attr("fill-opacity", "0.5");
        })
        .on("mouseout", function(d){
          d3.select(this).attr("fill-opacity", "1");
          type = "confirmed";
        })
        .on("mousedown", function(d){
          d3.select(this).attr("fill", "red");
          d3.selectAll(".circle").remove();
          type = "confirmed";
          color = "red";
          if(seletedDate)
            draw(type, color, response.counties_datewise[formatForKey(seletedDate)]);
        })
        .on("mouseup", function(d){
          d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
          // d3.select(this).attr("fill", "");
        });
    radio_buttons.append("path")
        .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
    radio_buttons.append("circle")
        .attr("cx", 20)
        .attr("cy", 18)
        .attr("fill", "red")
        .style("opacity", "0.7")
        .style("stroke", "#420D09")
        .style("stroke-width" , "2px")
        .attr("r", 10);
    radio_buttons.append("text")
        .attr("x", 50)
        .attr("y", 22)
        .attr("fill", "white")
        .attr("style", "font-size:20px;")
        .text("Confirmed");



    var radio_buttons = g.append("g")
      .attr("id", "deaths_button")
      .attr("transform", "translate(" + (width-100) + "," + (height-150) + ")")
      .attr("fill", "#3b3b3b")
      .attr("stroke", "#ffffff")
      .attr("fill-opacity", "1")
      .attr("stroke-opacity", "0.3")
      .on("mouseover", function(d){
          d3.select(this).attr("fill-opacity", "0.5");
        })
        .on("mouseout", function(d){
          d3.select(this).attr("fill-opacity", "1");
        })
      .on("mousedown", function(d){
        d3.select(this).attr("fill", "red");
        d3.selectAll(".circle").remove();
        type = "deaths";
        color = "blue";
        if(seletedDate)
            draw(type, color, response.counties_datewise[formatForKey(seletedDate)]);
        // draw("deaths", "blue");
      })
      .on("mouseup", function(d){
        d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
      });
    radio_buttons.append("path")
        .attr("id", "cases_button")
        .attr("d", "M 17 0 L 180 0 a 17 17 0 0 1 17 17 L 197 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
    radio_buttons.append("circle")
        .attr("cx", 20)
        .attr("cy", 18)
        .attr("fill", "blue")
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

    // var formatDateIntoYear = d3.timeFormat("%Y");
    // var formatDate = d3.timeFormat("%B %d, %Y");
    var formatDate = d3.timeFormat("%B %d");
    var formatForKey = d3.timeFormat("%Y-%m-%d");

    var dates = Object.keys(response.counties_datewise);
    dates = dates.map(function(x) { return new Date(x); })

    var latest = new Date(Math.max.apply(null,dates));
    var earliest = new Date(Math.min.apply(null,dates));

    var startDate = earliest,
        endDate = latest;
    
    var x = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, width])
        .clamp(true);

    var slider = svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + margin.left + "," + (height-50) + ")");

    slider.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() { slider.interrupt(); })
            .on("start drag", function() { hue(x.invert(d3.event.x)); }));

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
      .selectAll("text")
        .data(x.ticks(25))
        .enter()
        .append("text")
        .attr("x", x)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatDate(d); });

    var label = slider.append("text")  
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text(formatDate(startDate))
        .attr("transform", "translate(0," + (-25) + ")")

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    

    function hue(h) {
      d3.selectAll(".circle").remove();
      handle.attr("cx", x(h));
      label
        .attr("x", x(h))
        .text(formatDate(h));
      seletedDate = h;
      console.log('type: ' + type + 'color: '+ color);
      draw(type, color, response.counties_datewise[formatForKey(h)]);
    }

    function draw(type, color, counties){
      if(counties!=null){

        for (let [key, value] of Object.entries(counties)) {
          if (key in response.counties_data){
            var cases;
            if(type=="confirmed")
            {
              cases = value['cases'];
              cases = Math.pow(cases, 0.2);
            }
            else
            {
              cases = value['deaths'];
              cases = Math.pow(cases, 0.3);
            }

            
            g.append("circle")
                .attr("id", 'i' + key)
                .attr("class", "circle")
                .attr("cx", coordinates[key][0])
                .attr("cy", coordinates[key][1])
                .attr("r", cases)
                .attr("fill", color)
                .style("opacity", "0.7")
                .style("stroke", "#420D09")
                .style("stroke-width" , "2px")
                .on("mouseover", function(d){
                  d3.select(this).style("fill" , "black")
                    .style("opacity" , "0.7")
                    .style("stroke" , "red")
                    .style("stroke-width" , "2px");

                  div.transition()    
                        .duration(200)    
                        .style("opacity", .7);
                  if(type=="confirmed")
                  {
                    div.html(value['county'] + "<br/>" + "State: " + value['state'] + "<br/>" + "Cases: " + value['cases'])
                      .style("left", (d3.event.pageX + 15) + "px")   
                      .style("top", (d3.event.pageY - 28) + "px");
                  }
                  else{
                    div.html(value['county'] + "<br/>" + "State: " + value['state'] + "<br/>" + "Deaths: " + value['deaths'])
                      .style("left", (d3.event.pageX + 15) + "px")   
                      .style("top", (d3.event.pageY - 28) + "px"); 
                  }
                })
                .on("mouseout", function(d){
                  d3.select(this).style("fill" , color)
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
}
else if(title=="County Specific Cases"){

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
          if(d.geometry.coordinates[0][0].length>2){
            if(projection(d.geometry.coordinates[0][0][0])!=null)
              coordinates[parseInt(d.id)] = projection(d.geometry.coordinates[0][0][0]);
          }
          else{
            if(projection(d.geometry.coordinates[0][0])!=null)
              coordinates[parseInt(d.id)] = projection(d.geometry.coordinates[0][0]);
          }
          return color;
        });
        // .on("mouseover", function(d){
        //   // d3.select(this).style("fill" , "red");
        //   // console.log(d.id);
        //   div.transition()    
        //         .duration(200)    
        //         .style("opacity", .7);
        //     if(parseInt(d.id) in response.counties_data){
        //       div.html(d.properties.name + "<br/>" + "State: " + response.counties_data[parseInt(d.id)]['state'] + "<br/>" + "Cases: " + response.counties_data[parseInt(d.id)]['cases'] + "<br/>" + "Deaths: " + response.counties_data[parseInt(d.id)]['deaths'])
        //         .style("left", (d3.event.pageX + 15) + "px")   
        //         .style("top", (d3.event.pageY - 28) + "px");
        //     }
        //     else{
        //       div.html(d.properties.name)
        //         .style("left", (d3.event.pageX + 15) + "px")   
        //         .style("top", (d3.event.pageY - 28) + "px");
        //     }
        // })
        // .on("mouseout", function(d){
        //   // d3.select(this).style("fill", color);
        //   div.transition()
        //         .duration(500)    
        //         .style("opacity", 0);
        // });
        

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
        div.transition()    
              .duration(200)    
              .style("opacity", .7);    
          div.html(d.properties.name + "<br/>" + "<br/>" +"Confirmed: " + response.usadata[response.dict[d.properties.name]]['Confirmed'] + "<br/>" + "Deaths: " + response.usadata[response.dict[d.properties.name]]['Deaths'])  
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


  
  var selected = [];

  function clicked(d) {
    console.log("clicked" + d.properties.name);
    if (d3.select('.background').node() === this) return reset();

    if (active.node() === this) return reset();

    active.classed("active", false);
    active = d3.select(this).classed("active", true);

    var bounds = path.bounds(d),
    dx = bounds[1][0] - bounds[0][0],
    dy = bounds[1][1] - bounds[0][1],
    x = (bounds[0][0] + bounds[1][0]) / 2,
    y = (bounds[0][1] + bounds[1][1]) / 2,
    scale = .9 / Math.max(dx / width, dy / height),
    translate = [width / 2 - scale * x, height / 2 - scale * y];

    g.transition()
        .duration(750)
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    
    for (let [key, value] of Object.entries(coordinates)) {

      if (key in response.counties_data){

        if(response.counties_data[key]['state']==d.properties.name){
          selected.push(key);
          var cases = response.counties_data[key]['cases'];
          cases = Math.pow(cases, 0.15);
          g.append("circle")
              .attr("id", 'i' + key)
              .attr("cx", value[0])
              .attr("cy", value[1])
              .attr("r", cases)
              .attr("fill", "red")
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

                    div.html(response.counties_data[key]['county'] + "<br/>" + "State: " + response.counties_data[key]['state'] + "<br/>" + "Cases: " + response.counties_data[key]['cases'] + "<br/>" + "Deaths: " + response.counties_data[key]['deaths'])
                      .style("left", (d3.event.pageX + 15) + "px")   
                      .style("top", (d3.event.pageY - 28) + "px");
              })
              .on("mouseout", function(d){
                d3.select(this).style("fill" , "red")
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

  function reset(d) {
    active.classed("active", false);
    active = d3.select(null);

    selected.forEach(function(k){
      d3.select("#i" + k).remove();
    });
    g.transition()
        .delay(100)
        .duration(750)
        .attr('transform', 'translate('+0+','+0+')');
        // .attr('transform', 'translate('+margin.left+','+margin.top+')');
  }
}

}