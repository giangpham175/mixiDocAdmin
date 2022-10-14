import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/auth';
import sounds from './modules/sounds';
import categories from './modules/categories';
import bloodstorage from './modules/hien-mau';
import expenses from './modules/sao-ke-khoan-chi';

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth,
    categories,
    sounds,
    bloodstorage,
    expenses
  }
})
