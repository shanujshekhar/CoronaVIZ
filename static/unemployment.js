// keep a dictionary of titles, just need to do this in one of the files
var titles_emp = {'unemp': 'Unemployment Viz'};

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
      // console.log(result)
      foo(result, titles_emp[id]);
    },
    error: function(result) {
    $("#error").html(result);
    }
  });
}

function foo(response, title) {
  console.log(response);
  d3.select("#graph_plot").select("svg").remove();// remove svg object if it exists
  var div = d3.select(".tooltip").style("opacity", 0);

  var margin = {top: 10,bottom: 10,left: 10,right:10}, 
    width = 900,
    width = width - margin.left - margin.right,
    // mapRatio = 0.5, 
    height = 500, 
    active = d3.select(null);

  var svg = d3.select("#graph_plot")
      .append('svg')
      .attr('class', 'foo');
      // .attr('class', 'center-container')
      // .attr('height', height + margin.top + margin.bottom)
      // .attr('height', height)
      // .attr('width', width + margin.left + margin.right)
      // .attr("y", margin.right + 1000);
      // .attr("fill", "none");

  svg.append('rect')
      // .attr('class', 'background center-container')
      .attr('height', "100%")
      .attr('width', width + margin.left + margin.right)
      .on('click', clicked);

  svg.append("text")
       .attr("transform", "translate(75,0)")
       .attr("x", width/2 - 50)
       .attr("y", margin.top/2) // x, y coordinate
       .attr("text-anchor", "middle")  
       .attr("font-size", "100px") 
       .attr("text-decoration", "underline") // underline
       .text(title);

  Promise.resolve(response)
      .then(ready);
  // Promise.resolve(d3.json('/static/us-counties.topojson'))
  //     .then(ready);

  var projection = d3.geoAlbersUsa()
      .translate([width /2 , height / 2])
      .scale(width);

  var path = d3.geoPath()
      .projection(projection);

  var g = svg.append("g")
      .attr('class', 'center-container center-items us-state')
      .attr('transform', 'translate('+margin.left+','+margin.top+')')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)

  function ready() {
    g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(response.usa, response.usa.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "county-boundary")
        .on("click", reset)
        .on("mouseover", function() {    
            div.transition()    
                .duration(200)    
                .style("opacity", .7);    
            div.html("County" + "<br/>")  
                .style("left", (d3.event.pageX + 15) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
        })
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });

    g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(topojson.feature(response.usa, response.usa.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "state")
        .on("click", clicked)
        .on("mouseover", function() {    
            div.transition()    
                .duration(200)    
                .style("opacity", .7);    
            div.html("Confirmed<br/>")  
                .style("left", (d3.event.pageX + 15) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
        })
        .on("mouseout", function(d) {   
            div.transition()    
                .duration(500)    
                .style("opacity", 0); 
        });

    g.append("path")
        .datum(topojson.mesh(response.usa, response.usa.objects.states, function(a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", path);
  }

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
      scale = .9 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

    g.transition()
      .duration(750)
      .style("stroke-width", 1.5 / scale + "px")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
  }


  function reset() {
    active.classed("active", false);
    active = d3.select(null);

    g.transition()
      .delay(100)
      .duration(750)
      .style("stroke-width", "1.5px")
      .attr('transform', 'translate('+margin.left+','+margin.top+')');

  }
  // var svg2 = d3.select("#graph_plot")
  //   .append('svg')
  //   // .attr('class', 'center-container')
  //   // .attr('height', height + margin.top + margin.bottom)
  //   .attr('height', height)
  //   .attr('width', width + margin.left + margin.right)
  //   .attr("y", margin.right + 100)
  //   .attr("x", margin.right + 100);
    svg.append('rect')
      .attr('class', 'stat')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', 525)
      // .attr("y", margin.right + 100)
      .attr("x", margin.right + 890)
      .attr("fill", "orange")
      .attr("opacity", .9);

  // centre the created bar_chart
  // d3.select(".viz").attr("align","center");
}
