<script setup lang="js">
</script>

<template>
  <div>
    <h1>Reviews</h1>
    <p>Add a new review:</p>

    <form @submit.prevent="isUpdating ? updateReview(selectedReview.id) : saveReview()">
      <div>
        <label>Author:</label>
        <input v-model="newReview.author" required />
      </div>

      <div>
        <label>Restaurant:</label>
        <select v-model="newReview.restaurant_id" required>
          <option v-for="restaurant in restaurants" :key="restaurant.id" :value="restaurant.id">
            {{ restaurant.name }}
          </option>
        </select>
      </div>

      <div>
        <label>Rating:</label>
        <select v-model="newReview.rating" required>
          <option v-for="rating in ratingOptions" :key="rating.text" :value="rating.text">
            {{ rating.stars }}
          </option>
        </select>
      </div>

      <div>
        <label>Comment:</label>
        <input v-model="newReview.comment" required />
      </div>

      <div>
        <button type="submit">{{ isUpdating ? 'Update' : 'Add' }}</button>
        <button type="button" @click="resetForm">Cancel</button>
      </div>

      <div></div>

    </form>

    <div v-for="restaurant in restaurants" :key="restaurant.id">
      <h2>{{ restaurant.name }}</h2>
      <p>District: {{ restaurant.district }}</p>
      <p>Address: {{ restaurant.address }}</p>
      <p>Category: {{ restaurant.category }}</p>
      <p>Reviews:</p>

      <table class="table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Author</th>
          <th>Rating</th>
          <th>Comment</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="review in restaurant.reviews" :key="review.id">
          <td>{{ review.id }}</td>
          <td>{{ review.author }}</td>
          <td>{{ review.rating.replace('_', ' ') }}</td>
          <td>{{ review.comment }}</td>
          <td>
            <button @click="preUpdateReview(review.id)">Edit</button>
            <button @click="deleteReview(review.id)">Delete</button>
          </td>
        </tr>
        </tbody>
      </table>


    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      restaurants: [],
      reviews: [],
      reviewToRestaurantMap: {},
      newReview: {
        author: '',
        restaurant_id: '',
        rating: '',
        comment: '',
      },
      selectedReview: null,
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
      ]
    };
  },
  methods: {
    getAllRestaurants() {
      axios.get('http://localhost:8080/restaurants').then(response => {
            this.restaurants = response.data;
            this.reviewToRestaurantMap = {};
            this.restaurants.forEach(restaurant => {
              restaurant.reviews.forEach(review => {
                this.reviewToRestaurantMap[review.id] = restaurant.id;
              });
            });
          })
    },
    getRestaurantNameById(restaurant_id) {
      const restaurant = this.restaurants.find(r => r.restaurant_id === restaurant_id);
      return restaurant ? restaurant.name : 'Unknown';
    },
    getAllReviews() {
      axios.get('http://localhost:8080/reviews').then(response => (this.reviews = response.data));
    },
    getReviewById(id) {
      axios.get(`http://localhost:8080/reviews/${id}`).then(response => {this.selectedReview = response.data});
    },
    saveReview() {
      const reviewToSave = {
        author: this.newReview.author,
        rating: this.newReview.rating,
        comment: this.newReview.comment,
        restaurant: { id: this.newReview.restaurant_id } // Ensuring the correct format
      };
      axios.post('http://localhost:8080/reviews', reviewToSave).then(() => {
            this.getAllRestaurants(); // Refresh
            this.getAllReviews(); // Refresh
            this.newReview = { author: '', restaurant_id: '', rating: '', comment: '' }; // Clear form
          })
    },
    async preUpdateReview(id) {
      this.isUpdating = true;
      await axios.get(`http://localhost:8080/reviews/${id}`).then(response => {this.selectedReview = response.data});
      this.newReview = {
        author: this.selectedReview.author,
        comment: this.selectedReview.comment,
        rating: this.selectedReview.rating,
        restaurant_id: this.reviewToRestaurantMap[id]
      };
    },
    updateReview(id) {
      const reviewToSave = {
        author: this.newReview.author,
        rating: this.newReview.rating,
        comment: this.newReview.comment,
        restaurant: { id: this.newReview.restaurant_id }
      };
      axios.put(`http://localhost:8080/reviews/${id}`, reviewToSave).then(() => {
        this.getAllRestaurants(); //Refresh
        this.getAllReviews(); // Refresh
        this.isUpdating = false; // Reset updating mode
        this.selectedReview = null;
        this.newReview = { author: '', restaurant_id: '', rating: '', comment: '' }; // Clear form
      })
    },
    deleteReview(id) {
      if (confirm('This action is irreversible. Proceed?')) {
        axios.delete(`http://localhost:8080/reviews/${id}`).then(() => {
          this.getAllRestaurants();
          this.getAllReviews();
        })
      }
    },
    resetForm() {
      this.newReview = { author: '', restaurant_id: '', rating: '', comment: '' };
      this.isUpdating = false;
    },
    sortBy(sortKey) {
      if (sortKey === this.sortKey) {
        // Toggle sort order in same column
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = sortKey;
        this.sortOrder = 'asc';
      }
      this.getAllReviews(); // Refresh with the new sorting
    },
  },
  mounted() {
    this.getAllRestaurants();
    this.getAllReviews();
  },
  computed: {
    sortedReviews() {
      return this.reviews.slice().sort((a, b) => {
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



