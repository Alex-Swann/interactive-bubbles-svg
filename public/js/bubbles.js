'use strict';

var container = document.getElementById('root');
var width = container.offsetWidth * 2;
var height = container.offsetHeight;

var nodes;
var svg;
var radiusScale;
var xScale;
var simulation;
var clickTime;

var i = 0;
var data = [];
var maxBubbles = 150;
var differentBubbleSizes = 10;
var minBubbleSize = 3;
var instruments = ['focus', 'chill', 'violin', 'guitar', 'reflect', 'piano', 'zen'];
var isDown = false;
var dragStarted;
var audio;
var moodMusicObj = {
  focus: 'audio/earth_prelude.mp3',
  chill: 'audio/gypsy.mp3',
  violin: 'audio/verve.mp3',
  guitar: 'audio/tamacun.mp3',
  reflect: 'audio/teardrop.mp3',
  piano: 'audio/the_piano.mp3',
  zen: 'audio/enya_oricono_flow.mp3'
};

while (i < maxBubbles) {
  var randomRelevance = Math.round((Math.random() * (differentBubbleSizes - 1)) + minBubbleSize);
  var item = instruments[Math.round(Math.random() * (instruments.length - 1))];
  data.push({ 'name': i.toString(), 'displayName': item, 'relevance': randomRelevance });
  i++;
}

function ticked() {
  nodes = svg.selectAll('g')
    .data(data, d => d.name);

  var circles = nodes.enter()
    .append('g');

  circles
    .append('circle')
    .attr('r', d => radiusScale(d.relevance))
    .attr('data-name', d => d.name)
    .attr('id', d => 'name-' + d.name);

  circles.call(d3.drag()
     .on("start", startDrag)
     .on("drag", dragging)
     .on("end", endDrag));

  circles
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('class', 'bubble_text')
    .attr('id', d => 'text-' + d.name)
    .attr('style', d => `font-size: ${(d.relevance * 1.5) + 18}px;`)
    .text(d => d.displayName)
    .attr('data-name', d => d.name);

  circles.merge(nodes)
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  circles
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
}

function restart(factor, callback) {
  setTimeout(() => {
    simulation.nodes(data).alpha(factor).restart();
    if (callback) {
      callback();
    }
  }, 0);
}

function startDrag(d) {
  clickTime = Date.now();

  dragStarted = setTimeout(function() {
    var index = data.findIndex(e => e.name === d.name);
    var selectedCircle = d3.select('#name-' + data[index].name);
    var selectedText = d3.select('#text-' + data[index].name);

    var r = 0.1;
    var randomMaxRevelance = Math.round(Math.random() * 20) + 40;

    isDown = setInterval(function() {
      if (data[index].relevance < randomMaxRevelance) {
        data[index].relevance += r;

        var relevance = data[index].relevance;

        function updateCircle() {
          selectedCircle.attr('r', d => radiusScale(relevance));
          selectedText.attr('style', `font-size: ${(relevance * 1.5) + 18}px;`);
        }

        restart(1, updateCircle);
      } else {
        data.splice(index, 1);

        nodes = svg.selectAll('g')
          .data(data, d => d.name);

        nodes.exit()
          .select('text')
          .remove();
        nodes.exit()
          .select('circle')
          .transition().duration(400)
          .attr('r', '0')
          .remove();

        restart(3);
      }
    }, 5);
  }, 1000);

  if (!d3.event.active) simulation.alphaTarget(.03).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragging(d) {
  clearTimeout(dragStarted);
  clearInterval(isDown);

  d.fx = d3.event.x;
  d.fy = d3.event.y;
  simulation.nodes(data).alpha(d.relevance / 4).restart();
}

function endDrag(d) {
  clearTimeout(dragStarted);
  clearInterval(isDown);

  if (Date.now() - clickTime < 400) {
    var index = data.findIndex(e => e.name === d.name);
    data.splice(index, 1);

    if (audio) {
      audio.pause();
    }
    var audioStr = moodMusicObj[d.displayName];
    audio = new Audio(audioStr);
    audio.play();

    nodes = svg.selectAll('g')
      .data(data, d => d.name);

    nodes.exit()
      .select('text')
      .remove();
    nodes.exit()
      .select('circle')
      .transition().duration(400)
      .attr('r', '0')
      .remove();

    restart(3);
  }

  if (!d3.event.active) simulation.alphaTarget(.03);
  d.fx = null;
  d.fy = null;
}

function setup() {
  radiusScale = d3.scaleSqrt()
    .domain([0, 1])
  	.range([0, 20]);

  xScale = d3.scaleLinear()
    .domain([0, data.length])
    .range([100, width * 10]);

  svg = d3.select('#root')
    .append('svg')
    .attr('class', 'bubbles')
    .attr('id', 'bubbles')
    .attr('viewBox', '0 0 400 400')
    .append('g');

  simulation = d3.forceSimulation(data)
    .force('charge', d3.forceManyBody().strength(2))
    .force('center', d3.forceCenter(width / 5, height / 4))
    .force('collision', d3.forceCollide().strength(1).radius(d => radiusScale(d.relevance) + 1))
    .on('tick', ticked);
}

setup();
