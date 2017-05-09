(() => {

  var socket = wsEvents(new WebSocket('ws://localhost:3000'));


  var margin = { top: 25, right: 20, bottom: 25, left: 20 };
  var width = 400 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  //array to compare incoming data >> if data is the same, do not rerender
  let currData = [];

  socket.on('sendScatterData', (allData) => {
  
    //console.log('ALL DATA: ', allData);

    //if data is not empty or data is new...
    if (allData.length > 0 || (currData.length > 0 && allData[allData.length - 1].xScale !== currData[currData.length - 1].xScale)) {

      currData = allData;

      width = allData[0].setWidth - margin.left - margin.right;
      height = allData[0].setHeight - margin.top - margin.bottom;

      /////////////////MAKE BG///////////////////////////////////////
        //remove svg so won't render twice
        d3.select('#scatterSVG').remove();

      var svg = d3.select('#scatter-plot')
        .append('svg')
          .attr('id', 'scatterSVG')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

      
        //---------------create scales---------------------
        var yScale = d3.scaleLinear()
          .domain([allData[0].yDomainLower, allData[0].yDomainUpper])
          .range([height, 0])
          //make axis end on round numbers b/c pulling non-round #s from our data 
          .nice()
        var yAxis = d3.axisLeft(yScale)
        svg.call(yAxis);

        var xScale = d3.scaleLinear()
          .domain([allData[0].xDomainLower, allData[0].xDomainUpper])
          .range([0, width])
          .nice();
        var xAxis = d3.axisBottom(xScale).ticks(5)
        svg
          .append('g')
            .attr('transform', `translate(0, ${height})`)
          .call(xAxis);  

        //circles scale
        var rScale = d3.scaleSqrt()
          .domain([0, d3.max(allData, d => d.yScale)])
          .range([0, 40])

        //create circles but group them in svg container so work better with text when animating 
        var circles = svg
          .selectAll('.ball')
          .data(allData) 
          .enter()
          .append('g')
          .attr('class', 'ball')
          //instead of .attr('cx', d => xScale(d.cost)) we use transform b/c we are creating circles inside a g tag instead of 'circle' in selectAll and append
          .attr('transform', d => {
            return `translate(${xScale(d.xScale)}, ${yScale(d.yScale)})`
          })

        circles
          .append('circle')
          //where to place circles on graph
          .attr('cx', 0)
          .attr('cy', 0)
          //how big circle should be 
          .attr('r', d => rScale(d.yScale))
          .style('fill', 'steelblue')
          .style('fill-opacity', 0.5)

        //IF WANT TEXT INSIDE CIRCLES UNCOMMENT THIS SECTION BELOW 
        // circles
        //   .append('text')
        //   //put text in middle of element
        //   .style('text-anchor', 'middle')
        //   .style('fill', 'black')
        //   //adjust y position by 4px
        //   .attr('y', 4)
        //   //set text to the country code
        //   .text(d => d.xLabel_text)
    }
    
  });

})()




