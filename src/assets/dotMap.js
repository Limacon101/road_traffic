
import * as d3 from 'd3';


class TrafficPie {
    
    constructor(options) {
        this.element = options.root;
        this.root = options.root;
        this.data = options.data;

        this.margin = {top: 5, right: 5, bottom: 5, left: 5};
        this.width = 120;
        this.height = 120;

        this.init();
    }

    init() {
        const w = this.width - this.margin.left - this.margin.right;
        const h = this.height - this.margin.top - this.margin.bottom;
        this.rad = Math.min(w, h) / 2;

        console.log(d3.select('#tooltip'));

        this.svg = d3.select('#tooltip')
            .append('svg')
            .classed('pie', true)
            .attr('width', this.width)
            .attr('height', this.height)
            .append('g')
            .attr('transform', `translate(${w/2 + this.margin.left},${h/2 + this.margin.top})`);
    }

    getPieColourScale() {
        return d3.scaleOrdinal()
        .domain(Object.keys(this.data))
        .range(d3.schemeDark2);
    }

    draw(data) {
        this.data = data;
        this.colourScale = this.getPieColourScale();

        this.pie = d3.pie()
            .value(d => d.value);
        const pieData = this.pie(d3.entries(this.data));

        let arcs = this.svg.selectAll('.arc')
            .data(pieData, d => d);

        d3.selectAll('.piearc').remove();
        arcs.enter().append('path')
            .attr('d', d3.arc()
                .innerRadius(this.rad * 0.5)
                .outerRadius(this.rad))
            .attr('fill', d => this.colourScale(d.data.key))
            .attr('stroke', 'white')
            .style('stroke-width', '1px')
            .style('opacity', 0.8)
            .attr('class', 'piearc')
    }
}

class DotMap {

  constructor(options) {
    this.element = options.root;
    this.root = options.root;
    this.data = options.data;

    this.margin = {top: 10, right: 10, bottom: 10, left: 10};
    this.width = 720;
    this.height = 480;
    this.circleRad = 3;
  }

  draw() {
    let w = this.width - this.margin.right - this.margin.left;
    let h = this.height - this.margin.top - this.margin.bottom;

    this.createButtons();

    this.svg = this.root
      .append('div')
      .classed('svg-container', true)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .classed('svg-content', true)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);


    let xScale = d3.scaleLinear()
      .domain([d3.min(this.data, d => +d.easting), d3.max(this.data, d => +d.easting)])
      .range([0, w]).nice();

    let yScale = d3.scaleLinear()
      .domain([d3.min(this.data, d => +d.northing), d3.max(this.data, d => +d.northing)])
      .range([h, 0]).nice();

    this.setColourScale('all_motor_vehicles');

    this.circles = this.svg.selectAll('g')
      .data(this.data)
      .enter().append('g')
      .append('circle')
      .attr('cx', d => xScale(d.easting))
      .attr('cy', d => yScale(d.northing))
      .attr('r', this.circleRad)
      .attr('fill', d => this.colourScale(d.all_motor_vehicles))
      .on('mouseover', this.onMouseOver.bind(this))
      .on('mouseout', this.onMouseOut.bind(this));

    this.tooltip = d3.select('.viz').append('div')
      .attr('id', 'tooltip')
      .style('opacity', 0)
      .attr('class', 'tooltip');

    this.tooltipText = this.tooltip.append('p')
        .classed('tooltip-text', true);

    this.dots = new TrafficPie({
        root: d3.select('#tooltip'),
        data: this.getTabNames(false),
    })

    this.updateTabColours(this.dots.getPieColourScale());
  }

  getTabNames(includeAllTraffic=true) {
      let names = {
        'Bicycles': 'pedal_cycles',
        'Motorcycles': 'two_wheeled_motor_vehicles',
        'Cars & Taxis': 'cars_and_taxis',
        'Buses & Taxis': 'buses_and_coaches',
        'Trucks': 'lgvs',
      };
      if (includeAllTraffic) {
          return Object.assign({'All Traffic': 'all_motor_vehicles'}, names);
      }

      return names;
  }

  createButtons() {
    this.tabNames = this.getTabNames();
    this.buttons = this.element
      .append('div')
      .classed('button-tabs', true)
      .selectAll('button')
      .data(Object.keys(this.tabNames)).enter()
      .append('button')
      .classed('button-tab', true)
      .classed('active', d => d === 'All Traffic')
      .text(d => d)
      .on('click', this.tabPressed.bind(this));
  }

  updateTabColours(colourScale) {
      this.buttons.style('color', d => colourScale(d))
        .style('border-left', d => `5px solid ${colourScale(d)}`);
  }

  onMouseOver(d, i, nodes) {
    let roadName = '';
    let mousedOver = d3.select(nodes[i]).each(d => roadName = d['road_name']);

    d3.selectAll(nodes)
      .filter(d => d['road_name'] === roadName)
      .style('stroke', 'red')
      .style('stroke-width', 2)
      .style('r', this.circleRad + 2);

    mousedOver.style('stroke', 'black')
      .style('stroke-width', 2)
      .style('r', this.circleRad * 2);

    const html = `Road: ${d['road_name']}<br>Traffic count: ${d['all_motor_vehicles']}`
    this.tooltip.style('opacity', 1);
    this.tooltipText.html(html);

    this.drawPie(mousedOver.datum());
  }

  drawPie(nodeData) {
    let pieData = {};
    Object.keys(this.getTabNames(false)).map(name => {
        pieData[name] = nodeData[this.tabNames[name]];
    });

    this.dots.draw(pieData);
  }

  onMouseOut(_, i, nodes) {
    d3.select(nodes[i])
      .style('stroke', 'none')
      .style('r', this.circleRad);
    this.tooltip.style('opacity', 0.7);

    let roadName = '';
    d3.select(nodes[i]).each(d => roadName = d['road_name']);
    d3.selectAll(nodes)
      .filter(d => d['road_name'] === roadName)
      .style('stroke', 'none')
      .style('r', this.circleRad);
  }

  setColourScale(trafficTypeKey) {
    this.colourScale = d3.scaleSequential(d3.interpolateInferno)
      .domain([d3.max(this.data, d => +d[trafficTypeKey]), d3.min(this.data, d => +d[trafficTypeKey])]);
  }

  tabPressed(key, i, nodes) {
    this.setColourScale(this.tabNames[key]);
    d3.selectAll(nodes)
      .classed('active', (d, ind) => i === ind);
    this.circles
      .transition()
      .attr('fill', d =>  this.colourScale(d[this.tabNames[key]]));
  }

}

export default DotMap;