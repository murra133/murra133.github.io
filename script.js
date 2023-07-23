var scene = "Global";
var exclusions =new Set();

// Dataset from Json
async function loadData(){
    const response = await fetch("data.json");
    const data = await response.json();
    return data;
}

function resizeGraph(action){
    if(action == "drilldown"){
        updateDrillDown()
    }
    else{
        updateGraph(did("now").innerHTML)
    }
}

// Removes all child nodes
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function did(id){
    return document.getElementById(id);
}

function flipButtons(truth){
    if(truth){
        did("prev").setAttribute("style","display:none");
        did("next").setAttribute("style","display:none");
        did("now").setAttribute("style","display:none");
        did("back").removeAttribute("style");
        did("body").setAttribute("onresize","resizeGraph('drilldown')")
    }
    else{
        did("prev").removeAttribute("style");
        did("next").removeAttribute("style");
        did("now").removeAttribute("style");
        did("back").setAttribute("style","display:none");
        did("body").setAttribute("onresize","resizeGraph('normal')")
    }
}


// Popup window for more information
function popup(element){
    d3.select('#popup'+element.id).style("display","block");
}
function onpup(element){
    d3.select('#popup'+element.id).style("display","none");
}

// Update the values of the graph to a new year
async function ChangeTime(action){
    let element = did(action);
    let year = parseInt(element.innerHTML);
    let next = did("next");
    let now = did("now");
    let prev = did("prev");
    did("back").setAttribute("style","display:none");
    if(action=="prev"){
        next.innerHTML = year + 1;
        now.innerHTML = year;
        if(year==2000){
            prev.innerHTML = "None";
        }
        else{
            prev.innerHTML = year-1;
        }
    }
    if(action=="next"){
        prev.innerHTML = year - 1;
        now.innerHTML = year;
        if(year==2019){
            next.innerHTML = "None";
        }
        else{
            next.innerHTML = year + 1;
        }
    }
    if(prev.innerHTML == "None") {
        prev.setAttribute("style","opacity:0;");
        prev.removeAttribute("onclick")}
    else{
        prev.setAttribute("style","opacity:1;");
        prev.setAttribute("onclick","ChangeTime('prev')")
    } 
    if(next.innerHTML == "None"){
        next.setAttribute("style","opacity:0;");
        next.removeAttribute("onclick")}
    else {
        next.setAttribute("style","opacity:1;");
        next.setAttribute("onclick","ChangeTime('next')")
    }
    updateGraph(year)
}

//Gets max values for the current dataset
function getMaxVals(data,year){
    var keys_ = Object.keys(data);
    let i1 = keys_.indexOf('maxVal');
    if(i1>=0){
        keys_.splice(i1,1);
    }
    let mAll = 0;
    let mfem = 0;
    let mmal = 0;
    let mGDP = 0;
    for(let key of keys_){
        if(!exclusions.has(key)){
            mAll = Math.max(mAll,parseFloat(data[key]['all'][year]));
            mfem = Math.max(mfem,parseFloat(data[key]['female'][year]));
            mmal = Math.max(mmal,parseFloat(data[key]['male'][year]));
            mGDP = Math.max(mGDP,parseFloat(data[key]['GDP'][year]));
            // for(let i = 0; i < 20;i++){
            //     mAll = Math.max(mAll,parseFloat(data[key]['all'][String(2000+i)]));
            //     mfem = Math.max(mfem,parseFloat(data[key]['female'][String(2000+i)]));
            //     mmal = Math.max(mmal,parseFloat(data[key]['male'][String(2000+i)]));
            //     mGDP = Math.max(mGDP,parseFloat(data[key]['GDP'][String(2000+i)]));
            // }
        }
    }
    return [mAll,mfem,mmal,mGDP];
}

