function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(data => data.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// Create the buildCharts function.
function buildCharts(sample) {
  // Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // Create a variable that holds the samples array. 
    var samples = data.samples;
    
    // Create a variable that filters the samples for the object with the desired sample number.
    var resultsArray = samples.filter(data => data.id == sample);

    // Create a variable that filters the metadata array for the object with the desired sample number.
    var metadata = data.metadata;
    var metadataArray = metadata.filter(data => data.id == sample);
       
    // Create a variable that holds the first sample in the array.
    var results = resultsArray[0];

    // Create a variable that holds the first sample in the metadata array.
    var metaResults = metadataArray[0];

    // Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otu_ids = results.otu_ids;
    var otu_labels = results.otu_labels;
    var sample_values = results.sample_values;

    // Create a variable that holds the washing frequency.
    var washingfreq = metaResults.wfreq;
    var level = parseFloat(washingfreq);
    
    // Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order so the otu_ids with the most bacteria are last. 

    var yticks = otu_ids.slice(0,10).map(otuID => `OTU ${otuID}`).reverse();
       
    // Create the trace for the bar chart. 
    var barData = [{
      x: sample_values.slice(0,10).reverse(),
      y: yticks.reverse(),
      text:otu_labels.slice(0,10).reverse(),
      type: "bar",
      orientation: "h"
    }];

    // Create the layout for the bar chart. 
    var barLayout = {
        title: "Top Bacteria Cultures Found",
        paper_bgcolor: "lightsteelblue",
        height: 375
      };
    // Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);
  
    // Create the trace for the bubble chart.
    var bubbleData = [{
      x:otu_ids,
      y:sample_values,
      text:otu_labels,
      mode: 'markers',
      marker: {
        size: sample_values,
        colors: otu_ids,
        colorscale: "earth"
      }
    }];

    // Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteria Cultures Per Sample",
      hovermode: "closest",
      xaxis: {title: "OTU ID"},
      paper_bgcolor: "lightsteelblue"
    };

    // Use Plotly to plot the data with the layout.
   Plotly.newPlot("bubble", bubbleData, bubbleLayout); 
  
     // Create the trace for the gauge chart.
    var gaugeData = [
      {
        type: "indicator",
        mode: "gauge+number",
        value: level,
        title: {text: "Belly Button Washing Frequency", font: {size: 20}},
        gauge: {
          axis: {range: [null, 10], tickwidth:1, tickcolor: "black"},
          bar: {color: "black"},
          steps: [
            {range: [0,2], color: "red"},
            {range: [2,4], color: "orange"},
            {range: [4,6], color: "yellow"},
            {range: [6,8], color: "limegreen"},
            {range: [8,10], color: "forestgreen"}
          ]
        }
      }
    ];
  
    // Create the layout for the gauge chart.
    var gaugeLayout = { 
      width: 455,
      height: 375,
      font: {color: "black", family: "Arial"},
      paper_bgcolor: "lightsteelblue"
    };

    // Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
  });
}
