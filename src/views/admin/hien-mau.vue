<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="bloodstorage"
      :search="search"
      class="elevation-1"
      :loading="loading"
      loading-text="Loading... Please wait"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Danh Sách Hiến Máu</v-toolbar-title>
          <v-divider class="mx-4" inset vertical />
          <v-spacer />

          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on"
                >Đăng ký mới</v-btn
              >
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form
                    v-bind:disabled="loading"
                    lazy-validation
                    ref="dialogForm"
                  >
                    <v-row>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field
                          :disabled="loading"
                          :rules="fieldRule"
                          v-model="editedItem.name"
                          label="Tên"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field
                          :disabled="loading"
                          :rules="fieldRule"
                          v-model="editedItem.bloodtype"
                          label="Nhóm Máu"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field
                          :disabled="loading"
                          :rules="fieldRule"
                          v-model="editedItem.accumulation"
                          label="Tích Lũy"
                          type="number"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field
                          :disabled="loading"
                          :rules="fieldRule"
                          v-model="editedItem.total"
                          label="Tổng"
                          type="number"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  :disabled="loading"
                  color="red darken-1"
                  text
                  @click="close"
                  >Hủy</v-btn
                >
                <v-btn
                  :disabled="loading"
                  color="blue darken-1"
                  text
                  @click="save"
                  >Lưu</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-btn text icon class="mb-2 ml-2" @click="initialize">
            <v-icon>mdi-refresh</v-icon>
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
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
              filled
              class="px-0 mx-0"
            />
          </td>
        </tr>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">
          mdi-plus-minus-variant
        </v-icon>
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
import { storage } from "firebase";
import { mapActions, mapGetters } from "vuex";

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
          text: "Nhóm Máu",
          sortable: true,
          value: "bloodtype",
        },
        {
          text: "Tích Lũy",
          sortable: true,
          value: "accumulation",
        },
        {
          text: "Tổng",
          sortable: true,
          value: "total",
        },
        { text: "Thao tác", value: "actions", sortable: false },
      ],
      editedIndex: -1,
      editedItem: {
        name: "",
        bloodtype: "",
        accumulation: "",
        total: "",
      },
      defaultItem: {
        name: "",
        bloodtype: "",
        accumulation: "",
        total: "",
      },
      fieldRule: [(v) => !!v || "Dữ liệu bắt buộc"],
    };
  },
  computed: {
    ...mapActions({
      loadBloodStorage: "bloodstorage/loadBloodStorage",
    }),
    ...mapGetters({
      bloodstorage: "bloodstorage/getBloodStorage",
    }),
    ...mapGetters({
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
      addBlood: "bloodstorage/addBlood",
      updateBlood: "bloodstorage/updateBlood",
      removeBlood: "bloodstorage/removeBlood",
    }),
    async initialize() {
      this.loading = true;
      try {
        await this.loadBloodStorage;
      } catch (e) {
        console.error(e);
      }
      this.loading = false;
    },
    editItem(item) {
      this.editedIndex = this.bloodstorage.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      this.loading = true;
      if (confirm("Are you sure you want to delete this item?")) {
        this.loading = true;
        try {
          await this.removeBlood(item);
          storage().refFromURL(item.image).delete();
          this.loading = false;

          this.snack = true;
          this.snackColor = "success";
          this.snackText = "Category has been deleted";
        } catch (e) {
          this.loading = false;

          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Category could not be deleted";

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
        this.loading = true;
        try {
          await this.updateBlood({
            index: this.editedIndex,
            category: this.editedItem,
          });
          this.loading = false;
          this.close();

          this.snack = true;
          this.snackColor = "success";
          this.snackText = "Category has been updated";
        } catch (e) {
          this.loading = false;
          this.close();

          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Category could not be updated";

          console.error(e);
        }
      } else {
        this.loading = true;
        try {
          await this.addBlood(this.editedItem);
          this.loading = false;
          this.close();

          this.snack = true;
          this.snackColor = "success";
          this.snackText = "Category added";
        } catch (e) {
          this.loading = false;
          this.close();

          this.snack = true;
          this.snackColor = "error";
          this.snackText = "Category could not be created";

          console.error(e);
        }
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
