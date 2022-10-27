<template>
  <div>
    <v-data-table :headers="headers" :items="newbies" :search="search" class="elevation-1" :loading="loading"
      loading-text="Loading... Please wait">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Cư Dân Mới</v-toolbar-title>
          <v-divider class="mx-4" inset vertical />
          <v-spacer />

          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">Đăng ký</v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form v-bind:disabled="loading" lazy-validation ref="dialogForm">
                    <v-row>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field :disabled="loading" :rules="fieldRule" v-model="editedItem.name" label="Tên">
                        </v-text-field>
                      </v-col>
                      <v-col cols="6" sm="6" md="6">
                        <v-text-field :disabled="loading" v-model="editedItem.gender" label="Giới Tính">
                        </v-text-field>
                      </v-col>
                      <v-col cols="6" sm="6" md="6">
                        <v-text-field :disabled="loading" v-model="editedItem.dob" label="Năm Sinh" type="number">
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field disabled v-model="editedItem.timeSupported" label="Thời gian hỗ trợ">
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field disabled v-model="editedItem.doctorSupported" label="Bác sĩ hỗ trợ">
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :disabled="loading" color="red darken-1" text @click="close">Hủy</v-btn>
                <v-btn :disabled="loading" color="blue darken-1" text @click="save">Lưu</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-btn text icon class="mb-2 ml-2" @click="deleteAll" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn text icon class="mb-2 ml-2" @click="exportNewbie" color="#2E7D32">
            <v-icon>mdi-microsoft-excel</v-icon>
          </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:[`item.image`]="{ value }">
        <a :href="value" target="_blank">
          {{ value | truncate(20, "...") }}
          <span class="mdi mdi-open-in-new"></span>
        </a>
      </template>

      <template v-slot:[`body.prepend`]="{ headers }">
        <tr class="mx-0 px-0">
          <td :colspan="headers.length" class="mx-0 px-0">
            <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search" single-line hide-details
              filled class="px-0 mx-0" />
          </td>
        </tr>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon medium class="mr-2" @click="tickSupported(item)" color="warning">
          mdi-sticker-check
        </v-icon>
        <!-- <v-icon small @click="deleteItem(item)" color="error">
            mdi-delete
          </v-icon> -->
      </template>
      <template v-slot:no-data>
        <v-btn color="primary" @click="initialize">Reset</v-btn>
      </template>
    </v-data-table>

    <v-snackbar v-model="snack" :timeout="3000" :color="snackColor">
      {{ snackText }}
      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
  
<script>
import { mapActions, mapGetters } from "vuex";
import exportFromJSON from "export-from-json";
import * as utils from '../../utils/index';

