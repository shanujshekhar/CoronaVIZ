// keep a dictionary of titles, just need to do this in one of the files
var titles1 = {'USA_Counties': 'State Wise Spread of COVID-19', 'date_specific' : 'County Wise Spread of COVID-19', 'usa_widespread' : 'State Wise Spread of COVID-19'};

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
      console.log(result);
      drawCountiesPlot(result, titles1[id])
    },
    error: function(result) {
    $("#error").html(result);
    }
  });
}

function drawCountiesPlot(response, title) {

  d3.select("#graph_plot").selectAll("svg").remove();// remove svg object if it exists

  // response = response.data;
  // console.log(response);
  // Define the div for the tooltip
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

  // See Date Specific Cases Button
  var radio_buttons = svg.append("g")
        .attr("id", "case2")
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
          drawCountiesPlot(response, titles1["date_specific"]);
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
        .text("County Cases");

  // See State Cases Button
  var radio_buttons = svg.append("g")
        .attr("id", "case3")
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
          drawCountiesPlot(response, titles1["usa_widespread"]);
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
        .text("State Cases");


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

  if(title=="State Wise Spread of COVID-19"){
    g.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(response.usa, response.usa.objects.states).features)
        .enter().append("path")
          .attr("class", "state")
          .attr("d", path)
          .style("fill", function(d, i){
            if( !isNaN(path.centroid(d)[0]) )
                coordinates[d.properties.name] = path.centroid(d);
            return color; })
          .style("stroke", "black");
    // g.append("g")
    //   .attr("class", "counties")
    //   .selectAll("path")
    //   .data(topojson.feature(response.usa, response.usa.objects.counties).features)
    //   .enter().append("path")
    //     .attr("d", path)
    //     .style("fill", function(d, i){
    //       if( path.centroid(d)!=null )
    //           coordinates[parseInt(d.id)] = path.centroid(d);
    //         else{
    //           if(d.geometry.coordinates[0][0].length>2){
    //             if(projection(d.geometry.coordinates[0][0][0])!=null)
    //               coordinates[parseInt(d.id)] = projection(d.geometry.coordinates[0][0][0]);
    //           }
    //           else{
    //             if(projection(d.geometry.coordinates[0][0])!=null)
    //               coordinates[parseInt(d.id)] = projection(d.geometry.coordinates[0][0]);
    //           }  
    //         }
    //       return color;
    //     });

    var radio_buttons = g.append("g")
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
        })
        .on("mousedown", function(d){
          d3.select(this).attr("fill", "red");
          d3.selectAll(".circle").remove();
          // draw("cases", circle_color["cases"]);
          type = "cases";
          color_type = circle_color[type];
          if(selectedDate)
            draw(type, color_type, response.states_datewise[formatForKey(selectedDate)]);
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



    var radio_buttons = g.append("g")
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
        // draw("deaths", circle_color["deaths"]);
        type = "deaths";
        color_type = circle_color[type];
        if(selectedDate)
            draw(type, color_type, response.states_datewise[formatForKey(selectedDate)]);
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
    

    var type = "cases";
    var color_type = circle_color[type];
    var selectedDate = null;


    var formatDate = d3.timeFormat("%d-%b");
    var formatForKey = d3.timeFormat("%Y-%m-%d");

    var dates = Object.keys(response.states_datewise);
    dates = dates.map(function(x) { return new Date(x); })

    var latest = new Date(Math.max.apply(null,dates));
    var earliest = new Date(Math.min.apply(null,dates));

    var startDate = earliest,
        endDate = latest;

    var currentValue = 0
    var targetValue = width - 100;
    
    var x = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, targetValue])
        .clamp(true);

    var slider = svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + (margin.left-20) + "," + (height-50) + ")");

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
            .on("start drag", function() {  
              currentValue = d3.event.x;
              update(x.invert(currentValue)); 
            }));

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
      .selectAll("text")
        .data(x.ticks(25))
        .enter()
        .append("text")
        .attr("x", x)
        .attr("y", 10)
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .text(function(d) { return formatDate(d); });

    var label = slider.append("text")  
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("fill", "blue")
        .text(formatDate(startDate))
        .attr("transform", "translate(0," + (-25) + ")")

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    var radio_buttons = g.append("g")
      .attr("id", "play_button")
      .attr("transform", "translate(" + (100) + "," + (path_button_height + margin.left + 70) + ")")
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
          var button = d3.select(this);
          var text = d3.select(this).select('text').text();

          if (text == "Pause") {
            moving = false;
            clearInterval(timer);
            d3.select(this).select('text').attr("x", 25).text("Play");
            draw(type, color_type, response.states_datewise[formatForKey(selectedDate)]);
          } else {
            moving = true;
            timer = setInterval(step, 100);
            d3.select(this).select('text').attr("x", 15).text("Pause");
          }
        })
      .on("mouseup", function(d){
        d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
      });
    radio_buttons.append("path")
        .attr("id", "cases_button")
        .attr("d", "M 17 0 L 70 0 a 17 17 0 0 1 17 17 L 87 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
    radio_buttons.append("text")
        .attr("x", 25)
        .attr("y", 22)
        .attr("fill", "white")
        .attr("style", "font-size:20px;")
        .text("Play");


    function step() {
      update(x.invert(currentValue));
      currentValue = currentValue + (targetValue/151);
      if (currentValue > targetValue) {
        moving = false;
        currentValue = 0;
        clearInterval(timer);
        d3.select("#play_button").select('text').attr("x", 25).text("Play");
      }
    }

    function update(h) {
      d3.selectAll(".circle").remove();

      d3.select("#barplot").selectAll("*").remove();

      bar_g.append('rect')
        .attr("class", "barRect")
        .attr('transform', 'translate(' + translate + ',0)')
        .attr('height', plot_height)
        .attr('width', plot_width)
        .attr("fill", "#112222")
        .attr("opacity", .9);

      handle.attr("cx", x(h));
      label
        .attr("x", x(h))
        .text(formatDate(h));
      
      selectedDate = h;
      draw(type, color_type, response.states_datewise[formatForKey(h)]);
      linePlot(selectedDate);
    }

    function draw(type, color_type, states){
      if(states!=null){

        for (let [key, value] of Object.entries(states)) {
          if(key in coordinates){
          var cases;
          if(type=="cases")
          {
            cases = value['cases'];
            cases = Math.pow(cases, 0.3);
          }
          else
          {
            cases = value['deaths'];
            cases = Math.pow(cases, 0.4);
          }

          
          g.append("circle")
              .attr("id", 'i' + key)
              .attr("class", "circle")
              .attr("cx", coordinates[key][0])
              .attr("cy", coordinates[key][1])
              .attr("r", cases)
              .attr("fill", color_type)
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
                if(type=="cases")
                {
                  div.html("State: " + key + "<br/>" + "Positive Cases: " + value['cases'])
                    .style("left", (d3.event.pageX + 15) + "px")   
                    .style("top", (d3.event.pageY - 28) + "px");
                }
                else{
                  div.html("State: " + key + "<br/>" + "Deaths: " + value['deaths'])
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

    var parseTime = d3.timeParse("%Y-%m-%d");
    var xFormat = "%d-%b";

    linePlot(latest);

    function linePlot(latestDate){
      var line_plot_width = plot_width - 100;
      var line_plot_height = plot_height/2;

      // Line Plot for confirmed cases
      // Add X axis --> it is a date format
      var xScale_c = d3.scaleTime().domain([earliest, latestDate]).range([0, line_plot_width]);

      // Add Y axis for confirmed cases
      var yScale_c = d3.scaleLinear().domain([d3.min(datewise, function(d) { return d.cases; }), d3.max(datewise, function(d) { return d.cases; })]).range([ line_plot_height - 20, 0 ]);

      bar_g.append("rect")
            .attr("transform", "translate(" + translate + ",0)")
            .attr("width", line_plot_width + 45)
            .attr("height", line_plot_height + 10)
            .attr("style", "stroke:white;stroke-width:1px;")
            .attr("fill", "#17223b");


      var yaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + ",10)")
        .call(d3.axisLeft(yScale_c));

      var xaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + "," + (line_plot_height+10) + ")")
        .call(d3.axisBottom(xScale_c).tickFormat(d3.timeFormat(xFormat)));
      
      // Add the line
      var line = d3.line()
          .x(function(d) { return xScale_c(parseTime(d.date)); })
          .y(function(d) { return yScale_c(d.cases); })

      var cases_line = bar_g.append("path")
        .datum(datewise)
        .attr("fill", "none")
        .attr("stroke", circle_color['cases'])
        .attr("stroke-width", 1.5)
        .attr("transform", "translate(" + translate + ",10)")
        .attr("d", line);

      var totalLength = cases_line.node().getTotalLength();

      cases_line
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
      .transition() // Call Transition Method
        .duration(10) // Set Duration timing (ms)
        .ease(d3.easeLinear) // Set Easing option
        .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition

      // Add the dots
      bar_g.selectAll(".dot2")
        .data(datewise)
        .enter().append("circle") 
         .attr("class", "dot2")
         .attr("transform", "translate(" + translate + ",10)")
         .attr("fill", "black")
         .attr("style", "stroke:black;stroke-width:0.5px")
         .transition() // Call Transition Method
        .duration(5) // Set Duration timing (ms)
         .attr("cx", function(d) { return xScale_c(parseTime(d.date)); })
         .attr("cy", function(d, i) { return yScale_c(d.cases); })
         .attr("r", 1.5);

      bar_g.append('text')
        .attr("transform", "translate(" + translate + ",0)")
        .attr('fill', 'white')
        .attr('x', 140)
        .attr('y', 25)
        .text('Confirmed COVID19 Cases in USA');

      // Line Plot for Death cases
      // Add X axis --> it is a date format
      var xScale_d = d3.scaleTime().domain([earliest, latestDate]).range([0, line_plot_width]);

      // Add Y axis for Death cases
      var yScale_d = d3.scaleLinear().domain([d3.min(datewise, function(d) { return d.cases; }), d3.max(datewise, function(d) { return d.deaths; })]).range([plot_height - 20, line_plot_height + 80]);

      bar_g.append("rect")
            .attr("transform", "translate(" + translate + "," + (line_plot_height+50) + ")")
            .attr("width", line_plot_width + 45)
            .attr("height", line_plot_height - 50)
            .attr("style", "stroke:white;stroke-width:1px;")
            .attr("fill", "#17223b");


      var yaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + ",10)")
        .call(d3.axisLeft(yScale_d));

      var xaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + "," + plot_height + ")")
        .call(d3.axisBottom(xScale_d).tickFormat(d3.timeFormat(xFormat)));
      
      var line = d3.line()
          .x(function(d) { return xScale_d(parseTime(d.date)); })
          .y(function(d) { return yScale_d(d.deaths); });

      // Add the line
      var death_line = bar_g.append("path")
        .datum(datewise)
        .attr("fill", "none")
        .attr("stroke", circle_color['deaths'])
        .attr("stroke-width", 1.5)
        .attr("transform", "translate(" + translate + ",10)")
        .attr("d", line);

      var totalLength = death_line.node().getTotalLength();

      death_line
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
      .transition() // Call Transition Method
        .duration(10) // Set Duration timing (ms)
        .ease(d3.easeLinear) // Set Easing option
        .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition

      // Add the dots
      bar_g.selectAll(".dot3")
        .data(datewise)
        .enter().append("circle") 
         .attr("class", "dot3")
         .attr("transform", "translate(" + translate + ",10)")
         .attr("fill", "white")
         .attr("style", "stroke:red;stroke-width:0.5px")
         .transition() // Call Transition Method
        .duration(5) // Set Duration timing (ms)
         .attr("cx", function(d) { return xScale_d(parseTime(d.date)); })
         .attr("cy", function(d, i) { return yScale_d(d.deaths); })
         .attr("r", 1.5);

      bar_g.append('text')
        .attr("transform", "translate(" + translate + ",0)")
        .attr('fill', 'white')
        .attr('x', 130)
        .attr('y', 360)
        .text('Deaths due to COVID19 in USA');
    }

    function drawCounties(type, color_type){
        for (let [key, value] of Object.entries(coordinates)) {

          if (key in response.counties_data){
            var cases;
            
            if(type=='cases'){
              cases = response.counties_data[key]['cases'];
              cases = Math.pow(cases, 0.2) ;
            }
            else{
              cases = response.counties_data[key]['deaths'];
              cases = Math.pow(cases, 0.4) ;
            }

            

            svg.append("circle")
                .attr("class", "circle")
                .attr("cx", value[0])
                .attr("cy", value[1])
                // .attr("cx", value[0] + margin.left)
                // .attr("cy", value[1] + margin.top)
                .attr("r", cases)
                .attr("fill", color_type)
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
                  if(type=="cases")
                  {
                    div.html(response.counties_data[key]['county'] + "<br/>" + "State: " + response.counties_data[key]['state'] + "<br/>" + "Positive Cases: " + response.counties_data[key]['cases'])
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
  else if(title=="County Wise Spread of COVID-19"){
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

    var type = "cases";
    var color_type = circle_color[type];
    var selectedDate = null;

    var radio_buttons = g.append("g")
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
          if(selectedDate)
            draw(type, color_type, response.counties_datewise[formatForKey(selectedDate)]);
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

    var radio_buttons = g.append("g")
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
        if(selectedDate)
            draw(type, color_type, response.counties_datewise[formatForKey(selectedDate)]);
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

    // var formatDate = d3.timeFormat("%m/%d");
    var formatDate = d3.timeFormat("%d-%b");
    var formatForKey = d3.timeFormat("%Y-%m-%d");

    var dates = Object.keys(response.counties_datewise);
    dates = dates.map(function(x) { return new Date(x); })

    var latest = new Date(Math.max.apply(null,dates));
    var earliest = new Date(Math.min.apply(null,dates));

    var startDate = earliest,
        endDate = latest;

    var currentValue = 0
    var targetValue = width - 100;
    
    var x = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, targetValue])
        .clamp(true);

    var slider = svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + (margin.left-20) + "," + (height-50) + ")");

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
            .on("start drag", function() {
              currentValue =  d3.event.x;
              update(x.invert(currentValue)); 
            }));

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
      .selectAll("text")
        .data(x.ticks(25))
        .enter()
        .append("text")
        .attr("x", x)
        .attr("y", 10)
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .text(function(d) { return formatDate(d); });

    var label = slider.append("text")  
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("fill", "blue")
        .text(formatDate(startDate))
        .attr("transform", "translate(0," + (-25) + ")")

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    var radio_buttons = g.append("g")
      .attr("id", "play_button")
      .attr("transform", "translate(" + (100) + "," + (path_button_height + margin.left + 70) + ")")
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
          var button = d3.select(this);
          var text = d3.select(this).select('text').text();

          if (text == "Pause") {
            moving = false;
            clearInterval(timer);
            d3.select(this).select('text').attr("x", 25).text("Play");
            draw(type, color_type, response.counties_datewise[formatForKey(selectedDate)]);
          } else {
            moving = true;
            timer = setInterval(step, 110);
            d3.select(this).select('text').attr("x", 15).text("Pause");
          }
        })
      .on("mouseup", function(d){
        d3.select(this).transition().delay(100).attr("fill", "#3b3b3b");
      });
    radio_buttons.append("path")
        .attr("id", "cases_button")
        .attr("d", "M 17 0 L 70 0 a 17 17 0 0 1 17 17 L 87 17 a 17 17 0 0 1 -17 17 L 17 34 a 17 17 0 0 1 -17 -17 L 0 17 a 17 17 0 0 1 17 -17 Z");
    radio_buttons.append("text")
        .attr("x", 25)
        .attr("y", 22)
        .attr("fill", "white")
        .attr("style", "font-size:20px;")
        .text("Play");


    function step() {
      update(x.invert(currentValue));
      currentValue = currentValue + (targetValue/151);
      if (currentValue > targetValue) {
        moving = false;
        currentValue = 0;
        clearInterval(timer);
        d3.select("#play_button").select('text').attr("x", 25).text("Play");
      }
    }

    function update(h) {
      d3.selectAll(".circle").remove();

      d3.select("#barplot").selectAll("*").remove();

      bar_g.append('rect')
        .attr("class", "barRect")
        .attr('transform', 'translate(' + translate + ',0)')
        .attr('height', plot_height)
        .attr('width', plot_width)
        .attr("fill", "#112222")
        .attr("opacity", .9);

      handle.attr("cx", x(h));
      label
        .attr("x", x(h))
        .text(formatDate(h));
      
      selectedDate = h;
      
      draw(type, color_type, response.counties_datewise[formatForKey(h)]);
      linePlot(selectedDate);
    }

    function draw(type, color_type, counties){
      if(counties!=null){

        for (let [key, value] of Object.entries(counties)) {
          if (key in response.counties_data){
            var cases;
            if(type=="cases")
            {
              cases = value['cases'];
              cases = Math.pow(cases, 0.2);
            }
            else
            {
              cases = value['deaths'];
              cases = Math.pow(cases, 0.4);
            }

            
            g.append("circle")
                .attr("id", 'i' + key)
                .attr("class", "circle")
                .attr("cx", coordinates[key][0])
                .attr("cy", coordinates[key][1])
                .attr("r", cases)
                .attr("fill", color_type)
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
                  if(type=="cases")
                  {
                    div.html(value['county'] + "<br/>" + "State: " + value['state'] + "<br/>" + "Positive Cases: " + value['cases'])
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


    var parseTime = d3.timeParse("%Y-%m-%d");
    var xFormat = "%d-%b";

    linePlot(latest);

    function linePlot(latestDate){

      var datewise = [];
      var cases = 0;

      for (let [key, value] of Object.entries(response.counties_datewise)) {
        cases = 0;
        deaths = 0;

        for (let [county, county_data] of Object.entries(value)) {
          cases += county_data.cases;
          deaths += county_data.deaths;
        }
        datewise.push({'date' : key, 'cases' : cases , 'deaths' : deaths});
      }

      var line_plot_width = plot_width - 100;
      var line_plot_height = plot_height/2;

      // Line Plot for confirmed cases
      // Add X axis --> it is a date format
      var xScale_c = d3.scaleTime().domain([earliest, latestDate]).range([0, line_plot_width]);

      // Add Y axis for confirmed cases
      var yScale_c = d3.scaleLinear().domain([d3.min(datewise, function(d) { return d.cases; }), d3.max(datewise, function(d) { return d.cases; })]).range([ line_plot_height - 20, 0 ]);

      bar_g.append("rect")
            .attr("transform", "translate(" + translate + ",0)")
            .attr("width", line_plot_width + 45)
            .attr("height", line_plot_height + 10)
            .attr("style", "stroke:white;stroke-width:1px;")
            .attr("fill", "#17223b");


      var yaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + ",10)")
        .call(d3.axisLeft(yScale_c));

      var xaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + "," + (line_plot_height+10) + ")")
        .call(d3.axisBottom(xScale_c).tickFormat(d3.timeFormat(xFormat)));

      // Add the line
      var line = d3.line()
          .x(function(d) { return xScale_c(parseTime(d.date)); })
          .y(function(d) { return yScale_c(d.cases); })

      var cases_line = bar_g.append("path")
        .datum(datewise)
        .attr("fill", "none")
        .attr("stroke", circle_color['cases'])
        .attr("stroke-width", 1.5)
        .attr("transform", "translate(" + translate + ",10)")
        .attr("d", line);

      var totalLength = cases_line.node().getTotalLength();

      cases_line
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
      .transition() // Call Transition Method
        .duration(10) // Set Duration timing (ms)
        .ease(d3.easeLinear) // Set Easing option
        .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition

      // Add the dots
      bar_g.selectAll(".dot2")
        .data(datewise)
        .enter().append("circle") 
         .attr("class", "dot2")
         .attr("transform", "translate(" + translate + ",10)")
         .attr("fill", "black")
         .attr("style", "stroke:black;stroke-width:0.5px")
         .transition() // Call Transition Method
        .duration(5) // Set Duration timing (ms)
         .attr("cx", function(d) { return xScale_c(parseTime(d.date)); })
         .attr("cy", function(d, i) { return yScale_c(d.cases); })
         .attr("r", 1.5);

      bar_g.append('text')
        .attr("transform", "translate(" + translate + ",0)")
        .attr('fill', 'white')
        .attr('x', 140)
        .attr('y', 25)
        .text('Confirmed COVID19 Cases in USA');

      // Line Plot for Death cases
      // Add X axis --> it is a date format
      var xScale_d = d3.scaleTime().domain([earliest, latestDate]).range([0, line_plot_width]);

      // Add Y axis for Death cases
      var yScale_d = d3.scaleLinear().domain([d3.min(datewise, function(d) { return d.cases; }), d3.max(datewise, function(d) { return d.deaths; })]).range([plot_height - 20, line_plot_height + 80]);

      bar_g.append("rect")
            .attr("transform", "translate(" + translate + "," + (line_plot_height+50) + ")")
            .attr("width", line_plot_width + 45)
            .attr("height", line_plot_height - 50)
            .attr("style", "stroke:white;stroke-width:1px;")
            .attr("fill", "#17223b");


      var yaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + ",10)")
        .call(d3.axisLeft(yScale_d));

      var xaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + "," + plot_height + ")")
        .call(d3.axisBottom(xScale_d).tickFormat(d3.timeFormat(xFormat)));
      
      var line = d3.line()
          .x(function(d) { return xScale_d(parseTime(d.date)); })
          .y(function(d) { return yScale_d(d.deaths); });

      // Add the line
      var death_line = bar_g.append("path")
        .datum(datewise)
        .attr("fill", "none")
        .attr("stroke", circle_color['deaths'])
        .attr("stroke-width", 1.5)
        .attr("transform", "translate(" + translate + ",10)")
        .attr("d", line);

      var totalLength = death_line.node().getTotalLength();

      death_line
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
      .transition() // Call Transition Method
        .duration(10) // Set Duration timing (ms)
        .ease(d3.easeLinear) // Set Easing option
        .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition

      // Add the dots
      bar_g.selectAll(".dot3")
        .data(datewise)
        .enter().append("circle") 
         .attr("class", "dot3")
         .attr("transform", "translate(" + translate + ",10)")
         .attr("fill", "white")
         .attr("style", "stroke:red;stroke-width:0.5px")
         .transition() // Call Transition Method
        .duration(5) // Set Duration timing (ms)
         .attr("cx", function(d) { return xScale_d(parseTime(d.date)); })
         .attr("cy", function(d, i) { return yScale_d(d.deaths); })
         .attr("r", 1.5);

      bar_g.append('text')
        .attr("transform", "translate(" + translate + ",0)")
        .attr('fill', 'white')
        .attr('x', 130)
        .attr('y', 360)
        .text('Deaths due to COVID19 in USA');

    }
  }
}