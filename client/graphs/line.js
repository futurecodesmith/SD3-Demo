(function() {
  
var socket = wsEvents(new WebSocket('ws://localhost:3000'));

//set initial SVG params
let margin = { top: 25, right: 20, bottom: 25, left: 20 };
let width = 700 - margin.left - margin.right;
let height = 500 - margin.top - margin.bottom;


//array to compare incoming data >> if data is the same, do not rerender
let currData = [];

//draw initial blank graph placeholder
drawAxis(
  d3.scaleLinear().domain([0, 20]).range([0, width]), 
  d3.scaleLinear().domain([0, 40]).range([height, 0]),
  [{
    setWidth: 700,
    setHeight: 500,
    xTicks: 10,
    yTicks: 10,
    xLabel_text: '',
    yLabel_text: '',
  }]
  );

socket.on('sendLineData', (allData) => {
  
  //console.log('ALL DATA: ', allData);

  //if data is not empty or data is new...
  if (allData.length > 0 || (currData.length > 0 && allData[allData.length - 1].xScale !== currData[currData.length - 1].xScale)) {

    currData = allData;

    width = allData[0].setWidth - margin.left - margin.right;
    height = allData[0].setHeight - margin.top - margin.bottom;

    let xScale;

    if (allData[0].shiftXAxis) {
      xScale = d3.scaleLinear()
        .domain([
          d3.min(allData, d => d.xScale),
          Math.max(allData[0].xDomainUpper, d3.max(allData, d => d.xScale))
        ])
        .range([0, width]);

    } else {
      xScale = d3.scaleLinear()
        .domain([allData[0].xDomainLower, allData[0].xDomainUpper])
        .range([0, width]);
    }

    let yScale = d3.scaleLinear()
      .domain([allData[0].yDomainLower, allData[0].yDomainUpper])
      .range([height, 0]);

    let line = d3.line()
      .x(d => xScale(d.xScale))
      .y(d => yScale(d.yScale))
    
    drawAxis(xScale, yScale, allData);
    drawContent(line, allData);
  };
})

function drawAxis(xScale, yScale, allData) {

  d3.select('#lineSVG').remove();

  svg = d3.select('#line-chart')
    .append('svg')
    .attr('id', 'lineSVG')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('class', 'mount')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).ticks(allData[0].xTicks));

  svg.append("text")
    .attr('transform', 'translate(' + (width) + ' ,' + (height + margin.bottom) + ')')
    .style('text-anchor', 'end')
    .style('font-family', 'sans-serif')
    .style('font-size', '13px')
    .text(allData[0].xLabel_text);

  svg
    .append('g')
    .attr('class', 'yAxis')
    .call(d3.axisLeft(yScale).ticks(allData[0].yTicks));

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", 0)
    .attr("dy", "1em")
    .style("text-anchor", "end")
    .style('font-family', 'sans-serif')
    .style('font-size', '13px')
    .text(allData[0].yLabel_text);
}

function drawContent(line, allData) {

  svg
    .selectAll('.line')
    .data(allData)
    .enter()
    .append('path')
    .attr('class', 'line')
    .attr('d', d => line(allData))
    .style('stroke', '#5176B6')
    .style('stroke-width', 1)
    .style('fill', 'none')
    .style('stroke-linejoin', 'round');

  svg.selectAll('.dot')
    .data(allData)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', line.x())
    .attr('cy', line.y())
    .attr('r', 3)
    .style('fill', 'white')
    .style('stroke-width', 1.5)
    .style('stroke', 'DodgerBlue');
}
})();