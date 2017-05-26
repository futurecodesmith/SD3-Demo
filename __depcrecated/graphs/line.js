
var socket = io.connect();


//////////if want to call API here would need line below////////////////

let queue = [];
let allData = [];
let counter = 0;

/////////////USE SOCKET DATA TO BUILD D3 GRAPH//////////////////////////////////

var margin = { top: 100, right: 20, bottom: 50, left: 120 };
var width = 1200 - margin.left - margin.right;
var height = 700 - margin.top - margin.bottom;

var svg = d3.select('.chart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


socket.on('sendStreamData', (data) => {
    console.log('received data!', data); 
  var xScale = d3.scaleLinear()
    .domain([0, 200])
    // .domain([
    //   data.length <= 20 ? 0 : d3.min(data, d => d.num_bikes_available),
    //   Math.max(20, d3.max(data, d => d.num_bikes_available))
    // ])
    .range([0, width]);
  svg
    .append('g')
    .attr('transform', `translate(0, ${height})`)

  svg
    .select('g')
    .call(d3.axisBottom(xScale).ticks(10));

  // Add the text label for the x axis
  svg.append("text")
    .attr('transform', 'translate(' + (width) + ' ,' + (height + margin.bottom) + ')')
    .style('text-anchor', 'end')
    .style('font-family', 'sans-serif')
    .style('font-size', '13px')
    .text('xLabel');

  var yScale = d3.scaleLinear()
    .domain([0, 30])
    .range([height, 0]);

  svg
    .append('g')
    .attr('class', 'yAxis');
  
  svg.select('.yAxis')
    .call(d3.axisLeft(yScale).ticks(10));

  svg.append("text")
    .attr("transform", "rotate(0)")
    .attr("y",-10)
    .attr("x", -40)
    .attr("dy", "1em")
    .attr('class', 'yLabel')
    .style("text-anchor", "end")
    .style('font-family', 'sans-serif')
    .style('font-size', '13px')
    .text("yLabel");

  var line = d3.line()
    .x(d => xScale(d.counter))
    .y(d => yScale(d.num_bikes_available))
    //.curve(d3.curveCatmullRom.alpha(.5));

  d3.selectAll('path.line').remove();
  d3.selectAll('.dot').remove();

  svg
    .selectAll('.line')
    .data(data)
    .enter()
    .append('path')
    .attr('class', 'line')
    .attr('d', d => line(data))
    .style('stroke', '#5176B6')
    .style('stroke-width', 1)
    .style('fill', 'none')
    .style('stroke-linejoin','round');


svg.selectAll('.dot')
  .data(data)
  .enter()
  .append('circle')
    .attr('class', 'dot')
    .attr('cx', line.x())
    .attr('cy', line.y())
    .attr('r', 3)
    .style('fill', 'white')
    .style('stroke-width', 1.5)
    .style('stroke', 'DodgerBlue');


})


//////////RENDER DATA EVERY 1 SECOND////////////////////////////////////////

//to convert data.last_reported to hour:seconds:minutes
// function secondsToHms(d) {
//     d = Number(d);
//     var h = Math.floor(d / 360000000);
//     var m = Math.floor(d % 3600 / 60);
//     var s = Math.floor(d % 3600 % 60);

//     return h + ':' + m + ':' + s; 
// }

// setInterval(() => {
//     // queue.forEach(obj => {
//     //   if (obj.station_id < 200) {
//     //     allData.push(obj);
//     //   }
//     // })
//      // allData.push(queue[counter]);
//       counter++;
//       console.log('INSIDE INTERVAL', counter)
//     }, 50)



 

