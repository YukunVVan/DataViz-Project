var datatest = "https://raw.githubusercontent.com/lingyielia/TextDataAnalysis/master/data/json_data.json";

fetch(datatest)
  .then(response => response.json())
  .then(function (data, error) {
        var chart = c3.generate({
    bindto: '#vis',
    data: {
      x: 'x',
      xFormat: '%Y-%m',
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
