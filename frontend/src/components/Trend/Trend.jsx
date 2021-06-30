import React, { useState, useEffect,useRef } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import SideNavFirst from "../SideNav/SideNavFirst";
import { commaSeparated } from "../../utils.js";
import "./Trend.css";

import {
  scaleLinear,
  max,
  min,
  scaleTime,
  timeParse,
  timeFormat,
  line,
  select,
  axisLeft,
  axisBottom
} from 'd3';

const tickLength = 8;
let margin = {
  left: 50,
  top: 53,
  right: 10,
  bottom: 50,
};



const useResizeObserver = ref => {
  const [dimensions, setDimensions] = useState(null);
  useEffect(() => {
  if(typeof ref.current != 'undefined'){
    const observeTarget = ref.current;

    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        setDimensions(entry.contentRect);
      });
    });
    resizeObserver.observe(observeTarget);
    return () => {
      resizeObserver.unobserve(observeTarget);
    };
  }

  
  }, [ref.current]);
  return dimensions;
};
export const Trend = ({indicatorTrend, graphTitle, graphSubgroup, graphUnit, titleAreaName, toggleStateBurden,trend, selIndicator}) => { 

  const [data, setData] = useState(null);
  const svgRef = useRef();
  const [check,setCheck] = useState(true);

  const trendWrapper = useRef();
 
  const dimensions = useResizeObserver(trendWrapper);
  const screen = useFullScreenHandle();
  let colorScale;

  let arrObese = [91,95,104,92,96,105,21];
  if(selIndicator == 12 || selIndicator == 13)
    colorScale = '#a3c00f80'; 
  else if(selIndicator == 19 || selIndicator == 20)
    colorScale = '#e5393580'; 
  else if(selIndicator == 17 || selIndicator == 18)
    colorScale = '#039be580'; 
  else if(selIndicator == 107 || selIndicator == 108)
    colorScale = '#e5393580'; 
  else  if(arrObese.includes(selIndicator))
    colorScale = '#7b1fa280'; 
  else if(selIndicator == 123 || selIndicator == 26 || selIndicator == 125)
    colorScale = '#b71c1c80'; 
  else
    colorScale = '#eda14380'; 

  const parseTime = timeParse('%d-%b-%y');

	 
    const formatTime = timeFormat('%b-%y');
    const formatTooltipTime = timeFormat('%B-%Y');
    const formatTitleTime = timeFormat('%Y');


    

  useEffect(() => {
      let cleanData = [];
      indicatorTrend.map((d) => {
        if(typeof d.data_value != 'undefined'){
         	d.start_date = parseTime(d.start_date);
          d.end_date = parseTime(d.end_date);
          d["middle_date"] = new Date((d.start_date.getTime() + d.end_date.getTime())/2);
          d["timeperiod"] = d.timeperiod.split(" ")[0];
        	cleanData.push(d);
        }
      });
      

      cleanData = cleanData.sort(function (a, b) {  // sort the data according to start date.. specifically for AHS
        return a.start_date - b.start_date;
      });

      setData(cleanData);
  }, []);

  useEffect(()=>{
    select(".tooltipX").remove();
    let TOOLTIP_FONTSIZE;
    const svg = select(svgRef.current);
    let windowWidth = window.screen.width;
    let windowHeight = window.screen.height;

    if(windowWidth >= 480){
      windowWidth = windowWidth/2;
      windowHeight = windowHeight/2;
      TOOLTIP_FONTSIZE="12px";
    }else{
      windowWidth = windowWidth+100 ;
      windowHeight = windowHeight/2;
      TOOLTIP_FONTSIZE="8px";

    }

    var tooltipX = select("#trend_svg")
    .append("div")
    .attr("class", "tooltipX")
    .style("visibility", "hidden")
    .style("font-size",TOOLTIP_FONTSIZE)
 
    const { width, height } = {width:windowWidth,height:windowHeight}; 
console.log( width,height)  
   

  const aspect = (width / height);
  console.log(aspect)
    const adjustedHeight = Math.ceil(width / aspect);
    console.log(adjustedHeight)
    if(!toggleStateBurden)
      margin = {...margin, 'left':100}  // change left margin for burden
    else
      margin = {...margin,'left':50}
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    // console.log(width,adjustedHeight)
   
    
    svg.selectAll("*").remove();
    svg.attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox",  `0 0 ${width} ${adjustedHeight}`)
    
// svg.attr("width", width)
// .attr("height", height)
    let bar = svg.append('g')
      .attr("transform",`translate(${margin.left},${margin.top})`);



    if(data && data.length >0){

      let listofDate = [];
      data.map((d) => {
        listofDate.push(d.start_date);
        listofDate.push(d.end_date);
      });

      let min_d =  min(listofDate);
      let min_year = min_d.getFullYear();
      let min_month = min_d.getMonth();
      let min_day = min_d.getDate();
      let min_date = new Date(min_year, min_month-3, min_day);

      let max_d =  max(listofDate);
      let max_year = max_d.getFullYear();
      let max_month = max_d.getMonth();
      let max_day = max_d.getDate();
      let max_date = new Date(max_year, max_month+6, max_day);

      const xValue = d => d.middle_date;
      let yValue,maxVal;
      if(toggleStateBurden){
        yValue = d => d.data_value;
        maxVal = max(data, (d) => yValue(d));
        maxVal = maxVal + maxVal/7;
      }
      else
      {
      yValue = d => d.data_value_num;
      maxVal = max(data, (d) => yValue(d));
      maxVal = maxVal + maxVal/7;
      margin = {...margin, 'left':100}
      console.log(margin)
      graphUnit ='Number';
      }

      const xScale = scaleTime()
    		.domain([min_date, max_date])
    		.range([0, innerWidth])
      
    	const yScale = scaleLinear()
   	 		.domain([0, maxVal])
    		.range([innerHeight, 0]);
      
      //  bar.append("text")
      //   .attr('x',width/2 -90)
      //   .attr('y',0)
      //   .style("text-anchor","middle")
      //   .style("font-size","13px")
      //   .style("font-weight","bold")
      //   .attr("dy", "-2em")
      //   .text(`${graphTitle}, ${titleAreaName} ${formatTitleTime(min_date)}-${formatTitleTime(max_date)}`)
      
        
      bar.append("g")
      	.attr("class","axis")
        .call(axisLeft(yScale)
        .tickFormat(function (d) {
          return commaSeparated(d);
      }))
        .style('font-size',11);
			
      let xaxis = bar.append("g")
      .attr("transform",`translate(0, ${innerHeight})`)
      	.attr("class","axis")
        .call(axisBottom(xScale).tickFormat(tick => formatTime(tick))).selectAll("text")
        .style('font-size',11)
        .attr("dy",()=>{
           return "-.5em"
        })
        .attr("dx", () => {
           return "-2.5em"
        })
        .attr("transform", () => {
          return "rotate(-90)"
        });
        
        
      	
      
      bar.selectAll("mybar")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", d => xScale(d.start_date))
        .attr("y", d => yScale(yValue(d)))
        .attr("width", d => xScale(d.end_date) - xScale(d.start_date))
        .attr("height", d => yScale(0) - yScale(yValue(d)))
        .attr("fill", colorScale)
      	.on('mouseover', (i,d) => tooltipX.style("visibility", "visible"))
        .on('mousemove',(e,d)=>{
          return tooltipX.html(`<b>${d.timeperiod}</b> : ${commaSeparated(decimelPrecision(yValue(d)))}</br><b>Start date</b> : ${formatTooltipTime(d.start_date)}</br><b>End date</b> : ${formatTooltipTime(d.end_date)}</div>`).style("top", (e.pageY) - height/2+"px").style("left",(e.pageX)+"px");
        })
        .on('mouseout', ()=>tooltipX.style("visibility", "hidden"));
      
      const lineGenerator = line()
    		.x(d => xScale(xValue(d)))
    		.y(d => yScale(yValue(d)));
    
    	bar.append('path')
    		.attr("d", lineGenerator(data))
      	.attr("class","trend-line")
      
      bar.selectAll("mytext").data(data).enter().append("text")
        .attr("x", function(d) { return xScale(xValue(d)); })
        .attr("y", d => yScale(yValue(d)))
        .attr("dy", "-1em")
      	.style("text-anchor","middle")
      	.style("font-size","11px")
        .text(function(d) { return d.timeperiod; });
    }else{


      bar.append("text")
      .attr('x',width/2 -90)
      .attr('y',0)
      .style("text-anchor","middle")
      .style("font-size","13px")
      .style("font-weight","bold")
      .attr("dy", "-2em")
      .text(`${graphTitle},${titleAreaName}`)

      // bar.append("text")
      // .attr("x",innerWidth/2)
      // .attr("y",innerHeight/2)
      // .attr("dx","-.4em")
      // .text("No data: please select another survey")
      // .style("text-anchor","middle")
      // .style("font-size","10px")
      // .style("font-weight","bold")
    }
    
    svg.append("text")
    .attr("transform", "rotate(-0)")
    .attr("x",margin.left)
    .attr("y", margin.top-30)
    .attr("dy", "1em")
    .style("font-size","12px")
    .style("font-weight","bold")
    .style("text-anchor", "middle")
    .text(graphUnit);    

    //For One Decimel Precision    
    function decimelPrecision(d){
      let oneDecimel;
      if(toggleStateBurden === false){
          return oneDecimel = d;
      }
      else{
          oneDecimel = d.toFixed(1);  
          return oneDecimel;
      }
      
  }  
   
      
  },[dimensions,data, toggleStateBurden])



  if (!data) {
    return <pre>Loading...</pre>;
  }
  let title='Trend of ' + graphTitle+ ', '+titleAreaName



  let table=[];
  if(data ){
    for(var i=0;i<data.length;i++){
      table.push({
        timeperiod:data[i].timeperiod,
        data:+data[i].data_value
      })
    }
  }


  return (
    <>
    <FullScreen  className="w-full h-full" handle={screen}>
    <div class='static relative w-full h-full'>
      <div class="block absolute z-10 w-full max-h-max right-5">
        <SideNavFirst table={table} id="svgTrend" dataField="timeperiod" columnName="Time Period"  screen={screen} title={title}  componentRef={svgRef}/>
      </div>
      <div class='relative w-full h-full pb-3 pt-1 pr-3' id="svgTrend">
        <div class="text-center absolute w-full  font-bold text-xs md:text-sm">{`Trend of ${graphTitle}, ${titleAreaName}`}</div>
        <div id="trend_svg" class='align-middle w-full h-full' ref={trendWrapper}>
          <svg   ref = {svgRef} class="w-full bg-white  border-black border-dashed object-scale-down">
          </svg>
        </div>
      </div>
    </div>
    </FullScreen>
    </>
  );
}