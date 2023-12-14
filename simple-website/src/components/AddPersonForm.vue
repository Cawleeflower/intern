<template>
  <div>
    <h2>Add Person</h2>
    <form @submit.prevent="addPerson">
      <div>
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="person.name" required>
      </div>
      <div>
        <label for="age">Age:</label>
        <input type="number" id="age" v-model="person.age" required>
      </div>
      <button type="submit">Add Person</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      person: {
        name: '',
        age: null
      }
    };
  },
  methods: {
    async addPerson() {
      try {
        const response = await axios.post('http://localhost:3000/addPerson', this.person);
	console.log(response.data); // Use the response data        
	alert('Person added successfully');
        this.resetForm();
      } catch (error) {
        console.error('Error adding person:', error);
        alert('Failed to add person');
      }
    },
    resetForm() {
      this.person.name = '';
      this.person.age = null;
    }
  }
};
</script>