// Updates the current graph
async function updateGraph(year){
    // Load Data
    var data = await loadData();
    var keys_ = Object.keys(data);
    let i1 = keys_.indexOf('maxVal');
    keys_.splice(i1,1);
    // Declare the chart dimensions and margins.
    var w = window.innerWidth;
    var h = window.innerHeight;
    const width = w;
    const height = 2*h/3;
    const marginTop = h/20;
    const marginRight = h/6;
    const marginBottom = h/20;
    const marginLeft = w/5;
    let maxes = getMaxVals(data,year);
    let mall = maxes[0];
    let mfem = maxes[1];
    let mmal = maxes[2];
    let mGDP =maxes[3]
    // Declare the x (horizontal position) scale.
    const x = d3.scaleLinear()
        .domain([0,Math.ceil(parseFloat(mmal))])
        .range([0,3*w/5]);

    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear()
        .domain([0, Math.ceil(parseFloat(mfem))])
        .range([height-marginBottom-marginTop,0]);

    const r = d3.scaleLinear()
            .domain([0,Math.ceil(parseFloat(mGDP))])
            .range([5,50])
    
    const svg = d3.select('#graphCanvas');
    svg.attr("width", width).attr("height", height);

    // Update Graph
    // X Axis
    svg.selectAll("g.xaxis").attr("transform", `translate(${marginLeft},${height - marginBottom})`).call(d3.axisBottom(x));
    svg.select('#xlabel').attr("x", width/2+140).attr("y", height).text("Suicide Rate for 100,000 Man on Year "+year);
    // Y Axis
    svg.selectAll("g.yaxis").attr("transform", `translate(${marginLeft},${marginTop})`).call(d3.axisLeft(y));
    svg.select('#ylabel').attr("y", marginLeft-40).attr("x", -height/4).text("Suicide Rate for 100,000 Woman on Year "+year)

    //Title
    svg.select("#title").attr("y", marginTop).attr("x", width/2-marginLeft/2).text("Global Female Against Male Suicide Rates for "+year)
    
    //Legend
    d3.select("#legend").style("left",width-marginLeft*1.5+"px").style("top",2*marginTop+"px");

    //Update the data 
    svg.select(".graph").attr("transform", `translate(${marginLeft},${height - marginBottom})`).
    selectAll('circle').data(keys_).attr('cx',function(d,i){return x(parseInt(data[d]['male'][year]))})
    .attr('cy',function(d,i){return height - marginTop - marginBottom - y(- parseInt(data[d]['female'][year]))}).attr('r',function(d){return r(parseInt(data[d]['GDP'][year]))});

    d3.select("#popupBoxes").selectAll('div').data(keys_).style('left',function(d){return marginLeft + x(parseInt(data[d]['male'][year]))+1.5*r(parseInt(data[d]['all'][year]))+"px"})
    .style('top',function(d,i){return height*1.65 - r(-parseInt(data[d]['all'][year]))*1.5 - y(-parseInt(data[d]['female'][year]))+"px"})
    .html(function(d){return "<h5>"+d+"</h5><p>Combined Rate: "+data[d]['all'][year]+"</p><p>Male Rate: "+data[d]['male'][year]+"</p><p>Female Rate: "+data[d]['female'][year]+"</p>"});
}

