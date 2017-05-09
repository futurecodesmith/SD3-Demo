(function () {
	let currData = [];
	let socket = io.connect();

	//set initial SVG params
	let margin = { top: 20, right: 20, bottom: 40, left: 60 };
	let width = 700 - margin.left - margin.right;
	let height = 500 - margin.top - margin.bottom;

	let svg;

	drawGrid([{ setWidth: 700, setHeight: 500 }]);

	socket.on('sendBubbleData', (data) => {
		//check if data is the same
		if (isNewData(currData, data)) {
			currData = data;
			drawGrid(data);
			drawContent(data, svg);
		}

	});

	function drawGrid(data) {

		width = data[0].setWidth - margin.left - margin.right;
		height = data[0].setHeight - margin.top - margin.bottom;

		d3.select('svg').remove();

		svg = d3.select('.chart')
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

	}

	function drawContent(data, svg) {

		var radiusScale = d3.scaleSqrt().domain([0, 10]).range([0, 50]);

		var simulation = d3.forceSimulation()
			.force('x', d3.forceX(0).strength(.1))
			.force('Y', d3.forceY(0).strength(.1))
			.force('collide', d3.forceCollide(d => radiusScale(d.volume)))

		var circles = svg
			.selectAll('.word')
			.data(data)
			.enter()
			.append('g')
			.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

		circles.append('circle')
			.attr('r', d => radiusScale(d.volume))
			.attr('fill', 'yellow')
			.attr('class', 'word')
			.attr('fill-opacity', .8)
			.attr('id', d => 'c' + d.text)
			.attr('cx', width / 2)
			.attr('cy', height / 2)

		circles.append('text')
			.style('text-anchor', 'middle')
			.style('fill', 'black')
			.style('font-size', '16px')
			.attr('y', 4)
			.text(d => d.text)
			.append('text');

		circles
			.on('click', d => console.log(d))

		simulation.nodes(data)
			.on('tick', ticked)

		function ticked() {
			svg.selectAll('circle')
				.attr('cx', d => d.x)
				.attr('cy', d => d.y);

			svg.selectAll('text')
				.attr('dx', d => d.x)
				.attr('dy', d => d.y);
		}
	}

	function isNewData(a, b) {
		if (a.length !== b.length) { return true };

		for (let i = 0; i < a.length; i += 1) {
			if (a[i].text === b[i].text && a[i].volume !== b[i].volume) {
				reRenderNode(b[i]);

			} else if (a[i].text !== b[i].text) {
				return true;
			};
		}
		return false;
	}
})();

function reRenderNode(element) {
	console.log('rerender!');

	var simulation = d3.forceSimulation()
		.force('x', d3.forceX(0).strength(.1))
		.force('Y', d3.forceY(0).strength(.1))
		.force('collide', d3.forceCollide(d => radiusScale(d.volume)))

	var radiusScale = d3.scaleSqrt().domain([0, 10]).range([0, 50]);
		

	d3.select('#' + 'c' + element.text)
		.attr('fill', 'red')
		.attr('r', radiusScale(element.volume))

}