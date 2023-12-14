<template>
  <div>
    <h2>Uploaded Files</h2>
    <ul>
      <li v-for="file in files" :key="file._id">
        {{ file.filename }} ({{ formatDate(file.createdAt) }})
        <button @click="deleteFile(file._id)">Delete</button>
        <button @click="openUpdateModal(file)">Update</button>
      </li>
    </ul>

    <UpdateFileModal v-if="selectedFile" :file="selectedFile" @close="selectedFile = null" @updated="fetchFiles" />
  </div>
</template>

<script>
import axios from 'axios';
import UpdateFileModal from './UpdateFileModal.vue';

export default {
components: {
    UpdateFileModal
  },
  data() {
    return {
      files: [],
      selectedFile: null // To keep track of which file is being updated
    };
  },
  methods: {
    openUpdateModal(file) {
      this.$emit('open-modal', file);
      this.selectedFile = file;
    },
    formatDate(value) {
      if (value) {
        return new Date(value).toLocaleString();
      }
      return '';
    },
    async fetchFiles() {
      try {
        const response = await axios.get('http://localhost:3000/files');
        this.files = response.data;
	console.log(this.files)
      } catch (error) {
        console.error('There was an error fetching the files:', error);
      }
    },
    async deleteFile(fileId) {
      try {
        await axios.delete(`http://localhost:3000/files/${fileId}`);
        this.files = this.files.filter(file => file._id !== fileId);
      } catch (error) {
        console.error('There was an error deleting the file:', error);
      }
    }
    },
  created() {
    this.fetchFiles();
  }
};
</script>
