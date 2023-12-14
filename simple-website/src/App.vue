<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <div>
    <FileUploadComponent />
  <RetrieveFiles />
</div>
</template>

<script>
import FileUploadComponent from './components/FileUploadComponent.vue';
import RetrieveFiles from './components/RetrieveFiles.vue';

export default {
  name: 'App',
  components: {
    FileUploadComponent,
    RetrieveFiles
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
