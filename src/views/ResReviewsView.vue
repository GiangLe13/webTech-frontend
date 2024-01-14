<script setup>
</script>

<template>
  <div>
    <h1>Reviews</h1>
    <p class="intro1">Add a new review:</p>

    <form @submit.prevent="isUpdating ? updateReview(selectedReview.id) : saveReview()">
      <div>
        <label>Author:  </label>
        <input v-model="newReview.author" required />
      </div>

      <div>
        <label>Restaurant: </label>
        <select v-model="newReview.restaurant_id" required>
          <option v-for="restaurant in restaurants" :key="restaurant.id" :value="restaurant.id">
            {{ restaurant.name }}
          </option>
        </select>
      </div>

      <div>
        <label>Rating:  </label>
        <select v-model="newReview.rating" required>
          <option v-for="rating in ratingOptions" :key="rating.text" :value="rating.text">
            {{ rating.stars }}
          </option>
        </select>
      </div>

      <div>
        <label>Comment:  </label>
        <input v-model="newReview.comment" required />
      </div>

      <div>
        <button type="submit">{{ isUpdating ? 'Update' : 'Add' }}</button>
        <button type="button" @click="resetForm">Cancel</button>
      </div>

      <div></div>

    </form>

    <div v-for="restaurant in sortedRestaurants" :key="restaurant.id" style="margin-top: 2rem;">
      <h2>{{ restaurant.name }}</h2>
      <p>Average Rating: {{ restaurant.averageRating }}</p>
      <p>District: {{ restaurant.district }}</p>
      <p>Address: {{ restaurant.address }}</p>
      <p>Category: {{ restaurant.category.replace('_', ' ') }}</p>
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
import {useRoute} from "vue-router";
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
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
      const endpoint = baseUrl + '/restaurants';
      axios.get(endpoint).then(response => (this.restaurants = response.data));
    },
    getRestaurantById(id) {
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
      const endpoint = baseUrl + `/restaurants/${id}`;
      axios.get(endpoint).then(response => {
        this.restaurants.push(response.data);
        this.reviewToRestaurantMap = {};
        this.restaurants.forEach(restaurant => {
          restaurant.reviews.forEach(review => {
            this.reviewToRestaurantMap[review.id] = restaurant.id;
          });
        });
      });
    },
    getRestaurantNameById(restaurant_id) {
      const restaurant = this.restaurants.find(r => r.restaurant_id === restaurant_id);
      return restaurant ? restaurant.name : 'Unknown';
    },
    getAllReviews() {
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
      const endpoint = baseUrl + '/reviews';
      axios.get(endpoint).then(response => (this.reviews = response.data));
    },
    getReviewById(id) {
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
      const endpoint = baseUrl + `/reviews/${id}`;
      axios.get(endpoint).then(response => {this.selectedReview = response.data});
    },
    saveReview() {
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
      const endpoint = baseUrl + '/reviews';
      const reviewToSave = {
        author: this.newReview.author,
        rating: this.newReview.rating,
        comment: this.newReview.comment,
        restaurant: { id: this.newReview.restaurant_id } // Ensuring the correct format
      };
      axios.post(endpoint, reviewToSave).then(() => {
        //this.getRestaurantById(reviewToSave.restaurant.id); // Refresh
        //this.getAllReviews(); // Refresh
        location.reload();
        this.newReview = { author: '', restaurant_id: '', rating: '', comment: '' }; // Clear form
      })
    },
    async preUpdateReview(id) {
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
      const endpoint = baseUrl + `/reviews/${id}`;
      this.isUpdating = true;
      await axios.get(endpoint).then(response => {this.selectedReview = response.data});
      this.newReview = {
        author: this.selectedReview.author,
        comment: this.selectedReview.comment,
        rating: this.selectedReview.rating,
        restaurant_id: this.reviewToRestaurantMap[id]
      };
    },
    updateReview(id) {
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
      const endpoint = baseUrl + `/reviews/${id}`;
      const reviewToSave = {
        author: this.newReview.author,
        rating: this.newReview.rating,
        comment: this.newReview.comment,
        restaurant: { id: this.newReview.restaurant_id }
      };
      axios.put(endpoint, reviewToSave).then(() => {
        //this.getRestaurantById(route.params.id); //Refresh
        //this.getAllReviews(); // Refresh
        location.reload();
        this.isUpdating = false; // Reset updating mode
        this.selectedReview = null;
        this.newReview = { author: '', restaurant_id: '', rating: '', comment: '' }; // Clear form
      })
    },
    deleteReview(id) {
      const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
      const endpoint = baseUrl + `/reviews/${id}`;
      if (confirm('This action is irreversible. Proceed?')) {
        axios.delete(endpoint).then(() => {
          //this.getRestaurantById(route.params.id);
          //this.getAllReviews();
          location.reload();
        })
      }
    },
    resetForm() {
      this.newReview = { author: '', restaurant_id: '', rating: '', comment: '' };
      this.isUpdating = false;
    },
    sortBy(sortKey) {
      if (sortKey === this.sortKey) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = sortKey;
        this.sortOrder = 'asc';
      }
      this.getAllReviews(); // Refresh with the new sorting
    },
  },
  mounted() {
    this.getRestaurantById(useRoute().params.id);
    this.getAllReviews(); //Refresh
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
    ratingValueMap() {
      const map = {};
      this.ratingOptions.forEach(option => {
        map[option.text] = option.value;
      });
      return map;
    },
    sortedRestaurants() {
      const restaurantsWithAverageRating = this.restaurants.map(restaurant => {
        const validReviews = restaurant.reviews?.filter(review => review.rating !== 'NO_RATING') || [];
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
  },
};
</script>

<style scoped>
table, th, td {
  border: 1px solid;
}
.intro1 {
  margin-top: 1rem;
  padding-bottom: 1rem;
}
</style>
