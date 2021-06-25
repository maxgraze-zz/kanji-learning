
//loader

const loader = document.querySelector('#tofukozu');
const references = document.querySelector('#references');
let countColor = '#BF846F';

function display() {
    references.classList.add('display-off');


}

function hideLoading() {
    loader.classList.add('display-off');
    references.classList.remove('display-off');
}
display();

//needs to be wrapped in an async function due to the async call
async function draw() {
    let data = await joinData().then(d => {
        hideLoading();
        
        return Object.entries(d).map(([key, value]) => value);
        // return Object.entries(d).map(([key, value]) => value).filter(d => d.readings && d.readings.length >= 2).filter(d => d);
    });
    // data.slice(1709, -1);
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
            top: 0,
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

    const annotations = [
        {
            id: 'known kanji',
            type: d3.annotationCallout, //d3.annotationCalloutCurve, // this type of annotation lets you used a curved connector.
            note: {
                title: 'Known kanji',
            },
            color: '#bf4e4e',
            x: 620,
            y: 110,
            dx: 53,
            dy: -47, 
        },
        // {
        //     id: 'less known kanji',
        //     note: {
        //         title: 'Know, but not as well',
        //     },
        //     color: ' #BF846F',
        //     // color: ' rgb(140, 200, 215)',
        //     x: 580,
        //     y: 695,
        //     dx: 53,
        // },
     
    ];
      
      // Add annotation to the chart
    const makeAnnotations = d3.annotation()
        .annotations(annotations);
   
      

        
  // 3. Draw canvas

    const wrapper = d3.select('#wrapper')
        .append('svg')
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);

    const bounds = wrapper.append('g')
        .style('transform', `translate(${
            dimensions.margin.left 
        }, ${
            dimensions.margin.top 
        })`);


             
    bounds
        .append('g')
        .call(makeAnnotations);
    
    bounds.append('text')
        .attr('transform', `translate(10, ${dimensions.boundedWidth - 50})`)
        .text(`Kanji I don't know`)
        .attr('fill', 'rgb(191 191 191)');

      // Spiral Setup //
    const spacing = .2,
        density = .6,
        numSpirals = 80,
        innerRadius = 10,
        radiusWidth = 40;


    const theta = function(r) {
        return numSpirals * Math.PI * r;
    };

      // used to assign nodes color by group
    const color = d3.scaleLinear(d3.interpolateLab)
        // .interpolate(d3.interpolateLab)
        .range(['whitesmoke', '#bf4e4e'])
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
        .attr('startOffset', (d, i) => i * 12);
  
    text.transition()
        .delay((d, i) => i * 35) 
        .duration(8000)
        .text((d, i) => d.characters);


    const countGroup = bounds.append('g')
        .attr('transform', `translate(${dimensions.boundedWidth / 2 - 22}, ${dimensions.boundedHeight / 2 - 8})`);


    const count = countGroup
      //.datum(characters)
        .append('text')
        .attr('class', 'count')
        .attr('text-anchor', 'start')
        .attr('fill', countColor);
        // .attr('fill', 'rgb(8, 64, 129)');

    count.transition()
        .duration(31500)
        .ease(d3.easeLinear)
        .textTween(() => t => d3.interpolateRound(0, knownCharacters)(t));
      
    const total = countGroup
        //.datum(characters)
        .append('text')
        .attr('id', 'total')
        .attr('text-anchor', 'start')
        .attr('font-size', 'medium')
        .attr('fill', countColor)
        // .attr('fill', 'rgb(8, 64, 129)')
        .text(totalWanikani);

    const slash = countGroup
        //.datum(characters)
        .append('text')
        .attr('id', 'slash')
        .attr('text-anchor', 'start')
        .attr('fill', countColor)
        // .attr('fill', 'rgb(8, 64, 129)')
        .text('/');
       
}

draw();
// gsap.registerPlugin(ScrollTrigger);
// gsap.registerPlugin(TextPlugin);

// let data = async function() {
//     let data = await joinData();
//     return data;
// }(); 
