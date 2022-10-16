<template>
  <div>
    <v-data-table :headers="headers" :items="expenses" :search="search" class="elevation-1" :loading="loading"
      loading-text="Loading... Please wait">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Sao Kê Khoản Chi</v-toolbar-title>
          <v-divider class="mx-4" inset vertical />
          <v-spacer />

          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-if="actived" color="primary" dark class="mb-2" v-bind="attrs" v-on="on">Tạo Khoản Chi</v-btn>
              <v-btn v-else disabled class="mb-2" elevation="2">Tạo Khoản Chi</v-btn>
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
                        <v-text-field disabled :rules="fieldRule" v-model="editedItem.name" label="Người Chi">
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field :disabled="loading" :rules="fieldRule" v-model="editedItem.reason"
                          label="Khoản Chi"></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field :disabled="loading" v-model="editedItem.amount" label="Số Tiền Chi" type="number">
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

          <v-btn v-if="actived" text icon class="mb-2 ml-2" @click="unlock" color="#1DE9B6">
            <v-icon>mdi-lock-open-variant</v-icon>
          </v-btn>
          <v-btn v-else text icon class="mb-2 ml-2" @click="unlock" color="error">
            <v-icon>mdi-lock</v-icon>
          </v-btn>
          <v-btn text icon class="mb-2 ml-2" @click="deleteAll" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn text icon class="mb-2 ml-2" @click="exportExpenses" color="#2E7D32">
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
        <v-icon small @click="deleteItem(item)" color="error">
          mdi-delete
        </v-icon>
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
// import { storage } from "firebase";
import { mapActions, mapGetters } from "vuex";
import exportFromJSON from "export-from-json";

export default {
  data() {
    return {
      actived: false,
      snack: false,
      snackColor: "",
      snackText: "",
      search: "",
      loading: true,
      dialog: false,
      headers: [
        {
          text: "Người Chi",
          align: "start",
          sortable: true,
          value: "name",
        },
        {
          text: "Thời Gian",
          sortable: true,
          value: "time",
        },
        {
          text: "Khoản Chi",
          sortable: true,
          value: "reason",
        },
        {
          text: "Số Tiền Chi",
          sortable: true,
          value: "amount",
        },
        { text: "Thao tác", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        name: "",
        reason: "",
        amount: "",
        time: (new Date()).toLocaleString()
      },
      defaultItem: {
        name: "",
        reason: "",
        amount: "",
        time: (new Date()).toLocaleString()
      },
      fieldRule: [(v) => !!v || "Dữ liệu bắt buộc"],
    };
  },
  computed: {
    ...mapActions({
      loadExpenses: "expenses/loadExpenses",
      loadAllStatus: "allstatus/loadAllStatus",
    }),
    ...mapGetters({
      expenses: "expenses/getExpenses",
      allstatus: "allstatus/getAllStatus",
      user: "auth/user",
    }),
    formTitle() {
      return this.editedIndex === -1 ? "Thông Tin" : "";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  created() {
    this.initialize();
    this.editedItem.name = this.user.data.email
    this.defaultItem.name = this.user.data.email
  },

  methods: {
    ...mapActions({
      addExpense: "expenses/addExpense",
      updateExpense: "expenses/updateExpense",
      removeExpense: "expenses/removeExpense",
      updateStatus: "allstatus/updateStatus",
    }),

    async initialize() {
      this.loading = true;
      try {
        await this.loadExpenses;
        await this.loadAllStatus;
        this.actived = JSON.stringify(this.allstatus.actived)
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },

    editItem(item) {
      this.editedIndex = this.expenses.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      this.loading = true;
      if (confirm("Chắc chắn là XÓA nha?")) {
        this.loading = true;
        try {
          await this.removeExpense(item);
          // storage().refFromURL(item.image).delete();
          this.loading = false;

          this.snack = true;
          this.snackColor = "success";
          this.snackText = "Xóa thông tin thành công";
        } catch (e) {
          this.loading = false;

          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Xóa thông tin không thành công";

          console.error(e);
        }
      } else {
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

      if (this.editedIndex > -1) {
        const current = new Date()
        this.editedItem.time = current.toLocaleString()
        this.defaultItem.time = current.toLocaleString()
        this.loading = true;
        try {
          await this.updateExpense({
            index: this.editedIndex,
            expense: this.editedItem,
          });
          this.loading = false;
          this.close();

          this.snack = true;
          this.snackColor = "success";
          this.snackText = "Xóa thông tin thành công";
        } catch (e) {
          this.loading = false;
          this.close();

          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Xóa thông tin không thành công";

          console.error(e);
        }
      } else {
        // this.editedItem.total = 1
        this.loading = true;
        const current = new Date()
        this.editedItem.time = current.toLocaleString()
        this.defaultItem.time = current.toLocaleString()
        try {
          await this.addExpense(this.editedItem);
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
    },

    async exportExpenses() {
      this.loading = true;
      const currentDay = new Date().getDate();
      const currentMonth = new Date().getMonth() + 1;
      try {
        if (this.user.data.email === 'gp@mixi.com') {
          const data = this.expenses;
          const fileName = "sao-ke-khoan-chi-" + currentDay + "-" + currentMonth;
          const exportType = exportFromJSON.types.csv;

          if (data) exportFromJSON({ data, fileName, exportType });
        }
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },

    async refreshTime() {
      this.loading = true;
      try {
        const current = new Date()
        this.editedItem.time = current.toLocaleString()
        this.defaultItem.time = current.toLocaleString()
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },

    async unlock() {
      this.loading = true;
      const data = await this.allstatus;
      await data.forEach(async item => {
        console.log(JSON.stringify(item))
        //TODO: update actived
        // await this.updateStatus({
        //     index: this.editedIndex,
        //     status: {},
        //   });
      })
      this.actived = true
      this.loading = false;
    },

    async deleteAll() {
      this.loading = true;
      if (confirm("Chắc chắn là XÓA HẾT đó nha?")) {
        this.loading = true;
        try {
          const data = this.expenses;
          await data.forEach(async item => {
            await this.removeExpense(item)
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
        this.loading = false;
      }
    }
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