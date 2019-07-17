<template>
  <div id="app">
    <RoadTraffic title="Traffic Density in SW England"/>
  </div>
</template>

<script>
import RoadTraffic from './components/RoadTraffic.vue'

export default {
  name: 'app',
  components: {
    RoadTraffic
  }
}
</script>

<style>
body {
    background-image: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
    margin-left: 10%;
    margin-right: 10%;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
