import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RestaurantsView from '../views/RestaurantsView.vue'
import ReviewsView from '../views/ReviewsView.vue'
import ResReviewsView from '../views/ResReviewsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/reviews',
      name: 'reviews',
      component: ReviewsView
    },
    {
      path: '/restaurants',
      name: 'restaurants',
      component: RestaurantsView
    },
    {
      path: '/restaurants/:id',
      name: 'restaurantReviews',
      component: ResReviewsView
    },
  ]
})

export default router
