//can't use iffy b/c stops recording

  var ws = wsEvents(new WebSocket('ws://localhost:3000'));

  let dataObj = {};

  socket.on('send custom', (emitData) => {
    for (let key in emitData) {
      dataObj[key] = emitData[key]
    }
  });

  //get data from socket and store it in freq
  var freq = [{"text":"your","size": 10},{"text":"the","size": 20},{"text":"at","size": 10}];

  function includes(word){
    return freq.some(obj => {
      return obj.text === word;
    })
  }
  //socket gets defined from audio.js file
  ws.on('sendAudioData', (data) => {
    console.log('DATA RECEIVED', Date.now());
    //if word is in freq arr, then add 1; if not add it
    data.split(' ').forEach(word => {
      word = word.toLowerCase();
      freq.forEach(obj => {
        if (obj.text === word) {
          obj.size += 20;
        }
        if (!includes(word)) {
          freq.push(
            {text: word, size: 20}
          )
        }
      })
    });



  //--------------------CREATE GRAPH----------------------------------
    //d3 version 3 way of adding color;
    //let fillColor = d3.scale.category20b();
    let color = d3.scaleLinear()
      .domain(dataObj.colorDomain)
      .range(dataObj.colors);

    let fillColor = d3.scaleOrdinal(d3.schemeCategory20);
    let w = dataObj.width;
    let h = dataObj.height;

    cloud()
      .size([w, h])
      .words(freq) 
      .padding(dataObj.padding)
      .rotate(dataObj.rotate)      
      .font(dataObj.font)
      .fontSize(function(d) { return d.size; })
      .on("end", drawCloud)
      .start();

    function drawCloud(words) {
      //remove so doesn't make multiple word clouds
      d3.select("#wordCloud").remove()
      
      d3.select("#word-cloud").append("svg")
          .attr('id', 'wordCloud')
          .attr("width", w)
          .attr("height", h)
        .append("g")
        .attr("transform", "translate(" + w/2 + "," + h/2 + ")")
        .selectAll("text")
          .data(words)
          .enter().append("text")
          .style("font-size", function(d) { return (d.size) + "px"; })
          .style("font-family", dataObj.font)
          .style("fill", function(d, i) { return color(i); })
          .attr("text-anchor", "middle")
          .attr("transform", function(d,i) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
        .text(function(d) { return d.text; });
    }

  })

// })()