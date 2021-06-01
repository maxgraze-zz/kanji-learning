
//loader

const loader = document.querySelector('#tofukozu');
const references = document.querySelector('#references');
const legend = document.querySelector('#legend');


function display() {
    references.classList.add('display-off');
    legend.classList.add('display-off');
    legend.classList.add('flex');

}

function hideLoading() {
    loader.classList.add('display-off');
    references.classList.remove('display-off');
    legend.classList.remove('display-off');
}
display();

//needs to be wrapped in an async function due to the async call
async function draw() {
    let data = await joinData().then(d => {
        hideLoading();
        
        return Object.entries(d).map(([key, value]) => value).filter(d => d.readings && d.readings.length >= 2).filter(d => d);
    });
    data.slice(1709, -1);
//get some important numbers
    let knownCharacters = data.filter(d => d.stats).length;
    let unknownCharacters = data.filter(d => !d.stats).length;
    let totalWanikani = data.length;
    let unknownKanji = '#E8E8E8';

    hideLoading();
//set up dimensions 
    const width = 800;
    let dimensions = {
        width: width,
        height: width,
        radius: width / 2,

        margin: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10,
        },
    };
    dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right;
    dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom;
    dimensions.boundedRadius = dimensions.radius
    - ((dimensions.margin.left + dimensions.margin.right) / 2);
  // 3. Draw canvas

    const wrapper = d3.select('#wrapper')
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);

    const bounds = wrapper.append('g')
        .style('transform', `translate(${
            dimensions.margin.left + dimensions.boundedRadius
        }, ${
            dimensions.margin.top + dimensions.boundedRadius
        })`);


      // Spiral Setup //
    const spacing = .2,
        density = .6,
        numSpirals = 80,
        innerRadius = 50,
        radiusWidth = 40;


    const theta = function(r) {
        return numSpirals * Math.PI * r;
    };

      // used to assign nodes color by group
    const color = d3.scaleSequential(d3.interpolateGnBu)
        .domain([0, 100]);

    const colorAccessor = d => d.stats.percentage_correct;

    const r = d3.max([dimensions.boundedWidth, dimensions.boundedWidth]) / 2 - radiusWidth;

    const radius = d3.scaleLinear()
        .domain([density, spacing])
        .range([innerRadius, r]);

    const points = d3.range(spacing, density + 0.001, (density - spacing) / 1000);

    const spiral = d3.radialLine()
        .curve(d3.curveCardinal)
        .angle(theta)
        .radius(radius);

  
    let pathGroup = bounds.append('g')
        .attr('transform', `translate(${dimensions.boundedWidth / 2 }, ${dimensions.boundedHeight / 2 })`);
    const path = pathGroup
        .append('defs') //allows you to replace the textPath with the spiral. Commenting it out = spiral + text
        .append('path')
        .datum(points)
        .attr('id', 'spiral')
        .attr('d', spiral)
        .style('fill', 'none')
        .style('stroke', 'lightGray');


    const text = pathGroup.selectAll('.characters')
        .data(data)
        .join('text')
        .attr('class', 'characters')
        .attr('text-anchor', 'end')
        .append('textPath')
        .attr('href', `#spiral`)
        .style('fill', d => !d.stats ? unknownKanji : color(colorAccessor(d)))
        .attr('dy', -3)
      //need i to be the last one in the series 
        .attr('startOffset', (d, i) => i * 15);
  
    text.transition()
        .delay((d, i) => i * 30) 
        .duration(8000)
        .text((d, i) => d.slug);


    const countGroup = bounds.append('g')
        .attr('transform', `translate(${dimensions.boundedWidth / 2 - 16}, ${dimensions.boundedHeight / 2 - 6})`);


    const count = countGroup
      //.datum(characters)
        .append('text')
        .attr('class', 'count')
        .attr('text-anchor', 'start')
        .attr('fill', 'rgb(8, 64, 129)');

    count.transition()
        .duration(20000)
        .ease(d3.easeLinear)
        .textTween(() => t => d3.interpolateRound(0, knownCharacters)(t));
      
    const total = countGroup
        //.datum(characters)
        .append('text')
        .attr('id', 'total')
        .attr('text-anchor', 'start')
        .attr('font-size', 'medium')
        .attr('fill', 'rgb(8, 64, 129)')
        .text(totalWanikani);

    const slash = countGroup
        //.datum(characters)
        .append('text')
        .attr('id', 'slash')
        .attr('text-anchor', 'start')
        .attr('fill', 'rgb(8, 64, 129)')
        .text('/');
       
}

draw();
// gsap.registerPlugin(ScrollTrigger);
// gsap.registerPlugin(TextPlugin);

// let data = async function() {
//     let data = await joinData();
//     return data;
// }(); 