export default {
  data() {
    return {
      snack: false,
      snackColor: "",
      snackText: "",
      search: "",
      loading: true,
      dialog: false,
      headers: [
        {
          text: "Tên",
          align: "start",
          sortable: true,
          value: "name",
        },
        {
          text: "Giới Tính",
          sortable: true,
          value: "gender",
        },
        {
          text: "Năm Sinh",
          sortable: true,
          value: "dob",
        },
        {
          text: "Thời gian hỗ trợ",
          sortable: true,
          value: "timeSupported",
        },
        {
          text: "Bác sĩ hỗ trợ",
          sortable: true,
          value: "doctorSupported",
        },
        { text: "Thao tác", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        name: "",
        gender: "",
        dob: "",
        timeSupported: "",
        doctorSupported: "",
      },
      defaultItem: {
        name: "",
        gender: "",
        dob: "",
        timeSupported: "",
        doctorSupported: "",
      },
      fieldRule: [(v) => !!v || "Dữ liệu bắt buộc"],
    };
  },

  computed: {
    ...mapActions({
      loadNewbies: "newbies/loadNewbies",
    }),
    ...mapGetters({
      newbies: "newbies/getNewbies",
      user: "auth/user",
    }),
    formTitle() {
      return this.editedIndex === -1 ? "Thông Tin" : "Tích Lũy / Đổi Điểm";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  created() {
    this.initialize();
  },

  methods: {
    ...mapActions({
      addNewbie: "newbies/addNewbie",
      updateNewbie: "newbies/updateNewbie",
      removeNewbie: "newbies/removeNewbie",
    }),

    async initialize() {
      this.loading = true;
      try {
        await this.loadNewbies;
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },

    editItem(item) {
      this.editedIndex = this.newbies.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      this.loading = true;
      if (confirm("Chắc chắn là XÓA nha?")) {
        this.loading = true;
        try {
          await this.removeNewbie(item);
          // storage().refFromURL(item.image).delete();
          this.loading = false;

          this.snack = true;
          this.snackColor = "success";
          this.snackText = "Xóa thông tin người này thành công";
        } catch (e) {
          this.loading = false;

          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Xóa thông tin người này không thành công";

          console.error(e);
        }
      } else {
        this.loading = false;
      }
    },

    async deleteAll() {
      this.loading = true;
      if (this.user.data.email === 'mynguyenngoc22@gmail.com' && confirm("Chắc chắn là XÓA HẾT đó nha?")) {
        this.loading = true;
        try {
          const data = this.expenses;
          await data.forEach(async item => {
            await this.removeNewbie(item)
          })
          this.snack = true;
          this.snackColor = "success";
          this.snackText = "Xóa thông tin thành công";
          this.loading = false;
        } catch (e) {
          this.loading = false;

          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Xóa thông tin không thành công";

          console.error(e);
        }
      } else {
        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Bạn không có quyền xóa";
        this.loading = false;
      }
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async save() {
      if (!this.$refs.dialogForm.validate()) return;

      if (this.user.data.email === 'mynguyenngoc22@gmail.com') {

        if (this.editedIndex > -1) {
          this.loading = true;
          try {
            await this.updateNewbie({
              index: this.editedIndex,
              newbie: this.editedItem,
            });
            this.loading = false;
            this.close();

            this.snack = true;
            this.snackColor = "success";
            this.snackText = "Lưu thông tin thành công";
          } catch (e) {
            this.loading = false;
            this.close();

            this.snack = true;
            this.snackColor = "error";
            this.snackText = "Lưu thông tin không thành công";

            console.error(e);
          }
        } else {
          // this.editedItem.total = 1
          this.loading = true;
          try {
            await this.addNewbie(this.editedItem);
            this.loading = false;
            this.close();

            this.snack = true;
            this.snackColor = "success";
            this.snackText = "Thêm thông tin thành công";
          } catch (e) {
            this.loading = false;
            this.close();

            this.snack = true;
            this.snackColor = "error";
            this.snackText = "Thêm thông tin không thành công";

            console.error(e);
          }
        }
      } else {
        this.close()
        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Bạn không có quyền thêm người mới";
        this.loading = false;
      }
    },

    async exportNewbie() {
      this.loading = true;
      const currentDay = new Date().getDate();
      const currentMonth = new Date().getMonth() + 1;
      try {
        if (this.user.data.email === 'mynguyenngoc22@gmail.com') {
          const data = this.newbies;
          const fileName = "cu-dan-moi-" + currentDay + "-" + currentMonth;
          const exportType = exportFromJSON.types.xls;

          if (data) exportFromJSON({ data, fileName, exportType });
        } else {
          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Bạn không có quyền xuất file";
        }
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },

    async tickSupported(item) {
      this.loading = true;
      this.editedIndex = this.newbies.indexOf(item);
      this.editedItem = Object.assign({}, item);

      if (!this.editedItem.doctorSupported) {
        this.editedItem.doctorSupported = this.user.data.displayName

        const nowTime = utils.changeTimeZone(new Date(), 'Asia/Ho_Chi_Minh');
        this.editedItem.timeSupported = nowTime.toLocaleString()

        if (confirm(`Hỗ trợ cho cư dân ${this.editedItem.name} ?`)) {
          try {
            await this.updateNewbie({
              index: this.editedIndex,
              newbie: this.editedItem,
            });

            this.snack = true;
            this.snackColor = "success";
            this.snackText = "Hỗ trợ cư dân mới thành công";
            this.loading = false;
          } catch (e) {
            this.loading = false;

            this.snack = true;
            this.snackColor = "error";
            this.snackText = "Hỗ trợ cư dân mới không thành công";

            console.error(e);
          }
        }
      } else {
        this.snack = true;
        this.snackColor = "error";
        this.snackText = "Cư dân đã được hỗ trợ";
      }
      this.loading = false;
    },

    async addOldData() {
      const data = null
      if (data) {
        try {
          data.forEach(async e => {
            await this.addNewbie(e);
          })
        } catch (e) {
          this.loading = false;
          console.error(e);
        }
      } else {
        console.log('import error')
      }
    },
  },

  filters: {
    truncate: function (text, length, suffix) {
      if (text.length > length) {
        return text.substring(0, length) + suffix;
      } else {
        return text;
      }
    },
  },
};
</script>