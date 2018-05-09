// const svg = d3.select("svg");
// const gChart = svg.append("g");

const ZIPCODE_URL = "https://raw.githubusercontent.com/lingyielia/D3-visual/master/data/nyc_zip.geojson";

class DataSelectingForm extends React.Component {
  constructor(props) {
    super(props);
    // this.g = props.chart;
    this.mapdata = [];
    this.gmap = null;
    this.state = {
      zipcode: "all",
      category: "all",
      fromyear: "all",
      toyear: "all",
    };

    this.handleChange = this.handleChange.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.createMap = this.createMap.bind(this);
    this.updateMap = this.updateMap.bind(this);
  }

  handleChange(event) {
    // console.log('change!')
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  updateMap(){
    var count = this.mapdata;
    var counts = count.map(d => d[1]),
        maxCount = d3.max(counts),
        color    = d3.scaleThreshold()
                     .domain(d3.range(0, maxCount, maxCount/5))
                     .range(d3.schemePurples[5]),
        countbyzip = {};

    count.forEach(function (d) {
      countbyzip[d[0]] = +d[1];
    });

    this.gmap.eachLayer(function (layer) {
      layer.setStyle({fillColor :color(countbyzip[layer.feature.properties.zipcode]),})
    });

  }

  createMap(error,zip){
    var count = this.mapdata;
    var counts = count.map(d => d[1]),
        maxCount = d3.max(counts),
        color    = d3.scaleThreshold()
                     .domain(d3.range(0, maxCount, maxCount/5))
                     .range(d3.schemePurples[5]),
        countbyzip = {};

    count.forEach(function (d) {
      countbyzip[d[0]] = +d[1];
    });

    function style(feature) {
      return {
            fillColor: color(countbyzip[feature.properties.zipcode]),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.9
        };
    }

    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    function resetHighlight(e) {
        geojson.resetStyle(e.target);
    }

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }

    var map = L.map('map').setView([40.7, -73.975], 4);
    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', { minZoom: 10 }).addTo(map);
    var geojson = L.geoJson(zip, {style: style, onEachFeature: onEachFeature}).addTo(map);
    this.gmap = geojson;
}

  componentDidMount(event) {
    var line = `/normal/2/${this.state.zipcode}/${this.state.category}/${this.state.fromyear}/${this.state.toyear}`;
    vegaEmbed('#vis', line);

    var map = `/normal/1/${this.state.zipcode}/${this.state.category}/${this.state.fromyear}/${this.state.toyear}`;
    fetch(map)
      .then( r => r.json())
      .then( r => {
        this.mapdata=r;
        d3.queue()
          .defer(d3.json, ZIPCODE_URL)
          .await(this.createMap);
      })
      .catch(function (error) {
        console.log('Request failure: ', error);
      });
    // console.log(this.mapdata);
  }

  componentDidUpdate(event) {
    var line = `/normal/2/${this.state.zipcode}/${this.state.category}/${this.state.fromyear}/${this.state.toyear}`;
    vegaEmbed('#vis', line);

    var map = `/normal/1/${this.state.zipcode}/${this.state.category}/${this.state.fromyear}/${this.state.toyear}`;
    fetch(map)
      .then( r => r.json())
      .then( r => {
        this.mapdata=r;
        d3.queue()
          .defer(d3.json, ZIPCODE_URL)
          .await(this.updateMap);
      })
      .catch(function (error) {
        console.log('Request failure: ', error);
      });
    console.log(this.mapdata);

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
          )
      )
    );
  }
}

ReactDOM.render(
  React.createElement("div", null,
    React.createElement(DataSelectingForm)
  ),
  document.getElementById('ui')
);
