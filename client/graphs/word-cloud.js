//can't use iffy b/c stops recording

  var socket = wsEvents(new WebSocket('ws://localhost:3000'));

  //get data from socket and store it in freq
  var freq = [{"text":"your","size": 10},{"text":"the","size": 20},{"text":"at","size": 10}];

  function includes(word){
    return freq.some(obj => {
      return obj.text === word;
    })
  }
  //socket gets defined from audio.js file
  socket.on('send audioData', (data) => {
    console.log('DATA RECEIVED', Date.now());
    //if word is in freq arr, then add 1; if not add it
    data.split(' ').forEach(word => {
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
    
    let fillColor = d3.scaleOrdinal(d3.schemeCategory20);
    let w = 1200;
    let h = 500;

    cloud()
      .size([w, h])
      .words(freq) 
      .padding(25)
      .rotate(0)      
      .font("Impact")
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
          .style("font-family", "Impact")
          .style("fill", function(d, i) { return fillColor(i); })
          .attr("text-anchor", "middle")
          .attr("transform", function(d,i) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
        .text(function(d) { return d.text; });
    }

  })

// })()