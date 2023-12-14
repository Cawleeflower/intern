<template>
  <div class="modal">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>Update File</h2>
      <form @submit.prevent="updateFile">
        <div>
          <label for="newName">New Name:</label>
          <input type="text" id="newName" v-model="newName" required>
        </div>
        <div>
          <label for="newFile">New File:</label>
          <input type="file" id="newFile" @change="onFileChange">
        </div>
        <button type="submit">Update</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    file: Object
  },
  data() {
    return {
      newName: '',
      newFile: null
    };
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    onFileChange(event) {
      this.newFile = event.target.files[0];
    },
    async updateFile() {
      const formData = new FormData();
      formData.append('name', this.newName);
      if (this.newFile) {
        formData.append('file', this.newFile);
      }
	console.log(formData.get("name"))
      try {
        await axios.put(`http://localhost:3000/files/${this.file._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
	console.log("Test1")
        this.$emit('updated');
        this.closeModal();
      } catch (error) {
        console.error('There was an error updating the file:', error);
      }
    }
  }
};
</script>

<style scoped>
.modal {
  display: block; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>
