(function () {
  let socket = io.connect();

  //set initial SVG params
  let margin = { top: 20, right: 20, bottom: 40, left: 60 };
  let width = 700 - margin.left - margin.right;
  let height = 500 - margin.top - margin.bottom;


  //array to compare incoming data >> if data is the same, do not rerender
  let currData = [];
  let svg;

  socket.on('sendBarData', (allData) => {
    let incomingData = isNewData(currData, allData);
    if (incomingData === 'NEW_OBJ') {
      currData = allData;
      drawViz(allData);
    }
  });

  function drawViz(allData) {
    d3.select('svg').remove();

    svg = d3.select('.chart')
      .append('svg')
      .attr('id', 'barSVG')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    let yScale = d3.scaleLinear()
      .domain([0, 70])
      .range([height, 0]);

    let yAxis = d3.axisLeft(yScale);

    svg.call(yAxis);

    let xScale = d3.scaleBand()
      .paddingOuter(.5)
      .paddingInner(0.1)
      .domain(allData.map(d => d.xScale))
      .range([0, width]);

    let xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickSize(10)
      .tickPadding(5);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')

    svg
      .selectAll('rect')
      .data(allData)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.xScale))
      .attr('y', d => yScale(d.volume))
      .attr('width', d => xScale.bandwidth())
      .attr('height', d => height - yScale(d.volume))
      .attr('id', d => d.id)
      .attr('fill', (d, i) => d.color[i]);
  }

  function isNewData(a, b) {
    if (a.length !== b.length) { return 'NEW_OBJ' };

    let yScale = d3.scaleLinear()
      .domain([0, 70])
      .range([height, 0]);


    for (let i = 0; i < a.length; i += 1) {
      if (a[i].xScale === b[i].xScale && a[i].volume !== b[i].volume) {
        
        reRenderNode(b[i]);

      } else if (a[i].xScale !== b[i].xScale) {
        return 'NEW_OBJ';
      };
    }
    return 'OLD_DATA';
  }

  function reRenderNode(changedObj) {
    let yScale = d3.scaleLinear()
      .domain([0, 70])
      .range([height, 0]);

    let node = d3.select('#' + changedObj.id);
    node
      .attr('y', yScale(changedObj.volume))
      .attr('height', height - yScale(changedObj.volume))
      .attr('fill', 'black');
  }
})();