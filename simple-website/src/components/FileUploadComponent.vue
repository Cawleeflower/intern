<template>
  <div>
    <h2>Upload File</h2>
    <form @submit.prevent="uploadFile">
      <div>
        <label for="fileName">File Name:</label>
        <input type="text" id="fileName" v-model="fileName" required />
      </div>
      <div>
        <input type="file" @change="onFileChange" required />
      </div>
      <button type="submit" :disabled="!isNameUnique">Upload</button>
    </form>
    <p v-if="uploadStatus">{{ uploadStatus }}</p>
    <p v-if="!isNameUnique">File name must be unique</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      selectedFile: null,
      fileName: '',
      isNameUnique: true,
      uploadStatus: ''
    };
  },
  methods: {
    onFileChange(e) {
      this.selectedFile = e.target.files[0];
    },
    async uploadFile() {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('name', this.fileName);
      console.log(this.fileName)
      try {
        const response = await axios.post('http://localhost:3000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
	console.log(response.data)	
        this.uploadStatus = 'File uploaded successfully';
        // Reset form after successful upload
        this.fileName = '';
        this.selectedFile = null;
	window.location.reload()
      } catch (error) {
        console.error('There was an error uploading the file:', error);
        this.uploadStatus = 'Error uploading file';
      }
    },
    async checkNameUnique() {
      if (this.fileName) {
        try {
          const response = await axios.get(`http://localhost:3000/files/checkNameUnique/${this.fileName}`);
          this.isNameUnique = response.data.isUnique;
        } catch (error) {
          console.error('There was an error checking file name uniqueness:', error);
        }
      }
    }
  }
};
</script>
