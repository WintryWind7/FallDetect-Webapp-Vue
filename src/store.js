import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        isLoggedIn: false
    },
    getters: {
        isLoggedIn: state => state.isLoggedIn
    },
    mutations: {
        setLoggedIn(state, status) {
            state.isLoggedIn = status;
        }
    },
    actions: {
        logIn({ commit }) {
            commit('setLoggedIn', true);
        },
        logOut({ commit }) {
            commit('setLoggedIn', false);
        }
    }
});
