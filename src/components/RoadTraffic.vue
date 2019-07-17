<template>
  <div class="visualisations">
    <h2>{{title}}</h2>
    <p>
      A visualisation of the traffic density accross different roads in south-westerly England.
    </p>
    <p>
      The dot map distribution shows the relative difference in Annual Average Daily Flow by vehicle type. Switching tabs allows for different vehicle type densities to be examined. Hovering over a road's count point then shows the proportion of each vehicle type that uses the road.
    </p>

    <div class="viz"></div>
    <div class="pie"></div>
    <p> </p>
  </div>
</template>

<script>
import DotMap from "../assets/dotMap";
import * as d3 from "d3";
require('@/assets/css/dotMap.css');

export default {
  name: "RoadTraffic",
  props: {
    title: String
  },
  mounted() {
    d3.csv("/aadf.csv").then(data => {
      let dotMap = new DotMap({
        root: d3.select(".viz"),
        data: data.filter(d => !['U', 'C'].includes(d['road_name'])),
      });
      dotMap.draw();
    });
  }
};
</script>