// Create a brand new standard graph
async function createGraph(year){
    // Load Data
    var data = await loadData();
    flipButtons(false);
    var keys_ = Object.keys(data);
    let i1 = keys_.indexOf('maxVal');
    keys_.splice(i1,1);
    // Declare the chart dimensions and margins.
    var w = window.innerWidth;
    var h = window.innerHeight;
    const width = w;
    const height = 2*h/3;
    const marginTop = h/20;
    const marginRight = h/6;
    const marginBottom = h/20;
    const marginLeft = w/5;
    const container = document.getElementById("container")
    let maxes = getMaxVals(data,year);
    let mall = maxes[0];
    let mfem = maxes[1];
    let mmal = maxes[2];
    let mGDP = maxes[3];
    removeAllChildNodes(container);
    // Declare the x (horizontal position) scale.
    const x = d3.scaleLinear()
        .domain([0,Math.ceil(parseFloat(mmal))])
        .range([0,3*w/5]);

    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear()
        .domain([0, Math.ceil(parseFloat(mfem))])
        .range([height-marginBottom-marginTop,0]);

    // Declare radius scale
    const r = d3.scaleLinear()
            .domain([0,Math.ceil(parseFloat(mGDP))])
            .range([5,50])

    // Declare color scale
    const color = d3.scaleOrdinal()
        .domain(["Oceania","Asia","Europe","Africa","Americas"])
        .range(["blue","red","green","yellow","purple"])

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id",'graphCanvas');

    // Create Popup boxes
    const popupBoxes = d3.create("div")
        .attr("id","popupBoxes")
        .style("position","absolute");

    // Create Legend
    const legend = d3.create("div")
        .attr("id","legend")
        .style("position","absolute")
        .style("left",width-marginLeft*1.5+"px")
        .style("top",marginTop*2+"px")
        .html("<h3>Legend:</h3><div>"+
            "<span style ='background-color:red'></span>"+
            "<p>Asia</p>"+
        "</div>"+
        "<div>"+
            "<span style ='background-color:green'></span>"+
            "<p>Europe</p>"+
       " </div>"+
        "<div>"+
            "<span style ='background-color:yellow'></span>"+
            "<p>Africa</p>"+
        "</div>"+
        "<div>"+
            "<span style ='background-color:purple'></span>"+
            "<p>America</p>"+
        "</div>"+
        "<div>"+
            "<span style ='background-color:blue'></span>"+
            "<p>Oceania</p>"+
        "</div>")

    // Add the x-axis.
    svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", `translate(${marginLeft},${height - marginBottom})`)
        .call(d3.axisBottom(x));

    // Add the y-axis.
    svg.append("g")
        .attr("class", "yaxis")
        .attr("transform", `translate(${marginLeft},${marginTop})`)
        .call(d3.axisLeft(y));
    // Add X axis label:
    svg.append("text")
        .attr("id","xlabel")
        .attr("text-anchor", "end")
        .attr("x", width/2+140)
        .attr("y", height)
        .style("font-size","1.1vw")
        .style("margin-top","5vh")
        .text("Suicide Rate for 100,000 Man on Year "+year);

    // Y axis label:
    svg.append("text")
        .attr("id","ylabel")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", marginLeft-40)
        .attr("x", -height/4)
        .style("font-size","1.5vh")
        .text("Suicide Rate for 100,000 Woman on Year "+year)

    // Title Label
    svg.append("text")
        .attr("id","title")
        .attr("text-anchor", "center")
        .attr("y", marginTop)
        .attr("x", width/2-marginLeft/2)
        .style("font-size","2vh")
        .text("Global Female Against Male Suicide Rates for "+year)

    //Add data to 
    svg.append('g').attr("class","graph").attr("transform", `translate(${marginLeft},${height - marginBottom})`)
    .selectAll('circle').data(keys_).enter().append('circle').attr('cx',function(d,i){return x(parseInt(data[d]['male'][year]))})
    .attr('cy',function(d,i){return height - marginTop - marginBottom-y( - parseInt(data[d]['female'][year]))}).attr('r',function(d){return r(parseInt(data[d]['GDP'][year]))})
    .attr('fill',function(d){return color(data[d]['region'])}).attr('stroke','black').attr('id',function(d){return d.split(" ").join("")}).attr('onclick','drillDown(this)').attr('oncontextmenu','elementExclude(this)')
    .attr("onmouseover", "popup(this)").attr("onmouseout","onpup(this)").style("display",function(d){
        if(exclusions.has(d)) return "none";
        else return "block"
    });

    // Create popup boxes
    popupBoxes.selectAll('div').data(keys_).enter().append('div').style('left',function(d){return marginLeft + x(parseInt(data[d]['male'][year]))+1.5*r(parseInt(data[d]['all'][year]))+"px"})
    .style('top',function(d,i){return  height*1.65 - r(-parseInt(data[d]['all'][year]))*1.5 - y(-parseInt(data[d]['female'][year]))+"px"}).attr('id',function(d){return "popup"+d.split(" ").join("")})
    .style("position","absolute").style("display","none").attr('class','popup')
    .html(function(d){return "<h5>"+d+"</h5><p>Combined Rate: "+data[d]['all'][year]+"</p><p>Male Rate: "+data[d]['male'][year]+"</p><p>Female Rate: "+data[d]['female'][year]+"</p>"})


    //Append the SVG element.
    container.append(popupBoxes.node())
    container.append(legend.node())
    container.append(svg.node());
}

