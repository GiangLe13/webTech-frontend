import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import RestaurantsView from '@/views/RestaurantsView.vue';

const routes = [
    {
        path: '/',
        component: { template: '<div>Home</div>' },
    },
    {
        path: '/restaurants',
        name: 'restaurants',
        component: RestaurantsView,
    },
];

const router = createRouter({
    history: createMemoryHistory(),
    routes,
});

describe('RestaurantsView.vue', () => {
    it('renders the component without errors', async () => {
        const wrapper = mount(RestaurantsView, {
            global: {
                plugins: [router],
            }
        });

        await router.push({ name: 'restaurants' });
        await router.isReady();

        expect(wrapper.exists()).toBe(true);
    });

    it('has the default data set correctly', () => {
        const wrapper = mount(RestaurantsView, {
            global: {
                stubs: {
                    'router-link': true
                }
            }
        });

        // Check if the default data is set correctly
        expect(wrapper.vm.restaurants).toEqual([]);
        expect(wrapper.vm.newRestaurant).toEqual({
            name: '',
            district: '',
            address: '',
            category: '',
        });
    });
    it('renders the restaurant table with the correct number of rows', async () => {
        const restaurants = [
            {
                id: 1,
                name: 'Restaurant A',
                district: 'District 1',
                address: '123 Main Street',
                category: 'VIETNAMESE',
            },
            {
                id: 2,
                name: 'Restaurant B',
                district: 'District 2',
                address: '456 Elm Street',
                category: 'ITALIAN',
            },

        ];

        const wrapper = mount(RestaurantsView, {
            global: {
                stubs: {
                    'router-link': true
                }
            },
            data() {
                return {
                    restaurants,
                };
            },
        });

        await wrapper.vm.$nextTick();

        const tableRows = wrapper.findAll('tbody tr');

        expect(tableRows.length).toBe(restaurants.length);
    });
});


