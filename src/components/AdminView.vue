<template>
  <div class="admin-container">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <button
          v-for="(table, index) in tables"
          :key="index"
          class="sidebar-button"
          @click="selectTable(index)"
      >
        {{ table.name }}
      </button>
    </div>

    <!-- 右侧内容区域 -->
    <div class="content">
      <!-- 顶部删除成功消息 -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <div v-if="loading" class="loading">Loading data...</div>
      <div v-else>
        <!-- 搜索框 -->
        <div class="search-bar">
          <input type="text" v-model="searchQuery" placeholder="Search by keyword" />
        </div>

        <!-- 表格 -->
        <table border="0" class="data-table" v-if="filteredData.length">
          <thead>
          <tr>
            <th v-for="header in selectedTable.headers" :key="header">
              {{ header }}
            </th>
            <th>操作</th> <!-- 添加操作列 -->
          </tr>
          </thead>
          <tbody>
          <tr v-for="(row, rowIndex) in filteredData" :key="row.id">
            <td v-for="header in selectedTable.headers" :key="header">
              {{ row[header] }}
            </td>
            <td>
              <!-- 红色 X 删除按钮 -->
              <span class="delete-x" @click="toggleConfirmDelete(rowIndex)">X</span>
              <transition name="fade">
                <button
                    v-if="rowIndex === confirmDeleteIndex"
                    class="confirm-delete-button"
                    @click="confirmDelete(row.id)"
                >
                  确定
                </button>
              </transition>
            </td>
          </tr>
          </tbody>
        </table>
        <div v-else>
          <p>No data available for the selected table or search query.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminView",
  data() {
    return {
      isAdmin: false,
      loading: true,
      tables: [
        { name: "Users", endpoint: "/api/users/", headers: ["id", "username", "is_admin", "timestamp", "last_login"] },
        { name: "Images", endpoint: "/api/images/", headers: ["id", "username", "upload_time", "status", "result"] },
        { name: "Logs", endpoint: "/api/logs/", headers: ["id", "username", "action", "timestamp", "detail"] },
      ],
      selectedTableIndex: 0, // 默认选择第一个表
      tableData: [],
      searchQuery: "",
      confirmDeleteIndex: null, // 当前显示“确定”按钮的行索引
      successMessage: "", // 删除成功消息
    };
  },
  computed: {
    selectedTable() {
      return this.tables[this.selectedTableIndex];
    },
    filteredData() {
      if (!this.searchQuery) return this.tableData;
      return this.tableData.filter((row) =>
          Object.values(row).some((value) =>
              String(value).toLowerCase().includes(this.searchQuery.toLowerCase())
          )
      );
    },
  },
  async created() {
    const jwtToken = localStorage.getItem("jwtToken");

    if (!jwtToken) {
      this.redirectToLogin("您的认证已过期，请重新登录。");
      return;
    }

    // Verify admin status
    try {
      const verifyResponse = await axios.get("http://127.0.0.1:8000/api/verify-token/", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (verifyResponse.data.status === "success" && verifyResponse.data.role === "admin") {
        this.isAdmin = true;
        this.fetchTableData(jwtToken);
      } else {
        this.redirectToLogin("您的认证已过期，请重新登录。");
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      this.redirectToLogin("您的认证已过期，请重新登录。");
    }
  },
  methods: {
    async fetchTableData(jwtToken) {
      this.loading = true;
      try {
        const response = await axios.get(`http://127.0.0.1:8000${this.selectedTable.endpoint}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        this.tableData = response.data;
        this.loading = false;
      } catch (error) {
        console.error("Error fetching table data:", error);
        this.loading = false;
      }
    },
    selectTable(index) {
      this.selectedTableIndex = index;
      this.tableData = [];
      this.searchQuery = "";
      const jwtToken = localStorage.getItem("jwtToken");
      this.fetchTableData(jwtToken);
    },
    toggleConfirmDelete(rowIndex) {
      // 切换显示“确定”按钮的行索引
      this.confirmDeleteIndex = this.confirmDeleteIndex === rowIndex ? null : rowIndex;
    },
    async confirmDelete(rowId) {
      const jwtToken = localStorage.getItem("jwtToken");
      if (!jwtToken) {
        this.redirectToLogin("您的认证已过期，请重新登录。");
        return;
      }

      try {
        const response = await axios.post(
            `http://127.0.0.1:8000/api/delete-row/`,
            {
              table: this.selectedTable.name,
              id: rowId,
            },
            {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
              },
            }
        );

        if (response.data.status === "success") {
          this.successMessage = "删除成功！";
          setTimeout(() => {
            this.successMessage = "";
          }, 3000); // 3秒后清除消息
          this.tableData = this.tableData.filter((row) => row.id !== rowId); // 移除数据
        } else {
          alert("删除失败，请稍后重试。");
        }
      } catch (error) {
        console.error("Error deleting row:", error);
        alert("删除失败，请检查网络连接。");
      } finally {
        this.confirmDeleteIndex = null; // 隐藏“确定”按钮
      }
    },
    redirectToLogin(message) {
      window.location.href = `/login?message=${encodeURIComponent(message)}`;
    },
  },
};
</script>

<style scoped>
.admin-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 20%;
  background-color: #eaf6ff;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-button {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border: none;
  background-color: #fff;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s;
}

.sidebar-button:hover {
  background-color: #d0e6ff;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #666;
}

.success-message {
  padding: 10px;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.data-table th,
.data-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.data-table tr {
  background-color: #f9f9f9;
}

.data-table tr:nth-child(even) {
  background-color: #f1f1f1;
}

.delete-x {
  color: red;
  font-weight: bold;
  cursor: pointer;
  font-size: 20px;
}

.delete-x:hover {
  color: darkred;
}

.confirm-delete-button {
  margin-left: 10px;
  padding: 5px 10px;
  font-size: 14px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.confirm-delete-button:hover {
  background-color: #0056b3;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
