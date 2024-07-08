import React, { useEffect } from 'react'
import * as d3 from "d3"

const E01CommonSvgElement = () => {


    useEffect(()=>{
      // select 
      // const selectTag= d3.select("p")
      // selectTag.style("background-color","red")
      //   const selectClass= d3.select(".my-class")
      //   selectClass.style("background-color","blue")

// selectAll
      // const selectAllTag= d3.selectAll("p")
      // selectAllTag.style("background-color","yellow")
      // const selectAll=  d3.selectAll(".my-class")
      // selectAll.style("background-color","red")

// selection selectAll
     const allDiv= d3.selectAll('.class-2')
       allDiv.style("background-color","red")

     const selectAllTag= allDiv.selectAll("p")
     selectAllTag.selectAll("color","green")

    })



  return (
    <div>
      <h4>E01CommonSvgElement</h4>
      {/* <svg width={800} height={800} style={{border:"1px solid black"}}>
     <rect 
        width={200} 
        height={200}
        x={100}  //right
        y={100}  //top
        fill='blue'
     />
     <circle
        r={50}
        fill='yellow'
        cx={100} //postion left
        cy={400}  //top
     />
     <text
     x={100}
     y={600}
     fill='blue'
     fontSize={"18"}
     >
     Hello world
     </text>
      </svg> */}


      {/* smile */}
      {/* <svg width={100} height={100} style={{border:"solid red"}}>
      <path
      d="M25,25 L25,35 
         M75,25,L75,35
        M15,75 C20,100,80,100,85,75
         "
      
       stroke="blue"
       stroke-width="2"
       fill='none'
      />

      </svg> */}


      {/* select */}
      {/* <div>
         <h3>E01</h3>
         <p>element 1</p>
         <p>element 5</p>
         <div className='my-class'>element 2</div>
         <div className='my-class'>element 2</div>
      </div> */}

      {/* selection.selectAll */}
        <div>
           <h6>selection selectAll</h6>
           <div className='class-2'>
           <p>link 1</p>
           <p>link 2</p>
           </div>
           <div className='class-2'>
           <p>link 3</p>
           <p>link 4</p>
           </div>
        </div>

    </div>
  )
}

export default E01CommonSvgElement
