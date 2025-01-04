<template>
  <div class="user-settings-container">
    <h1>用户设置</h1>
    <form @submit.prevent="updateUserInfo" class="user-settings-form">
      <!-- 用户名（只读） -->
      <div class="form-group">
        <label for="username">用户名</label>
        <input
            type="text"
            id="username"
            class="form-control"
            v-model="userInfo.username"
            readonly
        />
      </div>

      <!-- 昵称 -->
      <div class="form-group">
        <label for="nickname">昵称</label>
        <input
            type="text"
            id="nickname"
            class="form-control"
            v-model="userInfo.nickname"
            placeholder="请输入昵称"
        />
      </div>

      <!-- 邮箱 -->
      <div class="form-group">
        <label for="email">邮箱</label>
        <input
            type="email"
            id="email"
            class="form-control"
            v-model="userInfo.email"
            placeholder="请输入邮箱"
        />
      </div>

      <!-- 手机号 -->
      <div class="form-group">
        <label for="phone_number">手机号</label>
        <input
            type="text"
            id="phone_number"
            class="form-control"
            v-model="userInfo.phone_number"
            placeholder="请输入手机号"
        />
      </div>

      <!-- 保存按钮 -->
      <button type="submit" class="btn btn-primary">保存</button>
    </form>

    <!-- 提示信息 -->
    <div v-if="message" class="alert mt-3" :class="{'alert-success': success, 'alert-danger': !success}">
      {{ message }}
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UserSettingsPage",
  data() {
    return {
      userInfo: {
        username: "",
        nickname: "",
        email: "",
        phone_number: "",
      },
      message: "", // 用于显示提示信息
      success: false, // 用于区分提示信息类型
    };
  },
  async created() {
    const jwtToken = localStorage.getItem("jwtToken");

    if (!jwtToken) {
      this.$router.push("/login");
      return;
    }

    // 获取当前用户信息
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user/info/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      this.userInfo = response.data; // 填充表单默认值
    } catch (error) {
      console.error("获取用户信息失败：", error);
      this.message = "无法加载用户信息，请稍后再试。";
      this.success = false;
    }
  },
  methods: {
    async updateUserInfo() {
      const jwtToken = localStorage.getItem("jwtToken");

      try {
        const response = await axios.put(
            "http://127.0.0.1:8000/api/user/update/",
            {
              nickname: this.userInfo.nickname,
              email: this.userInfo.email,
              phone_number: this.userInfo.phone_number,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
              },
            }
        );

        this.message = response.data.message || "用户信息更新成功";
        this.success = true;
      } catch (error) {
        console.error("更新用户信息失败：", error);
        this.message =
            error.response?.data?.error || "更新用户信息时发生错误，请重试。";
        this.success = false;
      }
    },
  },
};
</script>

<style scoped>
.user-settings-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.user-settings-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.btn-primary {
  margin-top: 15px;
}

.alert {
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
}

.alert-success {
  color: #155724;
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
</style>
