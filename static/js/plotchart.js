const svg = d3.select("svg");
const gChart = svg.append("g");

class HighlightText extends React.Component {

  // the constructor is get called with all the properties when we first
  // render it. In this case, we provide "gChart" to the chart property.
  // During the construction, we will store this chart as "chart" in
  // in the object.
  constructor(props) {
    // this ensures to initialize our component with React's necessity
    super(props);

    // keep the gChart locally
    this.g = props.chart;
    // this.zip = "";
    this.state = {
      zip: "",
      cat: "",

    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    //
    // this.gg = this.g.append("g")
    //               .attr("class", "axis axis--x")
    //               .attr("transform", "translate(220,50)");
    // this.gx       = this.g.append("g")
    //               .attr("class", "grid axis--x")
    //               .attr("transform", "translate(220,50)");
    // this.gy       = this.g.append("g")
    //               .attr("class", "axis axis--y")
    //               .attr("transform", "translate(215,0)");
    // this.Xaxis    = this.g.append("g")
    //               .attr("class", "axis axis--x")
    //               .attr("transform", "translate(220,600)");
    // this.t        = this.Xaxis
    //               .append("text")
    //                 .attr("class", "label")
    //                 .attr("x", 150)
    //                 .attr("y", 40)
    //                 .attr("visibility","hidden")
    //                 .text("Number of Restaurants");
  }

  createBar(g,typedata) {

      // var svg1     = d3.select("#svg1"),
      //     g        = svg1.append("g"),
      console.log(typedata)
      var type  = typedata.map(function(d) {return d.type;}),
          count    = typedata.map(function(d) {return d.count;}),
          maxValue = d3.max(count);

      var w = d3.scaleLinear()
        .domain([0, maxValue])
        .rangeRound([0, 300]);

      g.selectAll(".mark")
        .data(count)
        .enter()
          .append('rect')
          .attr('class', 'mark')
          .attr('x', 120)
          .attr('y', function(d,i) {return 50+i*24;})
          .attr('width', function(d,i) {return w(d);})
          .attr('height', 22)
          .attr('fill','lightgrey');

      var xAxis = d3.axisBottom()
                    .scale(w)
                    .ticks(5);

      g.append("g")
       .attr("class", "x-axis")
       .attr("transform", "translate(120,170)")
       .call(xAxis)
       .append("text")
        .attr("class", "label")
        .style("text-anchor", "middle")
        .attr("transform","translate(100,40)")
        .text("Complaints by Type");

      var y = d3.scalePoint().domain(type).range([0,100]);

      var yAxis = d3.axisLeft()
                    .scale(y);

      g.append("g")
       .attr("class", "y-axis")
       .attr("transform", "translate(116,60)")
       .call(yAxis);
  }
  // createChart(g,data) {
  //     console.log('begin plot chart!')
  //     let maxValue = d3.max(data, d => d[1]),
  //         xx       = d3.scaleLinear()
  //                      .domain([0, maxValue])
  //                      .rangeRound([0, 300]),
  //         yb       = d3.scaleBand()
  //                      .domain(data.map(d => d[0]))
  //                      .rangeRound([50, 600]);
  //
  //     if (maxValue == 0){
  //         this.gg.attr("visibility","hidden");
  //         this.gx.attr("visibility","hidden");
  //         this.gy.attr("visibility","hidden");
  //         this.Xaxis.attr("visibility","hidden");
  //         this.t.attr("visibility","hidden");
  //         this.g.selectAll(".bar").attr("visibility","hidden");
  //     }
  //     else{
  //       // We need an additional X axis to draw the vertical gridlines
  //       this.gg.call(d3.axisTop(xx).ticks(4)).attr("visibility","visible");
  //       this.gx.call(d3.axisTop(xx).ticks(4)
  //                      .tickSize(-550).tickFormat(""))
  //              .attr("visibility","visible");
  //       this.gy.call(d3.axisLeft(yb)).attr("visibility","visible");
  //       this.Xaxis.call(d3.axisBottom(xx).ticks(4)).attr("visibility","visible");
  //       this.t.attr("visibility","visible");
  //       this.g.selectAll(".bar").attr("visibility","visible");
  //       // console.log(maxValue,data)
  //
  //       const newbar = this.g.selectAll(".bar").data(data);
  //       newbar.exit().remove();
  //       newbar.enter().append("rect")
  //         .attr("class", "bar")
  //         .attr("x", 220)
  //         .attr("y", function(d,i) { return yb(d[0]); })
  //         .attr("width", function(d,i) { return xx(d[1]); })
  //         .attr("height", yb.bandwidth()-3);
  //     }
  // }

  // handleChange() gets triggered when the text in input box changes.
  // For each change, we will update the color of all bars in the chart,
  // similar to the conditional color encoding in Vega-lite and Altair.
  handleChange(e) {
    this.setState({zip :e.target.value});
  }

  handleClick(e) {
    // var k = this.getData(this.data,this.zip)
    // console.log(k)
    console.log(this.zip)
    fetch("http://127.0.0.1:5000/normal/", {
        method: 'POST',
        dataType: 'json',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        name: this.state.zip,
      })
    })
    .then(function (r) {
      return r.json();
    })
    .then(r => this.createBar(this.g,r))
      // this.setState({ data: r }))
    .catch(function (error) {
      console.log('Request failure: ', error);
    });
  }

  // render() is a required function for a React Component to tell
  // the browser how to render the item. In our case, HighlightText
  // is simply an "input", similar to the binding element in Altair
  // and Vega-lite. We assign the id 'highlight' for this input, and
  // associate its 'onChange' event with the handleChange function.
  render() {
    return (
      React.createElement("div", null,
        "ZipCode   ",
        React.createElement("input", {type: "text", onChange:  this.handleChange}),
        React.createElement("input", {type: "button",
          value: "Search",
          onClick: this.handleClick}
        ),
      )
    );
  }
}

ReactDOM.render(
  React.createElement("div", null,
    React.createElement(HighlightText, {chart: gChart})
  ),
  document.getElementById('ui')
);
