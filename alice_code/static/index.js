console.log(medIncome);

let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

var myMap = L.map('map',{
    center: [30.26, -97.74],
    zoom: 12,
    layers: street
});

// median income in 2021
d3.json("/merged_data").then(function(data){

    let geojson = L.choropleth(data, {
        valueProperty: 'medianIncome',
        scale: ['black', 'green'],
        steps: 10,
        mode: 'q',
        style: {
            color: '#fff',
            weight: 1,
            fillOpacity: 0.75
        },
        onEachFeature: function(feature, layer){
            layer.bindPopup('<strong>'+ feature.properties.geoid10 + 
            "</strong><br /><br />Median Income: $" + feature.properties.medianIncome)
        }
    }).addTo(myMap);

     // Set up the legend.
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let limits = geojson.options.limits;
    let colors = geojson.options.colors;
    let labels = [];

    // Add the minimum and maximum.
    let legendInfo = "<h1>2021 Median Income</br>By Zipcode</h1>" +
      "<div class=\"labels\">" +
        "<div class=\"min\">" + limits[0] + "</div>" +
        "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
      "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };

  // Adding the legend to the map
  legend.addTo(myMap);
    
});

//frappe chart
d3.json('/median_income').then(function(response){
  console.log(response)

  zipcodes = []
  values_2018 = []
  values_2019 = []
  values_2020 = []
  values_2021 = []

  for(i=0; i<response.length; i++){

    zipcodes.push(response[i]['Zipcode'])

    if(response[i]['Year'] == 2018){
      values_2018.push(response[i]['Median_Income'])
    }
    else if(response[i]['Year'] == 2019){
      values_2019.push(response[i]['Median_Income'])
    }
    else if(response[i]['Year'] == 2020){
      values_2020.push(response[i]['Median_Income'])
    }
    else if(response[i]['Year'] == 2021){
      values_2021.push(response[i]['Median_Income'])
    }
    
  }

  unique_zipcodes = zipcodes.filter((value, index, self) => self.indexOf(value) === index);

  const data = {
    labels: unique_zipcodes,
    datasets: [
        {
            name: "2018", chartType: "line",
            values: values_2018
        },
        {
            name: "2019", chartType: "line",
            values: values_2019
        },
        {
          name: "2020", chartType: "line",
          values: values_2020
        },
        {
          name: "2021", chartType: "line",
          values: values_2021
        }
    ]
}

const chart = new frappe.Chart("#chart", {  // or a DOM element,
                                            // new Chart() in case of ES6 module with above usage
    title: "Median Income",
    data: data,
    type: 'axis-mixed', // or 'bar', 'line', 'scatter', 'pie', 'percentage'
    height: 400,
    colors: ['#D5F5E3', '#58D68D', '#52BE80', '#1E8449']
})
})
