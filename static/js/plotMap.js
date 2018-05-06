const svg = d3.select("svg");
const gChart = svg.append("g");

class DataSelectingForm extends React.Component {
  constructor(props) {
    super(props);
    this.g = props.chart;
    this.state = {
      zipcode: "all",
      category: "all",
      fromyear: "all",
      toyear: "all",
    };

    this.handleChange = this.handleChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  createBar(g,typedata) {

      console.log(typedata)
      var type  = typedata.map(function(d) {return d[0];}),
          count    = typedata.map(function(d) {return d[1];}),
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

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleClick(event) {
    var spec = `/normal/3/${this.state.zipcode}/${this.state.category}/${this.state.fromyear}/${this.state.toyear}`;
    // vegaEmbed('#vis', spec, {actions:false});
    // event.preventDefault();
    // console.log(this.zip)
    var line = `/normal/2/${this.state.zipcode}/${this.state.category}/${this.state.fromyear}/${this.state.toyear}`;
    vegaEmbed('#vis', line);
    fetch(spec, {
        method: 'POST',
        dataType: 'json',
        headers: {
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({
        // zip: this.state.zipcode,
        // cat: this.state.category,
      // })
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

  render() {
    return (
      React.createElement("form", {onSubmit: this.handleSubmit},
        React.createElement("label", null,
          "311 Data Selection   ", React.createElement("br", null),
          "Zipcode  ",
          React.createElement("select", {
            name: "zipcode",
            value: this.state.zipcode,
            onChange: this.handleChange},
            React.createElement("option", {value: "all"}, ""),
            React.createElement("option", {value: "'10001'"}, "10001"),
            React.createElement("option", {value: "'10002'"}, "10002")
          ),
          "   " + ' ' +
          "Category  ",
          React.createElement("select", {
            name: "category",
            value: this.state.category,
            onChange: this.handleChange},
            React.createElement("option", {value: "all"}, ""),
            React.createElement("option", {value: "'Air Quality'"}, "Air Quality"),
            React.createElement("option", {value: "'New Tree Request'"}, "New Tree Request"),
            React.createElement("option", {value: "'SAFETY'"}, "SAFETY"),
            React.createElement("option", {value: "'Taxi Complaint'"}, "Taxi Complaint"),
            React.createElement("option", {value: "'Traffic'"}, "Traffic")
          ),
          "   " + ' ' +
          "From Year  ",
          React.createElement("select", {
            name: "fromyear",
            value: this.state.fromyear,
            onChange: this.handleChange},
            React.createElement("option", {value: "all"}, ""),
            React.createElement("option", {value: "'2014'"}, "2014"),
            React.createElement("option", {value: "'2015'"}, "2015"),
            React.createElement("option", {value: "'2016'"}, "2016"),
            React.createElement("option", {value: "'2017'"}, "2017"),
            React.createElement("option", {value: "'2018'"}, "2018")
          ),
          "   " + ' ' +
          "To Year  ",
          React.createElement("select", {
            name: "toyear",
            value: this.state.toyear,
            onChange: this.handleChange},
            React.createElement("option", {value: "all"}, ""),
            React.createElement("option", {value: "'2014'"}, "2014"),
            React.createElement("option", {value: "'2015'"}, "2015"),
            React.createElement("option", {value: "'2016'"}, "2016"),
            React.createElement("option", {value: "'2017'"}, "2017"),
            React.createElement("option", {value: "'2018'"}, "2018")
          ),
          "   "
        ),
        React.createElement("input", {type: "button", value: "Update", onClick: this.handleClick})
      )
    );
  }
}


ReactDOM.render(
  React.createElement("div", null,
    React.createElement(DataSelectingForm, {chart: gChart})
  ),
  document.getElementById('ui')
);
