var ZIPCODE_URL = "https://raw.githubusercontent.com/hvo/datasets/master/nyc_zip.geojson";
var RES_BY_CUISINE_URL = "https://raw.githubusercontent.com/hvo/datasets/master/nyc_restaurants_by_cuisine.json";

d3.queue()
   .defer(d3.json,ZIPCODE_URL)
   .defer(d3.json,RES_BY_CUISINE_URL)
   .await(createChart);

function createChart(error, zipcodes, byCuisine){

  //Map Plot
  var svg        = d3.select("svg"),
      gMap       = svg.append("g"),
      canvasSize = [1300,570],
      projection = d3.geoMercator()
                     .scale(Math.pow(2,10.66 + 4.84))
                     .center([-73.975,40.7])
                     .translate([canvasSize[0]/2,canvasSize[1]/2]),
      path       = d3.geoPath()
                     .projection(projection);
  
  //Draw Map
  var zc = gMap.selectAll(".zipcode")
                .data(zipcodes.features)
                .enter().append("path")
                  .attr("class","zipcode")
                  .attr("d",path)
                  .style("fill","transparent");
  
  //Draw ColorBar - color
  var bar = gMap.selectAll(".colorbar")
                .data(d3.schemeBlues[5])
                .enter().append('rect')
                  .attr("class","colorbar")
                  .attr("visibility",'hidden')
                  .attr("height", 8)
                  .attr("x", function(d,i) { return 420+40*i; })
                  .attr("y", 55)
                  .attr("width", 40);
  
  //Draw ColorBar - Scale
  var scalebar = gMap.append('g')
      .attr('class','colorbar')
      .attr('transform','translate(420,55)');
  
  //Draw ColorBar - Title
  var bartitle = gMap.append("text")
             .attr("class","colorbartitle")
             .attr("x", 420)
             .attr("y", 50);
  
  //Show Map when mouseover
  function showmap(cuisine,i){
          var counts   = filtered[i].perZip,
              data     = Object.entries(counts),
              maxCount = d3.max(data,d => d[1]), 
              color    = d3.scaleThreshold()
                           .domain(d3.range(0, maxCount, maxCount/5))
                           .range(d3.schemeBlues[5]);
          
          //Fill map
          zc.data(data, myKey)
            .transition().duration(800)
            .style("fill",d=>color(d[1]));
    
          var scale = color.range().map(function(d,i) {
                              d = color.invertExtent(d);
                              if (d[0] == null) d[0] = x.domain()[0];
                              if (d[1] == null) d[1] = x.domain()[1];
                              return d;})
                              .filter(function(d,i){return i>0;}),
              tickX = [0].concat(scale.map(function(d){return d[1];})),
              scaleX = d3.scalePoint()
                          .domain(tickX)
                          .rangeRound([0,160])
                          .padding(0);
          //Show ColorBar
          bar.data(scale)  
             .style("fill", function(d) { return color(d[0]); })
             .attr("visibility",'visible');
    
          scalebar.attr("visibility",'visible')
                  .call(d3.axisBottom(scaleX)
                      .ticks(5)
                      .tickFormat(d3.format(".2s")));

          bartitle.attr("visibility",'visible')
                  .text("Number of "+cuisine+" restaurants");
  }
  
  //Hide Map when mouseout
  function hidemap(i){
          var counts   = filtered[i].perZip,
              data     = Object.entries(counts);
          
          //Remove the color
          zc.data(data, myKey)
            .transition().duration(800)
            .style("fill","transparent");
    
          //Hide ColorBar
          bar.attr("visibility",'hidden');
          scalebar.attr("visibility",'hidden');
          bartitle.attr("visibility",'hidden');
  }
  
  //Bar Plot
  var svg2        = d3.select("svg"),
      g           = svg2.append("g"),
      filtered    = byCuisine.filter(function (d,i){ return i < 25;}),
      maxValue    = d3.max(filtered, function(d) {return d.total;});
  
  var x = d3.scaleLinear()
            .domain([0, maxValue])
            .rangeRound([0, 250]);
  
  var yb = d3.scaleBand()
              .domain(filtered.map(function (d,i) {
                return i;}))
              .rangeRound([50, 500]);
  
  var labelY = d3.scaleBand()
                  .domain(filtered.map(function (d){return d.cuisine;}))
                  .rangeRound([50,500]);
  
  var labelX = d3.scalePoint()
                  .domain(['0','20,000','40,000','60,000','80,000'])
                  .rangeRound([0,x(80000)])
                  .padding(0);
  
  g.append('g')
       .attr('class','yaxis')
       .attr('transform','translate(117,0)')
       .call(d3.axisLeft(labelY));//
  
  g.append('g')
       .attr('class','xaxis')
       .attr('transform','translate(118,50)')
       .call(d3.axisTop(labelX));
  
  g.append('g')
       .attr('class','xaxis')
       .attr('transform','translate(118,500)')
       .call(d3.axisBottom(labelX))
       .append("text")
          .attr("class","label")
          .attr("x", 125)
          .attr("y", 35)
          .text("Number of restaurants");
  
  g.append('g')
       .attr('class','grid')
       .attr('transform','translate(118,500)')
       .call(d3.axisBottom(labelX).ticks(1).tickSize(-450)
          .tickFormat(""));
  
  g.selectAll(".bar")
    .data(filtered)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 120)
      .attr("y", function(d,i) {return yb(i); })
      .attr("width", function(d,i) {return x(d.total); })
      .attr("height", yb.bandwidth()-2.2)
      .on("mouseover", function(d,i){
          d3.select(this)
            .transition().duration(500)
            .attr('x', 116)
            .attr('y', yb(i)-2)
            .attr('width', function(d,i) {return x(d.total)+6;})
            .attr('height',yb.bandwidth()+2)
            .style('fill','steelblue');
          showmap(d.cuisine,i)
       })
      .on("mouseout", function(d,i){
          d3.select(this)
            .transition().duration(500)
            .attr('x', 120)
            .attr('y', yb(i))
            .attr('width', function(d,i) {return x(d.total);})
            .attr('height',yb.bandwidth()-2.2)
            .style('fill','silver');
          hidemap(i)
      });
}

// mykey(data[0]) - zipcode - data[0][0]
// mykey(zipcode,feature[0] - zip code - zipcode.features[0].properties.zipcode)
function myKey(d){
  return (d[0]?d[0]:d.properties.zipcode);
}