<script setup lang="js">
</script>

<template>
  <div>
    <h1>Restaurants</h1>
    <table class="table">
      <thead>
      <tr>
        <th @click="sortBy('id')">ID</th>
        <th @click="sortBy('name')">Name</th>
        <th @click="sortBy('district')">District</th>
        <th>Address</th>
        <th @click="sortBy('category')">Category</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="restaurant in sortedRestaurants" :key="restaurant.id">
        <td>{{ restaurant.id }}</td>
        <td>{{ restaurant.name }}</td>
        <td>{{ restaurant.district }}</td>
        <td>{{ restaurant.address }}</td>
        <td>{{ restaurant.category }}</td>
        <td>
          <button @click="preUpdateRestaurant(restaurant.id)">Edit</button>
          <button @click="deleteRestaurant(restaurant.id)">Delete</button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- Component? -->
    <form @submit.prevent="isUpdating ? updateRestaurant(selectedRestaurant.id) : saveRestaurant()">
      <label>Name:</label>
      <input v-model="newRestaurant.name" required />

      <label>District:</label>
      <input v-model="newRestaurant.district" required />

      <label>Address:</label>
      <input v-model="newRestaurant.address" required />

      <label>Category:</label>
      <select v-model="newRestaurant.category" required>
        <option v-for="category in categoryOptions" :key="category" :value="category">
          {{ category.replace('_', ' ') }}
        </option>
      </select>

      <button type="submit">{{ isUpdating ? 'Update' : 'Add' }}</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      restaurants: [],
      newRestaurant: {
        name: '',
        district: '',
        address: '',
        category: '',
      },
      selectedRestaurant: null,
      isUpdating: false,
      sortKey: '',
      sortOrder: 'asc',
      categoryOptions: [
        'VIETNAMESE',
        'SRI_LANKAN',
        'KOREAN',
        'JAPANESE',
        'CHINESE',
        'THAI',
        'ITALIAN',
        'GREEK',
        'INDIAN',
        'OTHER'
      ],
    };
  },
  methods: {
    getAllRestaurants() {
      axios.get('http://localhost:8080/restaurants').then(response => (this.restaurants = response.data));
    },
    getRestaurantById(id) {
      axios.get(`http://localhost:8080/restaurants/${id}`).then(response => {this.selectedRestaurant = response.data});
    },
    saveRestaurant() {
      axios.post('http://localhost:8080/restaurants', this.newRestaurant).then(() => {
        this.getAllRestaurants(); // Refresh
        this.newRestaurant = { name: '', district: '', address: '', category: '' }; // Clear form
      });
    },
    preUpdateRestaurant(id) {
      this.isUpdating = true;
      this.getRestaurantById(id);
      this.newRestaurant = this.selectedRestaurant;
    },
    updateRestaurant(id) {
      axios.put(`http://localhost:8080/restaurants/${id}`, this.newRestaurant).then(() => {
        this.getAllRestaurants(); // Refresh
        this.isUpdating = false; // Reset updating mode
        this.selectedRestaurant = null;
        this.newRestaurant = { name: '', district: '', address: '', category: '' }; // Clear form
      })
    },
    deleteRestaurant(id) {
      if (confirm('This action will also delete all associated reviews. Proceed?')) {
        axios.delete(`http://localhost:8080/restaurants/${id}`).then(() => this.getAllRestaurants());
      }
    },
    sortBy(sortKey) {
      if (sortKey === this.sortKey) {
        // Toggle sort order if it's the same column
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = sortKey;
        this.sortOrder = 'asc';
      }
      this.getAllRestaurants(); // Refresh with the new sorting criteria
    },
  },
  mounted() {
    // Fetch restaurants when the component is mounted?
    this.getAllRestaurants();
  },
  computed: {
    sortedRestaurants() {
      return this.restaurants.slice().sort((a, b) => {
        const sortKey = this.sortKey;
        const sortOrder = this.sortOrder === 'asc' ? 1 : -1;

        if (a[sortKey] < b[sortKey]) return -sortOrder;
        if (a[sortKey] > b[sortKey]) return sortOrder;
        return 0;
      });
    },
  }
};
</script>

<style scoped>
table, th, td {
  border: 1px solid;
}
</style>



