<template>
  <div>
    <!-- 导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div class="container-fluid">
        <!-- 左侧问候语 -->
        <span class="navbar-text me-3">
          欢迎，{{ userNickname }}！
        </span>

        <!-- 左侧导航按钮 -->
        <div class="navbar-nav me-auto">
          <button
              v-for="(page, index) in pages"
              :key="index"
              @click="currentView = page.component"
              class="btn btn-outline-primary mx-2"
          >
            {{ page.name }}
          </button>
        </div>

        <!-- 右侧用户设置按钮 -->
        <div
            class="navbar-nav position-relative"
            @mouseenter="onHover(true)"
            @mouseleave="onHover(false)"
        >
          <!-- 圆圈按钮 -->
          <button
              class="btn btn-primary rounded-circle"
              style="width: 40px; height: 40px;"
              @click="currentView = 'UserSettingsPage'"
          >
            <i class="fas fa-user"></i>
          </button>

          <!-- 退出按钮 -->
          <transition name="fade-scale">
            <button
                v-if="showLogout"
                class="btn btn-danger logout-btn"
                @mouseenter="onHover(true)"
                @mouseleave="onHover(false)"
                @click="logout"
            >
              退出
            </button>
          </transition>
        </div>
      </div>
    </nav>

    <!-- 内容区 -->
    <div v-if="isAuthenticated" class="content-container mt-4">
      <transition name="fade-scale" mode="out-in">
        <component :is="currentView" />
      </transition>
    </div>
    <div v-else class="loading-container">
      <p>Loading...</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

// 导入子页面组件
import ObjectDetectionPage from "./ObjectDetectionPage.vue";
import DetectionRecordsPage from "./DetectionRecordsPage.vue";
import AlgorithmOptimizationPage from "./AlgorithmOptimizationPage.vue";
import AboutPage from "./AboutPage.vue";
import UserSettingsPage from "./UserSettingsPage.vue";

export default {
  name: "UserView",
  components: {
    ObjectDetectionPage,
    DetectionRecordsPage,
    AlgorithmOptimizationPage,
    AboutPage,
    UserSettingsPage,
  },
  data() {
    return {
      isAuthenticated: false,
      isLoading: true, // 增加加载状态
      userNickname: "", // 用户昵称
      currentView: "ObjectDetectionPage", // 默认页面
      pages: [
        { name: "目标检测", component: "ObjectDetectionPage" },
        { name: "检测记录查看", component: "DetectionRecordsPage" },
        { name: "算法优化展示", component: "AlgorithmOptimizationPage" },
        { name: "关于页面", component: "AboutPage" },
      ],
      showLogout: false, // 控制退出按钮显示
      hoverTimeout: null, // 用于延迟隐藏的定时器
    };
  },
  async created() {
    const jwtToken = localStorage.getItem("jwtToken");

    if (!jwtToken) {
      this.redirectToLogin();
      return;
    }

    // 验证用户身份并获取昵称
    try {
      const verifyResponse = await axios.get(
          "http://127.0.0.1:8000/api/verify-token/",
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
      );

      if (
          verifyResponse.data.status === "success" &&
          verifyResponse.data.role === "user"
      ) {
        this.isAuthenticated = true;
        this.userNickname = verifyResponse.data.nickname || "用户"; // 设置昵称，默认“用户”
      } else {
        this.handleAuthError();
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      this.handleAuthError();
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    redirectToLogin() {
      localStorage.removeItem("jwtToken"); // 清除无效 Token
      this.$router.push("/login"); // 使用 Vue Router 进行重定向
    },
    handleAuthError() {
      localStorage.removeItem("jwtToken"); // 清除无效 Token
      this.redirectToLogin();
    },
    logout() {
      localStorage.removeItem("jwtToken"); // 删除JWT Token
      this.$router.push("/login"); // 跳转到登录页面
    },
    onHover(isHovered) {
      clearTimeout(this.hoverTimeout); // 清除已有的定时器

      if (isHovered) {
        this.showLogout = true; // 鼠标悬停时显示按钮
      } else {
        // 鼠标移出后延迟1秒隐藏按钮
        this.hoverTimeout = setTimeout(() => {
          this.showLogout = false;
        }, 300);
      }
    },
  },
};
</script>

<style scoped>
/* 页面布局样式 */
.content-container {
  padding: 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: Arial, sans-serif;
}

/* 导航栏样式 */
.navbar-text {
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
}

/* 导航栏按钮样式 */
.navbar-nav .btn {
  margin-right: 10px;
}

/* 动画效果 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-scale-enter,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.75); /* 缩放效果：从75%到100%，或者100%到75% */
}

/* 退出按钮样式 */
.logout-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-57%, 80%); /* 保证按钮与圆圈居中 */
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px; /* 按钮大小合适 */
  font-size: 14px;
  border-radius: 5px;
  z-index: 10;
  white-space: nowrap; /* 防止文字换行 */
}

.logout-btn:hover {
  background-color: #c82333;
}
</style>
