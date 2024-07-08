import React, { useEffect, useRef } from "react";
import * as d3 from "d3";



const LinerScale=()=>{
      const myEle=useRef(null);
     
      const totalHeight=300;
      const rectWidth=50;
      const margin={
        top:20,
        right:40,
        bottom:20,
        left:40
      }
      useEffect(()=>{
       const data=[30,86,189,281,308,365] 
       const width=300;
       const height=totalHeight;

       const svg=d3
                 .select(myEle.current)
                 .attr('width',width+margin.left+margin.right)
                 .attr('height',height+margin.top+margin.bottom)
                 .attr("g")
                 .attr("transform",`translate{${margin.left},${margin.top}}`)
                 

    //    create a liner scale for the y-axis
    const yLinerScale=d3
           .scaleLinear()
           .domain([0,d3.max(data)]) //input domain:from 0 to max value
           .range([height,0]) //output range: from the height of the svg to 0

          svg.selectAll('rect')
          .data(data)
          .enter()
          .append('rect')
          .attr('x',(d,i)=> i* rectWidth) //x position based on the index
          .attr('y',(d)=>yLinerScale(d)) //y position based on the index

 
        },[])




    return(
        <>  
         <svg ref={myEle} style={{border:"1px dashed"}}>

         </svg>
        </>
    )
}


export default LinerScale