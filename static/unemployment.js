// keep a dictionary of titles, just need to do this in one of the files
var titles_emp = {'unemp': 'Counties Unemployment Cases', 'counties' : 'Counties Unemployment Cases' , 'states' : 'States Unemployment Cases'};

function generateEmpPlot(id) {
  // console.log(titles_emp[id]);
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
      drawPlot(result, titles_emp[id]);
    },
    error: function(result) {
    $("#error").html(result);
    }
  });
}

function drawPlot(response, title) {
d3.select("#graph_plot").selectAll("svg").remove();// remove svg object if it exists

  console.log(response);

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

  // See County Cases Button
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
          drawPlot(response, titles_emp["counties"]);
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
        .text("County Wise Cases");

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
          drawPlot(response, titles_emp["states"]);
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
        .text("State Wise Cases");


  var county_colors = {};
  var county_unemp = {};
  var county_percent = {};

  var state_colors = {};
  var state_unemp = {};
  var state_percent = {};  



  if(title=='States Unemployment Cases'){

    d3.select("#title").text("Unemployment Rate During COVID-19 (State Wise)");

    g.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(response.usa, response.usa.objects.states).features)
        .enter().append("path")
          .attr("class", "state")
          .attr("d", path)
          .attr("id", function(d) { return "i" + parseInt(d.id);})
          .attr("fill", color)
          .attr("stroke", "black")
          .on('mouseover', function(d){
            d3.select(this).attr('fill', 'blue');

            div.transition()    
                .duration(200)    
                .style("opacity", .7);

            div.html(d.properties.name + "<br/>" + "Count: " + state_unemp[parseInt(d.id)] + "<br/>" + "Unemployment Rate: " + state_percent[parseInt(d.id)] + '%')
            .style("left", (d3.event.pageX + 15) + "px")   
            .style("top", (d3.event.pageY - 28) + "px");

          })
          .on('mouseout', function(d){
            d3.select(this).attr('fill', state_colors[parseInt(d.id)]);
            div.transition()
                .duration(500)    
                .style("opacity", 0);
          });

    var formatDate = d3.timeFormat("%d-%b");
    var formatForKey = d3.timeFormat("%Y-%m-%d");
    var parseTime = d3.timeParse("%Y-%m-%d");
    var xFormat = "%d-%b";

    var dates = Object.keys(response.states_datewise);
    var selectedDate = parseTime(dates[0]);

    var currentValue = 0
    var targetValue = width - 100;
    
    var x = d3.scaleTime()
        .domain(d3.extent(dates, function(d){
          return new Date(d);
        }))
        .range([0, targetValue]);

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
        .data(x.ticks(dates.length + 1))
        .enter()
        .append("text")
        .attr("x", x)
        .attr("y", 10)
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .text(function(d, i) { return formatDate(new Date(dates[i])); });

    var label = slider.append("text")  
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("fill", "blue")
        .text(formatDate(parseTime(dates[0])))
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

    draw(type, color_type, response.states_datewise[formatForKey(selectedDate)]);

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

      handle.attr("cx", x(h));
      label
        .attr("x", x(h))
        .text(formatDate(h));
      
      selectedDate = h;
      draw(type, color_type, response.states_datewise[formatForKey(h)]);
    }

    function draw(type, color_type, states){
      if(states!=null)
      {
          var counts = Object.values(states).map(function(d){ return parseFloat(d.percent);});
          var max_val = d3.max(counts);
          var min_val = d3.min(counts);
          
          var colors = d3.scaleLinear()
                        .domain([min_val, max_val])
                        .range(["orange", "purple"]);
          state_colors = {};
          state_unemp = {};
          state_percent = {};

          for (let [key, value] of Object.entries(states)) 
          {
              unemp = parseInt(value['unemp']);
              percent = parseFloat(value['percent']);

              d3.select('#i' + value['fips'])
                .attr('fill', colors(percent));

              state_colors[value['fips']] = colors(percent);
              state_unemp[value['fips']] = unemp;
              state_percent[value['fips']] = percent;
          }
      }
    }

    linePlot();

    function linePlot(){

      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      var unemp_years = response.unemp_years;
      
      var line_plot_width = plot_width - 100;
      var line_plot_height = plot_height/2;

      // Line Plot
      // Add X axis --> it is a date format
      var xScale = d3.scaleBand().domain(months).rangeRound([0, line_plot_width]);
      // Add Y axis
      var yScale = d3.scaleLinear().domain([0, 15]).range([ line_plot_height - 20, 0 ]);

      bar_g.append("rect")
            .attr("transform", "translate(" + translate + ",0)")
            .attr("width", line_plot_width + 45)
            .attr("height", line_plot_height + 10)
            .attr("style", "stroke:white;stroke-width:1px;")
            .attr("fill", "#17223b");


      var yaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + ",10)")
        .call(d3.axisLeft(yScale));

      var xaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + "," + (line_plot_height+10) + ")")
        .call(d3.axisBottom(xScale));
      
      // Add the lines
      var lineGen = d3.line()
                .x( function(d) { return xScale(d.month) + 20; })
                .y( function(d) { return yScale(d.value); });

      var lines_length = [];

      var line_colors = d3.scaleOrdinal(d3.schemeCategory10);
      var year_line_colors = {};

      var i = 0;
      var c, yr;
      for (let [year, line] of Object.entries(unemp_years))
      {
        if(year!='2020')
        { 
          var cases_line = bar_g.append("path")
            .attr("fill", "none")
            .attr("stroke", line_colors(i))
            .attr("stroke-width", 3)
            .attr("transform", "translate(" + translate + ",10)")
            .attr("d", lineGen(line))
            .on('mouseover', function(d){

              c = d3.select(this).attr('stroke');
              yr = year;
              d3.select(this).attr('stroke', 'white');

              d3.select(this)
                .append('title')
                .html('Year: ' + yr);
            })
            .on('mouseout', function(d){
              d3.select(this).attr('stroke', c);
              d3.select(this).select('title').remove();
            });


          year_line_colors[year] = line_colors(i);
          lines_length.push({'line' : cases_line, 'length' : cases_line.node().getTotalLength()});

          i+= 1;
        }
      }

      year_2020 = [{'month' : 'Jan', 'value' : 3.6}, {'month' : 'Feb', 'value' : 3.5}, {'month' : 'Mar', 'value' : 4.4}, {'month' : 'Apr', 'value' : 14.7}];
      
      var cases_line = bar_g.append("path")
          .attr("fill", "none")
          .attr("stroke", circle_color['cases'])
          .attr("stroke-width", 3)
          .attr("transform", "translate(" + translate + ",10)")
          .attr("d", lineGen(year_2020))
          .on('mouseover', function(d){

              c = d3.select(this).attr('stroke');
              yr = '2020';
              d3.select(this).attr('stroke', 'white');

              d3.select(this)
                .append('title')
                .html('Year: ' + yr);
            })
          .on('mouseout', function(d){
              d3.select(this).attr('stroke', c);
              d3.select(this).select('title').remove();
          });
            
      lines_length.push({'line' : cases_line, 'length' : cases_line.node().getTotalLength()});
      
      
      for(let i=0 ; i<lines_length.length ; i++)
      {
        cases_line = lines_length[i]['line'];
        totalLength = lines_length[i]['length'];

        cases_line
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
        .transition() // Call Transition Method
          .duration(2000) // Set Duration timing (ms)
          .ease(d3.easeLinear) // Set Easing option
          .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition
      }

      bar_g.append('text')
        .attr("transform", "translate(" + translate + ",0)")
        .attr('fill', 'white')
        .attr('x', 160)
        .attr('y', 25)
        .text('Unemployment Rate Of Last 10 Years');
    }
  }
  else if(title=="Counties Unemployment Cases"){

    d3.select("#title").text("Unemployment Rate During COVID-19 (County Wise)");

    g.append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(response.usa, response.usa.objects.counties).features)
      .enter().append("path")
        .attr("d", path)
        .attr("id", function(d) { return 'i' + parseInt(d.id);})
        .attr("fill", color)
        .on('mouseover', function(d){
          d3.select(this).attr('fill', 'blue');

          div.transition()    
              .duration(200)    
              .style("opacity", .7);

          div.html(d.properties.name + "<br/>" + "Count: " + county_unemp[parseInt(d.id)] + "<br/>" + "Unemployment Rate: " + county_percent[parseInt(d.id)] + '%')
          .style("left", (d3.event.pageX + 15) + "px")   
          .style("top", (d3.event.pageY - 28) + "px");

        })
        .on('mouseout', function(d){
          d3.select(this).attr('fill', county_colors[parseInt(d.id)]);
          div.transition()
              .duration(500)    
              .style("opacity", 0);
        });

    var type = "cases";
    var color_type = circle_color[type];
    
    var formatDate = d3.timeFormat("%d-%b");
    var formatForKey = d3.timeFormat("%Y-%m-%d");
    var parseTime = d3.timeParse("%Y-%m-%d");
    var xFormat = "%d-%b";


    var dates = Object.keys(response.counties_datewise);
    var selectedDate = parseTime(dates[0]);

    var currentValue = 0
    var targetValue = width - 100;
    
    var x = d3.scaleTime()
        .domain(d3.extent(dates, function(d){
          return new Date(d);
        }))
        .range([0, targetValue]);

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
        .data(x.ticks(dates.length + 1))
        .enter()
        .append("text")
        .attr("x", x)
        .attr("y", 10)
        .attr("fill", "white")
        .attr("text-anchor", "middle")
        .text(function(d, i) { return formatDate(new Date(dates[i])); });

    var label = slider.append("text")  
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("fill", "blue")
        .text(formatDate(parseTime(dates[0])))
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

    draw(type, color_type, response.counties_datewise[formatForKey(selectedDate)]);

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

      handle.attr("cx", x(h));
      label
        .attr("x", x(h))
        .text(formatDate(h));
      
      selectedDate = h;
      draw(type, color_type, response.counties_datewise[formatForKey(h)]);
      // linePlot(selectedDate);
    }
    
    var colors;
    
    function draw(type, color_type, counties)
    {
      if(counties!=null)
      {

        var counts = Object.values(counties).map(function(d){ return parseFloat(d.percent);});
        var max_val = d3.max(counts);
        var min_val = d3.min(counts);
        
        county_colors = {};
        county_unemp = {};
        county_percent = {};

        colors = d3.scaleLinear()
                      .domain([min_val, max_val])
                      .range(["orange", "purple"]);

        for (let [key, value] of Object.entries(counties)) 
        {
            unemp = parseInt(value['unemp']);
            percent = parseFloat(value['percent']);
            key = parseInt(key);
            d3.select('#i' + key)
              .attr('fill', colors(percent));

            county_colors[key] = colors(percent);
            county_unemp[key] = unemp;  
            county_percent[key] = percent;      
        }
      }
    }

    linePlot();

    function linePlot(){

      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      var unemp_years = response.unemp_years;
      
      var line_plot_width = plot_width - 100;
      var line_plot_height = plot_height/2;

      // Line Plot
      // Add X axis --> it is a date format
      var xScale = d3.scaleBand().domain(months).rangeRound([0, line_plot_width]);
      // Add Y axis
      var yScale = d3.scaleLinear().domain([0, 15]).range([ line_plot_height - 20, 0 ]);

      bar_g.append("rect")
            .attr("transform", "translate(" + translate + ",0)")
            .attr("width", line_plot_width + 45)
            .attr("height", line_plot_height + 10)
            .attr("style", "stroke:white;stroke-width:1px;")
            .attr("fill", "#17223b");


      var yaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + ",10)")
        .call(d3.axisLeft(yScale));

      var xaxis = bar_g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + translate + "," + (line_plot_height+10) + ")")
        .call(d3.axisBottom(xScale));
      
      // Add the lines
      var lineGen = d3.line()
                .x( function(d) { return xScale(d.month) + 20; })
                .y( function(d) { return yScale(d.value); });

      var lines_length = [];

      var line_colors = d3.scaleOrdinal(d3.schemeCategory10);
      var year_line_colors = {};

      var i = 0;
      var c, yr;
      for (let [year, line] of Object.entries(unemp_years))
      {
        if(year!='2020')
        { 
          var cases_line = bar_g.append("path")
            .attr("fill", "none")
            .attr("stroke", line_colors(i))
            .attr("stroke-width", 3)
            .attr("transform", "translate(" + translate + ",10)")
            .attr("d", lineGen(line))
            .on('mouseover', function(d){

              c = d3.select(this).attr('stroke');
              yr = year;
              d3.select(this).attr('stroke', 'white');

              d3.select(this)
                .append('title')
                .html('Year: ' + yr);
            })
            .on('mouseout', function(d){
              d3.select(this).attr('stroke', c);
              d3.select(this).select('title').remove();
            });


          year_line_colors[year] = line_colors(i);
          lines_length.push({'line' : cases_line, 'length' : cases_line.node().getTotalLength()});

          i+= 1;
        }
      }

      year_2020 = [{'month' : 'Jan', 'value' : 3.6}, {'month' : 'Feb', 'value' : 3.5}, {'month' : 'Mar', 'value' : 4.4}, {'month' : 'Apr', 'value' : 14.7}];
      
      var cases_line = bar_g.append("path")
          .attr("fill", "none")
          .attr("stroke", circle_color['cases'])
          .attr("stroke-width", 3)
          .attr("transform", "translate(" + translate + ",10)")
          .attr("d", lineGen(year_2020))
          .on('mouseover', function(d){

              c = d3.select(this).attr('stroke');
              yr = '2020';
              d3.select(this).attr('stroke', 'white');

              d3.select(this)
                .append('title')
                .html('Year: ' + yr);
            })
          .on('mouseout', function(d){
              d3.select(this).attr('stroke', c);
              d3.select(this).select('title').remove();
          });
            
      lines_length.push({'line' : cases_line, 'length' : cases_line.node().getTotalLength()});
      
      
      for(let i=0 ; i<lines_length.length ; i++)
      {
        cases_line = lines_length[i]['line'];
        totalLength = lines_length[i]['length'];

        cases_line
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
        .transition() // Call Transition Method
          .duration(2000) // Set Duration timing (ms)
          .ease(d3.easeLinear) // Set Easing option
          .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition
      }

      bar_g.append('text')
        .attr("transform", "translate(" + translate + ",0)")
        .attr('fill', 'white')
        .attr('x', 160)
        .attr('y', 25)
        .text('Unemployment Rate Of Last 10 Years');
    }
  }
}
