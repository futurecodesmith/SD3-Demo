/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var module1=__webpack_require__(1);
module1.f1();
 
var module2=__webpack_require__(2);
module2.f2();
 
var module3=__webpack_require__(3);
module3.f3();

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = {
  f1: () => {
let socket = io.connect();

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
  }
}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = {
  f2: () => {
    let socket = io.connect();

  //set initial SVG params
  let margin, width, height;


  //array to compare incoming data >> if data is the same, do not rerender
  let dataCache = {};

  //function that draws setup
  //on socket, function that draws elements

  function drawGrid(data) {
    margin = { top: 20, right: 20, bottom: 25, left: 20 };
    width = 500 - margin.left - margin.right;
    height = 300 - margin.top - margin.bottom;

    // d3.select('#bar-graph').selectAll('svg').remove();
    let svg = d3.select('#bar-graph')
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

    let settings = {
      data,
      svg,
      yScale,
      yAxis,
    }

    return settings;
  }

  function drawChart(settings, data) {

    let xScale = d3.scaleBand()
      .paddingOuter(.5)
      .paddingInner(0.1)
      .domain(data.map(d => d.xScale))
      .range([0, width]);

    let xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickSize(10)
      .tickPadding(5);

    d3.select('#xAxis').remove();
    settings.svg
      .append('g')
      .attr('id', 'xAxis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')

    //ENTER.
    let column = settings.svg.selectAll('g.column-container')
      .data(data, d => d.xScale);

    let newColumn = column
      .enter()
      .append('g')
      .attr('class', 'column-container')


    newColumn.append('rect').transition()
      .duration(300)
      .attr("opacity", 1)
      .attr('class', 'column')
      .attr('x', d => xScale(d.xScale))
      .attr('y', d => settings.yScale(d.volume))
      .attr('width', d => xScale.bandwidth())
      .attr('height', d => height - settings.yScale(d.volume))
      .attr('id', d => d.id)
      .attr('fill', (d, i) => d.color[i]);

    //UPDATE.
    let updateNodes = column.select('.column');

    if (Object.keys(dataCache).length === data.length) {
      updateNodes._groups[0] = column.select('.column')._groups[0].filter(d => d.__data__.volume === dataCache[d.__data__.id]);
    }

    updateNodes.transition()
      .duration(1000)
      .attr("opacity", 1)
      .attr('width', d => xScale.bandwidth())
      .attr('height', d => height - settings.yScale(d.volume))
      .attr('x', d => xScale(d.xScale))
      .attr('y', d => settings.yScale(d.volume))
  }

  let settings;

  socket.on('sendBarData', (data) => {
    if (data.length > 0) {
      if (!settings) {
        settings = drawGrid(data)
      };
      drawChart(settings, data);

      for (let i = 0; i < data.length; i += 1) {
        dataCache[data[i].id] = data[i].volume;
      }
    }
  })

  }
}

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = {
  f3: () => {

  let socket = io.connect();

  var margin = { top: 25, right: 20, bottom: 25, left: 20 };
  var width = 400 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  //array to compare incoming data >> if data is the same, do not rerender
  let currData = [];

  socket.on('sendScatterData', (allData) => {
  
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
  }
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);