//Drill down 
async function drillDown(element){
    // Load data
    flipButtons(true);
    var data = await loadData();
    var country = data[element.id];
    document.getElementById('back').setAttribute("onclick","createGraph('"+document.getElementById('now').innerHTML+"')")
    // Declare chart dimensions and margin
    var w = window.innerWidth;
    var h = window.innerHeight;
    const width = w;
    const height = 2*h/3;
    const marginTop = h/20;
    const marginRight = h/6;
    const marginBottom = h/20;
    const marginLeft = w/5;
    const container = document.getElementById("container")
    removeAllChildNodes(container);
    var m = 0;
    let years = Object.keys(country['all']);
    let da = [];
    let j = 0
    for(let year of years){
        da.push({});
        da[j]['year'] = parseInt(year);
        da[j]['all'] = parseFloat(country['all'][year])
        da[j]['female'] = parseFloat(country['female'][year])
        da[j]['male'] = parseFloat(country['male'][year])
        m = Math.max(m,da[j]['all'])
        m = Math.max(m,da[j]['female'])
        m = Math.max(m,da[j]['male'])
        years[j] = parseInt(year);
        j++;
    }
    m+=10;
    // Declare the x (horizontal position) scale.
    const x = d3.scaleLinear()
        .domain([parseInt(years[0]),parseInt(years[years.length-1])])
        .range([0,3*w/5]);

    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear()
        .domain([0, Math.ceil(parseFloat(m))])
        .range([height-marginBottom-marginTop,0]);

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id",'graphCanvas')
        .attr("class",element.id);

    // Add the x-axis.
    svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", `translate(${marginLeft},${height - marginBottom})`)
        .call(d3.axisBottom(x))

    // Add the y-axis.
    svg.append("g")
        .attr("class", "yaxis")
        .attr("transform", `translate(${marginLeft},${marginTop})`)
        .call(d3.axisLeft(y));

    // Add X axis Label
    svg.append("text")
        .attr("id","xlabel")
        .attr("text-anchor", "end")
        .attr("x", width/2+6)
        .attr("y", height)
        .text("Year");

    // Add Y axis Label
    svg.append("text")
        .attr("id","ylabel")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", marginLeft-40)
        .attr("x", -height/3)
        .style('font-size','1.5vh')
        .text("Suicide Rate of 100,000 People")

    // Title Label
    svg.append("text")
        .attr("id","title")
        .attr("text-anchor", "center")
        .attr("y", marginTop)
        .attr("x", width/2-marginLeft/4)
        .style("font-size","2vh")
        .text("Female, Male, and All Suicide Rates for "+element.id);

    // Create Legend
    const legend = d3.create("div")
        .attr("id","legend")
        .style("position","absolute")
        .style("left",width-marginLeft*1.5+"px")
        .style("top",marginTop*2+"px")
        .html("<h3>Legend:</h3><div>"+
            "<span style ='background-color:blue'></span>"+
            "<p>Male Rates</p>"+
        "</div>"+
        "<div>"+
            "<span style ='background-color:red'></span>"+
            "<p>Female Rates</p>"+
       " </div>"+
        "<div>"+
            "<span style ='background-color:black'></span>"+
            "<p>Combined Rates</p>"+
        "</div>")

    // Create all line
    const all_line = d3.line().x((d)=> x(d.year)).y((d)=>y(d.all));

    // Create female line
    const fem_line = d3.line().x((d)=> x(d.year)).y((d)=>y(d.female));

    // Create male line
    const male_line = d3.line().x((d)=> x(d.year)).y((d)=>y(d.male));
    //Add data to 
    svg.append('g').attr("id","all_line").attr("transform", `translate(${marginLeft},${0})`)
    .selectAll('.line').append("g").data(da).enter().append('path').attr('d',all_line(da))
    .attr("stroke", "black").attr('fill','None');

    svg.append('g').attr("id","fem_line").attr("transform", `translate(${marginLeft},${0})`)
    .selectAll('.line').append("g").data(da).enter().append('path').attr('d',fem_line(da))
    .attr("stroke", "red").attr('fill','None');

    svg.append('g').attr("id","male_line").attr("transform", `translate(${marginLeft},${0})`)
    .selectAll('.line').append("g").data(da).enter().append('path').attr('d',male_line(da))
    .attr("stroke", "blue").attr('fill','None');
    // Append the SVG element.
    container.append(legend.node());
    container.append(svg.node());
}

