<script setup>
</script>

<template>
  <div>
    <h1>Restaurants</h1>

    <p class="intro1">Search for restaurants:</p>
    <div>
      <input type="text" v-model="searchQuery" placeholder="Search Restaurants">
      <select v-model="filterDistrict">
        <option value="">All Districts</option>
        <option v-for="district in uniqueDistricts" :key="district" :value="district">
          {{ district }}
        </option>
      </select>
      <select v-model="filterCategory">
        <option value="">All Categories</option>
        <option v-for="category in categoryOptions" :key="category" :value="category">
          {{ category.replace('_', ' ') }}
        </option>
      </select>
    </div>

    <p class="intro2">Add a new restaurant:</p>

    <form @submit.prevent="isUpdating ? updateRestaurant(selectedRestaurant.id) : saveRestaurant()">
      <div>
        <label>Name:  </label>
        <input v-model="newRestaurant.name" required />
      </div>

      <div>
        <label>District:  </label>
        <input v-model="newRestaurant.district" required />
      </div>

      <div>
        <label>Address:  </label>
        <input v-model="newRestaurant.address" required />
      </div>

      <div>
        <label>Category:  </label>
        <select v-model="newRestaurant.category" required>
          <option v-for="category in categoryOptions" :key="category" :value="category">
            {{ category.replace('_', ' ') }}
          </option>
        </select>
      </div>

      <button type="submit">{{ isUpdating ? 'Update' : 'Add' }}</button>
      <button type="button" @click="resetForm">Cancel</button>
    </form>

    <table class="table">
      <thead>
      <tr>
        <th @click="sortBy('id')">ID</th>
        <th @click="sortBy('name')">Name</th>
        <th @click="sortBy('district')">District</th>
        <th>Address</th>
        <th @click="sortBy('category')">Category</th>
        <th @click="sortBy('averageRating')">Rating</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="restaurant in sortedRestaurants" :key="restaurant.id">
        <td>{{ restaurant.id }}</td>
        <td>
          <router-link :to="{ name: 'restaurantReviews', params: { id: restaurant.id }}">{{ restaurant.name }}</router-link>
        </td>
        <td>{{ restaurant.district }}</td>
        <td>{{ restaurant.address }}</td>
        <td>{{ restaurant.category.replace('_', ' ') }}</td>
        <td>{{ restaurant.averageRating }}</td>
        <td>
          <button @click="preUpdateRestaurant(restaurant.id)">Edit</button>
          <button @click="deleteRestaurant(restaurant.id)">Delete</button>
        </td>
      </tr>
      </tbody>
    </table>

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
      ratingOptions: [
        { stars: '', text: 'NO_RATING', value: 0},
        { stars: '★☆☆☆☆', text: 'POOR', value: 1},
        { stars: '★★☆☆☆', text: 'BELOW_AVERAGE', value: 2},
        { stars: '★★★☆☆', text: 'AVERAGE', value: 3},
        { stars: '★★★★☆', text: 'GOOD', value: 4},
        { stars: '★★★★★', text: 'EXCELLENT', value: 5}
      ],
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
      searchQuery: '',
      filterDistrict: '',
      filterCategory: '',
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
    async preUpdateRestaurant(id) {
      this.isUpdating = true;
      await axios.get(`http://localhost:8080/restaurants/${id}`).then(response => {this.selectedRestaurant = response.data});
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
    resetForm() {
      this.newRestaurant = { name: '', district: '', address: '', category: '' };
      this.isUpdating = false;
    },
    sortBy(sortKey) {
      if (sortKey === this.sortKey) {
        // Toggle sort order if it's the same column
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = sortKey;
        this.sortOrder = 'asc';
      }
    },
  },
  mounted() {
    this.getAllRestaurants();
  },
  computed: {
    ratingValueMap() {
      const map = {};
      this.ratingOptions.forEach(option => {
        map[option.text] = option.value;
      });
      return map;
    },
    sortedRestaurants() {
      const restaurantsWithAverageRating = this.restaurants.map(restaurant => {
        const validReviews = restaurant.reviews.filter(review => review.rating !== 'NO_RATING');
        let averageRating = 0;
        if (validReviews.length > 0) {
          const totalRating = validReviews.reduce((acc, review) => acc + this.ratingValueMap[review.rating], 0);
          averageRating = totalRating / validReviews.length;
        }

        // Return the restaurant with its average rating
        return { ...restaurant, averageRating: averageRating.toFixed(2) };
      });

      // filter restaurants based on search and filter criteria
      const filteredRestaurants = restaurantsWithAverageRating.filter(restaurant => {
        const matchesSearch = this.searchQuery.length === 0 || restaurant.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesDistrict = this.filterDistrict.length === 0 || restaurant.district === this.filterDistrict;
        const matchesCategory = this.filterCategory.length === 0 || restaurant.category === this.filterCategory;
        return matchesSearch && matchesDistrict && matchesCategory;
      });

      // sort filtered restaurants
      return filteredRestaurants.sort((a, b) => {
        if (this.sortKey === 'averageRating') {
          return (this.sortOrder === 'asc' ? 1 : -1) * (parseFloat(a.averageRating) - parseFloat(b.averageRating));
        } else {
          const sortKey = this.sortKey;
          const sortOrder = this.sortOrder === 'asc' ? 1 : -1;
          if (a[sortKey] < b[sortKey]) return -sortOrder;
          if (a[sortKey] > b[sortKey]) return sortOrder;
          return 0;
        }
      });
    },
    uniqueDistricts() {
      const districts = this.restaurants.map(restaurant => restaurant.district);
      return [...new Set(districts)].sort();
    },
  }
};
</script>

<style scoped>
table, th, td {
  border: 1px solid;
  margin-top: 2rem;
  margin-bottom: 2rem;
}
.intro1, .intro2 {
  margin-top: 1rem;
  padding-bottom: 1rem;
}
</style>



