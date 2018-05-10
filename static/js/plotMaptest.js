// const svg = d3.select("svg");
// const gChart = svg.append("g");

const ZIPCODE_URL = "https://raw.githubusercontent.com/lingyielia/D3-visual/master/data/nyc_zip.geojson";

class DataSelectingForm extends React.Component {
  constructor(props) {
    super(props);
    // this.g = props.chart;
    this.mapdata = [];
    this.gmap = null;
    this.originmap = null;
    this.circle = null;
    this.circleUpdated = false;
    this.state = {
      zipcode: "all",
      category: "all",
      fromyear: "all",
      toyear: "all",
      radius:0,
      lat:0,
      lng:0,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClick_ge = this.handleClick_ge.bind(this);
    this.handleClick_ng = this.handleClick_ng.bind(this);
    this.handleClick_hi = this.handleClick_hi.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.createMap = this.createMap.bind(this);
    this.updateMap = this.updateMap.bind(this);
    this.zoomToFeature = this.zoomToFeature.bind(this);
    this.setupSelectionHandlers = this.setupSelectionHandlers.bind(this);
    this.circleSelection = this.circleSelection.bind(this);
    this.updateQueryStatus = this.updateQueryStatus.bind(this);
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleClick(e) {
    this.setState({
      zipcode: "all",
      category: "all",
      fromyear: "all",
      toyear: "all",
      radius:0,
      lat:0,
      lng:0,
    });
  }

  handleClick_ge(e) {
    this.setState({
      zipcode: "gen_ge",
    });
  }

  handleClick_ng(e) {
    this.setState({
      zipcode: "gen_ng",
    });
  }

  handleClick_hi(e) {
    this.setState({
      zipcode: "gen_hi",
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

        var x        = d3.scaleLinear()
                         .domain([0, maxCount])
                         .rangeRound([50, 300]),
            legend   = d3.select(".legend");

        var boxes = legend.selectAll("rect")
                          .data(color.range().map(function(d) {
                             d = color.invertExtent(d);
                             return [(d[0]!==null?d[0]:x.domain()[0]),
                                     (d[1]!==null?d[1]:x.domain()[1])];
                           }));
        // console.log(boxes)
        boxes.enter().append("rect")
             .merge(boxes)
               .attr("height", 6)
               .attr("x", d => x(d[0]))
               .attr("width", d => (x(d[1]) - x(d[0])))
               .attr("fill", d => 'Purple');

    count.forEach(function (d) {
      countbyzip[d[0]] = +d[1];
    });

    this.gmap.eachLayer(function (layer) {
      var c = color(countbyzip[layer.feature.properties.zipcode])
      var newstyle = {fillColor :c,
                      weight: 2,
                      opacity: 1,
                      color: 'white',
                      dashArray: '3',
                      fillOpacity: 0.9};
      layer.setStyle(newstyle);
      layer._recordedStyle = newstyle;
    });
  }

  zoomToFeature(e) {
      // this.originmap.fitBounds(e.target.getBounds());
      console.log(e.target.feature.properties.zipcode);
      this.setState({
        zipcode: "'"+e.target.feature.properties.zipcode+"'",
      });
  }

  circleSelection(){
    // console.log("circleSelection",this.circleUpdated);
    if (this.circleUpdated) {
      this.setState({
          radius : this.circle.getRadius(),
          lat    : this.circle.getLatLng().lat.toFixed(4),
          lng    : this.circle.getLatLng().lng.toFixed(4),});
    }
  }

  updateQueryStatus(){
    this.circleUpdated = true;
    var circle = this.circle;
    // console.log(circle,this.circle)
    var infoBox = d3.select(".infobox.leaflet-control");
    let radius  = L.GeometryUtil.readableDistance(circle.getRadius(), true),
        lat     = circle.getLatLng().lat.toFixed(4),
        lng     = circle.getLatLng().lng.toFixed(4),
        caption = `<table style='width:100%'>
                   <tr><th>Coords</th><td>${lat},${lng}</td></tr>
                   <tr><th>Radius</th><td>${radius}</td></tr>
                   </table>`;
    infoBox.html(caption);
  }

  setupSelectionHandlers() {
    var dMap = this.originmap;
    var circle = this.circle;
    // console.log(this.circle)
    var infoBox = d3.select(".infobox.leaflet-control");
    var updateQuery = this.circleSelection;
    var updateQueryStatus = this.updateQueryStatus;
    dMap.on(L.Draw.Event.EDITMOVE, updateQueryStatus);
    dMap.on(L.Draw.Event.EDITRESIZE, updateQueryStatus);
    dMap.on('mouseup', updateQuery);

    // let circleUpdated = true;
    // this.updateQueryStatus(null);
    let radius  = L.GeometryUtil.readableDistance(circle.getRadius(), true),
        lat     = circle.getLatLng().lat.toFixed(4),
        lng     = circle.getLatLng().lng.toFixed(4),
        caption = `<table style='width:100%'>
                   <tr><th>Coords</th><td>${lat},${lng}</td></tr>
                   <tr><th>Radius</th><td>${radius}</td></tr>
                   </table>`;
    infoBox.html(caption);
    // function updateQueryStatus(e) {
    //   this.circleUpdated = true;
    //   updateCaption();
    // }

    // function updateCaption() {
    //   let radius  = L.GeometryUtil.readableDistance(circle.getRadius(), true),
    //       lat     = circle.getLatLng().lat.toFixed(4),
    //       lng     = circle.getLatLng().lng.toFixed(4),
    //       caption = `<table style='width:100%'>
    //                  <tr><th>Coords</th><td>${lat},${lng}</td></tr>
    //                  <tr><th>Radius</th><td>${radius}</td></tr>
    //                  </table>`;
    //   infoBox.html(caption);
    // }
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
            // color: '#666',
            dashArray: '',
            fillOpacity: 0.8
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    function resetHighlight(e) {
        e.target.setStyle(e.target._recordedStyle);
    }

    var zoomToFeature = this.zoomToFeature

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }

    var center    = [40.7, -73.975],
        cusp      = [40.692908,-73.9896452],
        baseLight = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
                                { maxZoom: 18, }),
        baseDark  = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
                                { maxZoom: 18, }),
        circle    = L.circle(cusp, 1000, {editable: true}),
        dMap      = L.map('map', {
                      center: center,
                      zoom: 10.5,
                      layers: [baseLight]
                    }),
        svg       = d3.select(dMap.getPanes().overlayPane).append("svg"),
  			g         = svg.append("g").attr("class", "leaflet-zoom-hide");

    L.control.layers({"Light": baseLight,"Dark" : baseDark,},
                     {"Selection": circle,}).addTo(dMap);

    let infoBox = L.control({position: 'bottomleft'});
    infoBox.onAdd = function (map) {var div = L.DomUtil.create('div', 'infobox'); return div;}
    infoBox.addTo(dMap);

    let legendControl   = L.control({position: 'topleft'});

    // On adding the legend to LeafLet, we will setup a <div> to show
    // the selection information.
    legendControl.onAdd = addLegendToMap;
    legendControl.addTo(dMap);

    function addLegendToMap(map) {
      let div    = L.DomUtil.create('div', 'legendbox'),
          ndiv   = d3.select(div)
                     .style("left", "50px")
                     .style("top", "-75px"),
          lsvg   = ndiv.append("svg"),
          legend = lsvg.append("g")
                     .attr("class", "legend")
                     .attr("transform", "translate(0, 20)");
      legend.append("text")
        .attr("class", "axis--map--caption")
        .attr("y", -6);
      return div;
    };

    var x        = d3.scaleLinear()
                     .domain([0, maxCount])
                     .rangeRound([50, 300]),
        legend   = d3.select(".legend");

    var boxes = legend.selectAll("rect")
                      .data(color.range().map(function(d) {
                         d = color.invertExtent(d);
                         return [(d[0]!==null?d[0]:x.domain()[0]),
                                 (d[1]!==null?d[1]:x.domain()[1])];
                       }));
    // console.log(boxes)
    boxes.enter().append("rect")
         .merge(boxes)
           .attr("height", 6)
           .attr("x", d => x(d[0]))
           .attr("width", d => (x(d[1]) - x(d[0])))
           .attr("fill", d => 'Purple');

    legend.call(d3.axisBottom(x)
     .ticks(5, "s")
     .tickSize(10,0)
     .tickValues(color.domain()))
    .select(".domain")
     .remove();

    legend.select(".axis--map--caption")
    .attr("x", x.range()[0])
    .text("Number of 311 Incidents");

    // var map = L.map('map').setView([40.7, -73.975], 4);
    this.originmap = dMap;
    this.circle = circle;
    // console.log(this.circle,circle);
    this.setupSelectionHandlers();

    // L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', { minZoom: 10 }).addTo(map);
    var geojson = L.geoJson(zip, {style: style, onEachFeature: onEachFeature}).addTo(dMap);
    geojson.eachLayer(function (layer) {
      layer._recordedStyle = style(layer.feature);
    });

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
    if (this.circleUpdated) {
      console.log('update!')
      var line = `/circle/${this.state.radius}/${this.state.lat}/${this.state.lng}/${this.state.category}/${this.state.fromyear}/${this.state.toyear}`;
      vegaEmbed('#vis', line);
      this.circleUpdated = false;
    }
    else{
      var line = `/normal/2/${this.state.zipcode}/${this.state.category}/${this.state.fromyear}/${this.state.toyear}`;
      // vegaEmbed('#vis', line);
      fetch(datatest)
        .then(response => response.json())
        .then(function (data, error) {
          var chart = c3.generate({
            bindto: '#chart',
            data: {
              x: 'x',
              columns: [
                data.date,
                data["Air Quality"],
                data['New Tree Request'],
                data.SAFETY,
                data['Taxi Complaint'],
                data.Traffic
              ],
            },
            axis: {
              x: {
                type: 'timeseries',
                tick: {
                  count: 5,
                  format: '%Y-%m'
                }
              },
              y: {
                label: {
                  text: 'Counts',
                  position: 'outer-middle'
                }
              },
            },
            legend: {
              item: {
                onclick: function (id) { console.log(id); }
              }
            }
          });
      });

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

  }

  render() {
    return (
        React.createElement("form", {onSubmit: this.handleSubmit},
          React.createElement("label", null,
            "   ",
            React.createElement("input", {type: "button",
              value: "Reset to Default",
              onClick: this.handleClick}
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
            "   ",
            React.createElement("input", {type: "button",
              value: "Gentrifying",
              onClick: this.handleClick_ge}
            ),
            "   ",
            React.createElement("input", {type: "button",
              value: "Non-Gentrifying",
              onClick: this.handleClick_ng}
            ),
            "   ",
            React.createElement("input", {type: "button",
              value: "Higher-Income",
              onClick: this.handleClick_hi}
            ),
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
