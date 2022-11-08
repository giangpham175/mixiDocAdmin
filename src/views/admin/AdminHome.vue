<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app clipped>
      <v-list dense>
        <v-list-item-group color="primary">
          <v-list-item v-for="(menu, index) in menus" :key="index" @click="goto(menu.path)">
            <v-list-item-action>
              <v-icon>{{ menu.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ menu.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left dark color="primary">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Hello.. <b>{{ this.user.data.displayName }}</b> !</v-toolbar-title>
      <v-spacer />
      <v-btn text icon @click="dark = !dark">
        <v-icon>{{ dark ? 'mdi-brightness-4' : 'mdi-brightness-6' }}</v-icon>
      </v-btn>
      <v-btn text icon @click="logOut()">
        <v-icon>mdi-power</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row>
          <v-col>
            <router-view />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-footer app>
      <div class="flex text-center">
        <span class="lead text--secondary text-center">👉
          <a href="https://discord.com/channels/977929596173426748/977929596903252034" class="text-decoration-none"
            target="_blank">Thông Báo Bệnh Viện</a> 👈
        </span>
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import firebase from 'firebase';
import { mapActions, mapGetters } from 'vuex';
import * as constants from '../../constants/index';

export default {
  data: () => ({
    dark: false,
    path: '/mixi',
    drawer: null,
    menus: [
      // { path: '', title: 'Dashboard', icon: 'mdi-view-dashboard' },
      // { path: '/sounds', title: 'Sounds', icon: 'mdi-playlist-music'},
      // { path: '/categories', title: 'Categories', icon: 'mdi-folder-multiple' },
      { path: '/hien-mau', title: 'Hiến Máu', icon: 'mdi-blood-bag' },
      { path: '/khoan-chi', title: 'Sao Kê Khoản Chi', icon: 'mdi-cash-multiple' },
      // { path: '/canh-sat', title: 'Sao Kê Cảnh Sát', icon: 'mdi-police-badge' },
      { path: '/cu-dan-moi', title: 'Cư Dân Mới', icon: 'mdi-account-group' },
      { path: '/logger', title: 'Lịch Sử Thao Tác', icon: 'mdi-clipboard-text-clock' },
      { path: '/accounts', title: 'Quản Lý Tài Khoản', icon: 'mdi-account-box' },
    ]
  }),
  created() {
    this.dark = this.$vuetify.theme.dark
    this.loadSounds;
    this.loadCategories;
  },
  computed: {
    ...mapActions({
    }),
    ...mapGetters({
      user: "auth/user",
    }),
  },
  methods: {
    logOut() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.$router.replace({ path: '/' });
        });
    },
    goto(newPath) {
      if (newPath === '/logger') {
        if (confirm(`Xem mục này sẽ tiêu tốn tài nguyên của bạn và hệ thống, chỉ nên tra cứu mục này khi cần thiết\n\nOK để tiếp tục truy cập\nCancel để dừng truy cập`)) {
          this.$router.push({ path: this.path + newPath }).catch(() => { });
        }
      } else if (newPath === '/accounts') {
        if (!constants.adminUser.includes(this.user.data.email)) {
          if (confirm(`Danh mục để quản lý tất cả các tài khoản của bác sĩ, bạn không có đủ quyền hạn.`)) {
            return
          }
        } else {
          this.$router.push({ path: this.path + newPath }).catch(() => { });
        }
      } else {
        this.$router.push({ path: this.path + newPath }).catch(() => { });
      }
    }
  },
  watch: {
    dark: function () {
      this.$vuetify.theme.dark = this.dark;
    }
  }
}
</script>