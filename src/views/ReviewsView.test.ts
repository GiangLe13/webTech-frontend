import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ReviewsView from '@/views/ReviewsView.vue';

describe('ReviewsView.vue', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(ReviewsView);
    });

    it('renders the component', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('initially does not display any reviews', () => {
        const reviewsSection = wrapper.find('.reviews-section');
        expect(reviewsSection.exists()).toBe(false);
    });

    it('initializes the form with default values', () => {
        const wrapper = mount(ReviewsView);
        const defaultData = wrapper.vm.$data.newReview;
        expect(defaultData).toEqual({
            author: '',
            restaurant_id: '',
            rating: '',
            comment: '',
        });
    });
});