async function updateDrillDown(){
    const svg = d3.select("#graphCanvas");
    var data = await loadData();
    const country = data[svg.attr("class")];
    // Declare chart dimensions and margin
    var w = window.innerWidth;
    var h = window.innerHeight;
    const width = w;
    const height = 2*h/3;
    const marginTop = h/20;
    const marginRight = h/6;
    const marginBottom = h/20;
    const marginLeft = w/5;
    var m = 0;
    let years = Object.keys(country['all']);
    let da = [];
    let j = 0
    for(let year of years){
        da.push({});
        da[j]['year'] = parseInt(year);
        da[j]['all'] = parseFloat(country['all'][year])
        da[j]['female'] = parseFloat(country['female'][year])
        da[j]['male'] = parseFloat(country['male'][year])
        m = Math.max(m,da[j]['all'])
        m = Math.max(m,da[j]['female'])
        m = Math.max(m,da[j]['male'])
        years[j] = parseInt(year);
        j++;
    }
    m+=10;
    // Declare the x (horizontal position) scale.
    const x = d3.scaleLinear()
        .domain([parseInt(years[0]),parseInt(years[years.length-1])])
        .range([0,3*w/5]);

    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear()
        .domain([0, Math.ceil(parseFloat(m))])
        .range([height-marginBottom-marginTop,0]);

    // Add the x-axis.
    d3.select("g.xaxis")
        .attr("transform", `translate(${marginLeft},${height - marginBottom})`)
        .call(d3.axisBottom(x))

    // Add the y-axis.
    d3.select("g.yaxis")
        .attr("transform", `translate(${marginLeft},${marginTop})`)
        .call(d3.axisLeft(y));

    //Title
    svg.select("#title").attr("y", marginTop).attr("x", width/2-marginLeft/4);

    // xlabel
    svg.select('#xlabel').attr("x", width/2+6).attr("y", height);
    
    // y label
    svg.select('#ylabel').attr("y", marginLeft-40).attr("x", -height/3);

    // Update svg
    svg.attr("width", width).attr("height", height);

    //Legend
    d3.select("#legend").style("left",width-marginLeft*1.5+"px").style("top",2*marginTop+"px");

    // Create all line
    const all_line = d3.line().x((d)=> x(d.year)).y((d)=>y(d.all));

    // Create female line
    const fem_line = d3.line().x((d)=> x(d.year)).y((d)=>y(d.female));

    // Create male line
    const male_line = d3.line().x((d)=> x(d.year)).y((d)=>y(d.male));
    //Add data to 
    svg.select("#all_line").attr("transform", `translate(${marginLeft},${0})`)
    .selectAll("path").attr('d',all_line(da))
    .attr("stroke", "black").attr('fill','None');

    svg.select("#fem_line").attr("transform", `translate(${marginLeft},${0})`)
    .selectAll("path").attr('d',fem_line(da))
    .attr("stroke", "red").attr('fill','None');

    svg.select("#male_line").attr("transform", `translate(${marginLeft},${0})`)
    .selectAll("path").attr('d',male_line(da))
    .attr("stroke", "blue").attr('fill','None');
}   

//Exclusion of Element
function elementExclude(element){
    event.preventDefault();
    exclusions.add(element.id);
    element.setAttribute("style","display:none");
    let div = document.createElement("h5");
    div.innerHTML = element.id;
    div.setAttribute("onclick","elementInclude(this)");
    div.id = "e_"+element.id;
    did("exclusions").appendChild(div);
    updateGraph(did("now").innerHTML);
}

function elementInclude(element){
    exclusions.delete(element.innerHTML);
    did("exclusions").removeChild(element);
    did(element.innerHTML).removeAttribute("style");
    updateGraph(did("now").innerHTML);
    
}

$(document).ready(function() {
    createGraph('2000')
});