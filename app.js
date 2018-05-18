d3.queue()
  .defer(d3.csv, '/data/co2/API_EN.ATM.CO2E.KT_DS2_en_csv_v2.csv', formatter)
  .defer(d3.csv, '/data/methane/API_EN.ATM.METH.KT.CE_DS2_en_csv_v2.csv', formatter)
  .defer(d3.csv, '/data/renewable/API_EG.FEC.RNEW.ZS_DS2_en_csv_v2.csv', formatter)
  .defer(d3.csv, '/data/population/API_SP.POP.TOTL_DS2_en_csv_v2.csv', formatter)
  .defer(d3.csv, '/data/urban_population/API_SP.URB.TOTL_DS2_en_csv_v2.csv', formatter)
  .awaitAll(function(error, data){
      if (error) throw error;
      var width = 700;
      var height = 700;
      var padding = 100;
      var yearObj = formatAllData(data);
      var yearRange = d3.extent(Object.keys(yearObj)).map(year => +year ); //establishes min and max of the year property converted from string to integer

      var svg = d3.select("svg")
                    .attr("width", width)
                    .attr("height", height);
      
      svg.append("g")
            .attr("transform", "translate(0" + (width - padding + 30) + ")")
            .classed("x-axis", true);

      svg.append("g")
            .attr("transform", "translate(" + (padding - 30) + ",0)")
            .classed("y-axis", true);

      svg.append("text")
          .text("CO2 Emissions (kt per person)")
          .attr("x", width / 2)
          .attr("y", height)
          .attr("dy", "-1.5em")
          .attr("text-anchor", "middle");

      svg.append("text")
          .text("Methane Emissions (kt of C02 equivalent per person)")
          .attr("transform", "rotate(-90)")
          .attr("x", - width / 2)
          .attr("y", "1.5em")
          .attr("text-anchor", "middle");

      svg.append("text")
        

      // sometimes data needs to be formatted accross rows or accross files - a formatter callback only tackles one row

      function formatAllData(data) {
        var yearObj = {};
        data.forEach(function(arr) {
          // get the indicator and format the key
          var indicator = arr[0].indicator.split(" ")[0].replace(",","").toLowerCase();
          arr.forEach(function(obj) {
            // get current region
            var region = obj.region;
            // parse through every year, add that region's data to that year array
            for (var year in obj) {
              if (parseInt(year)) {
                if (!yearObj[year]) yearObj[year] = [];
                var yearArr = yearObj[year];
                var regionObj = yearArr.find(el => el.region === region);
                if (regionObj) regionObj[indicator] = obj[year];
                else {
                  var newObj = {region: region};
                  newObj[indicator] = obj[year];
                  yearArr.push(newObj);
                }
              }
            }
          })
        });
        // remove years that don't have complete data sets for any region
        for (var year in yearObj) {
          yearObj[year] = yearObj[year].filter(validRegion);
          if (yearObj[year].length === 0) delete yearObj[year];
        }
        return yearObj;
      }

      function validRegion(d) {
        for (var key in d) {
          if (d[key] === null) return false;
        }
        return true;
      }
      console.log(data);
      console.log(yearObj);
  });

  function formatter(row) {
    var invalidRows = [
      "Arab World", 
      "Central Europe and the Baltics",
      "Caribbean small states",
      "East Asia & Pacific (excluding high income)",
      "Early-demographic dividend",
      "East Asia & Pacific",
      "Europe & Central Asia (excluding high income)",
      "Europe & Central Asia",
      "Euro area",
      "European Union",
      "Fragile and conflict affected situations",
      "High income",
      "Heavily indebted poor countries (HIPC)",
      "IBRD only",
      "IDA & IBRD total",
      "IDA total",
      "IDA blend",
      "IDA only",
      "Not classified",
      "Latin America & Caribbean (excluding high income)",
      "Latin America & Caribbean",
      "Least developed countries: UN classification",
      "Low income",
      "Lower middle income",
      "Low & middle income",
      "Late-demographic dividend",
      "Middle East & North Africa",
      "Middle income",
      "Middle East & North Africa (excluding high income)",
      "North America",
      "OECD members",
      "Other small states",
      "Pre-demographic dividend",
      "Pacific island small states",
      "Post-demographic dividend",
      "Sub-Saharan Africa (excluding high income)",
      "Sub-Saharan Africa",
      "Small states",
      "East Asia & Pacific (IDA & IBRD countries)",
      "Europe & Central Asia (IDA & IBRD countries)",
      "Latin America & the Caribbean (IDA & IBRD countries)",
      "Middle East & North Africa (IDA & IBRD countries)",
      "South Asia (IDA & IBRD)",
      "Sub-Saharan Africa (IDA & IBRD countries)",
      "Upper middle income",
      "World"
    ];
    var obj = {
      region: row["Country Name"],
      indicator: row["Indicator Name"]
    }
    if (invalidRows.indexOf(obj.region) > -1) return;
    for (var key in row) {
      if (parseInt(key)) obj[key] = +row[key] || null;
    }
    return obj;
  }
