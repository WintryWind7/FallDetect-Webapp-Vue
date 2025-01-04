<template>
  <div class="container mt-5" id="app">
    <!-- 背景图片 -->
    <div class="background-image"></div>

    <!-- 登录和注册窗口 -->
    <div class="content-container">
      <div class="row justify-content-center align-items-center vh-100">
        <div class="col-md-8">
          <!-- 固定窗口布局 -->
          <div class="card p-5 shadow fixed-card-size">
            <!-- 添加透明占位框实现居中 -->
            <div class="spacer" ></div>

            <!-- 提示信息 -->
            <div v-if="message" class="alert-container">
              <div class="alert alert-info alert-dismissible fade show" role="alert">
                {{ message }}
                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="alert"
                    aria-label="Close"
                    @click="clearMessage"
                ></button>
              </div>
            </div>

            <!-- 标题文字淡入淡出效果 -->
            <transition name="fade" mode="out-in">
              <h3 class="text-center mb-4" :key="isLoginMode">
                {{ isLoginMode ? "登录" : "注册" }}
              </h3>
            </transition>

            <!-- 使用 transition 包裹内容部分 -->
            <transition
                name="fade-scale"
                mode="out-in"
                @before-enter="beforeEnter"
                @after-leave="afterLeave"
            >
              <!-- 登录窗口 -->
              <div v-if="isLoginMode" key="login">
                <div class="form-group">
                  <label for="loginUsername">用户名</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text transparent-container">
                        <img
                            src="/image/usernameimg.png"
                            alt="icon"
                            class="fixed-image"
                            style="width: 24px;"
                        />
                      </span>
                    </div>
                    <input
                        type="text"
                        id="loginUsername"
                        class="form-control"
                        v-model="registerData.username"
                        placeholder="输入用户名"
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label for="loginPassword">密码</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text transparent-container">
                        <img
                            src="/image/passwordimg.png"
                            alt="icon"
                            class="fixed-image"
                            style="width: 24px;"
                        />
                      </span>
                    </div>
                    <input
                        :type="showLoginPassword ? 'text' : 'password'"
                        id="loginPassword"
                        class="form-control"
                        v-model="registerData.password"
                        placeholder="输入密码"
                    />
                    <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="toggleShowPassword('login')"
                    >
                      {{ showLoginPassword ? "隐藏" : "显示" }}
                    </button>
                  </div>
                </div>

                <!-- 登录按钮居中 -->
                <div class="text-center mt-4">
                  <button class="btn btn-primary" @click="handleLogin">登录</button>
                </div>

                <!-- 注册提示链接 -->
                <div class="text-center mt-3">
                  <a href="javascript:void(0)" @click="switchToRegister">
                    没有账号？点击此处进入注册
                  </a>
                </div>
              </div>

              <!-- 注册窗口 -->
              <div v-else key="register">
                <div class="form-group">
                  <label for="registerUsername">用户名</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text transparent-container">
                        <img
                            src="/image/usernameimg.png"
                            alt="icon"
                            class="fixed-image"
                            style="width: 24px;"
                        />
                      </span>
                    </div>
                    <input
                        type="text"
                        id="registerUsername"
                        class="form-control"
                        v-model="registerData.username"
                        placeholder="输入用户名"
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label for="registerPassword">密码</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text transparent-container">
                        <img
                            src="/image/passwordimg.png"
                            alt="icon"
                            class="fixed-image"
                            style="width: 24px;"
                        />
                      </span>
                    </div>
                    <input
                        :type="showRegisterPassword ? 'text' : 'password'"
                        id="registerPassword"
                        class="form-control"
                        v-model="registerData.password"
                        placeholder="输入密码"
                    />
                    <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="toggleShowPassword('register')"
                    >
                      {{ showRegisterPassword ? "隐藏" : "显示" }}
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label for="confirmPassword">确认密码</label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <span class="input-group-text transparent-container">
                        <img
                            src="/image/passwordimg.png"
                            alt="icon"
                            class="fixed-image"
                            style="width: 24px;"
                        />
                      </span>
                    </div>
                    <input
                        :type="showConfirmPassword ? 'text' : 'password'"
                        id="confirmPassword"
                        class="form-control"
                        v-model="registerData.confirmPassword"
                        placeholder="再次输入密码"
                    />
                    <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="toggleShowPassword('confirm')"
                    >
                      {{ showConfirmPassword ? "隐藏" : "显示" }}
                    </button>
                  </div>
                </div>

                <!-- 注册按钮居中 -->
                <div class="text-center mt-4">
                  <button class="btn btn-success" @click="handleRegister">注册</button>
                </div>

                <!-- 登录提示链接 -->
                <div class="text-center mt-3">
                  <a href="javascript:void(0)" @click="switchToLogin">
                    已有账号？点击此处登录
                  </a>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      isLoginMode: true,
      registerData: {
        username: "",
        password: "",
        confirmPassword: "",
      },
      message: "",
      showLoginPassword: false,
      showRegisterPassword: false,
      showConfirmPassword: false,
    };
  },
  created() {
    const params = new URLSearchParams(window.location.search);
    this.message = params.get("message") || "";
  },
  methods: {
    toggleShowPassword(field) {
      if (field === "login") {
        this.showLoginPassword = !this.showLoginPassword;
      } else if (field === "register") {
        this.showRegisterPassword = !this.showRegisterPassword;
      } else if (field === "confirm") {
        this.showConfirmPassword = !this.showConfirmPassword;
      }
    },
    handleLogin() {
      const loginPayload = {
        username: this.registerData.username,
        password: this.registerData.password,
      };

      axios
          .post("http://127.0.0.1:8000/api/login/", loginPayload, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            const message = response.data.message;
            if (message === "Admin login successful") {
              this.message = "登录成功，正在跳转...";
              setTimeout(() => {
                localStorage.setItem("jwtToken", response.data.access);
                this.$router.push({ path: "/admin-dashboard" });
              }, 2000);
            } else if (message === "User login successful") {
              this.message = "登录成功，正在跳转...";
              setTimeout(() => {
                localStorage.setItem("jwtToken", response.data.access);
                this.$router.push({ path: "/user-dashboard" });
              }, 2000);
            } else {
              this.message = message || "账户或密码错误";
            }
          })
          .catch((error) => {
            console.error("登录错误:", error);
            this.message = "账户或密码错误";
          });
    },
    handleRegister() {
      if (this.registerData.password !== this.registerData.confirmPassword) {
        this.message = "两次输入的密码不一致，请重新输入！";
        return;
      }

      const registerPayload = {
        username: this.registerData.username,
        password: this.registerData.password,
      };

      axios
          .post("http://127.0.0.1:8000/api/register/", registerPayload, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            const message = response.data.message;
            if (response.data.status === "success") {
              this.message = message || "注册成功，请使用您的新账户登录！";
              this.switchToLogin();
            } else {
              this.message = message || "请联系管理员...";
            }
          })
          .catch((error) => {
            console.error("注册错误:", error);
            this.message = error.response?.data?.message || "请检查网络连接";
          });
    },
    clearMessage() {
      this.message = "";
    },
    switchToLogin() {
      this.isLoginMode = true;
      this.registerData.confirmPassword = "";
    },
    switchToRegister() {
      this.isLoginMode = false;
    },
    beforeEnter(el) {
      console.log("新内容即将进入：", el);
    },
    afterLeave(el) {
      console.log("旧内容已离开：", el);
    },
  },
};
</script>

<style>

/* 背景图片样式 */
.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/background.jpg');
  background-size: cover;
  background-position: center;
  filter: brightness(0.6);
  z-index: -1;
}

/* 渐变效果 */
.background-image::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.8));
}

/* 内容容器样式 */
.content-container {
  position: relative;
  z-index: 1;
}

/* 动画效果：淡入淡出标题 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/* 内容切换动画 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.8s ease;
}
.fade-scale-enter,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* 提示信息样式 */
.alert-container {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1050;
  width: 80%;
  max-width: 600px;
}

/* 调整窗口边距和样式 */
.card {
  border-radius: 10px;
}

/* 确保窗口大小一致 */
.fixed-card-size {
  height: 500px;
}

/* 按钮居中 */
.text-center button {
  width: 50%;
}

/* 链接样式 */
.text-center a {
  color: #007bff;
  text-decoration: none;
}

.text-center a:hover {
  text-decoration: underline;
}

/* 外侧 div 背景透明 */
.transparent-container {
  background-color: transparent; /* 设置透明背景 */
  width: 40px; /* 固定宽度 */
  height: 40px; /* 固定高度 */
  display: flex; /* 使用 flex 居中内容 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  overflow: hidden; /* 防止内容溢出 */
  border-radius: 4px; /* 可选，设置圆角 */
}


/* 修改 input-group-prepend 样式 */
.input-group-prepend {
  background-color: transparent; /* 设置透明背景 */
  width: 40px; /* 固定宽度 */
  height: 40px; /* 固定高度 */
  display: flex; /* 使用 flex 居中内容 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
}

/* 修改 input-group-text 样式 */
.input-group-text {
  background-color: transparent; /* 确保文字背景也透明 */
  border: none; /* 可选，去掉边框 */
  width: 100%; /* 宽度填充父容器 */
  height: 100%; /* 高度填充父容器 */
  display: flex; /* 居中对齐内容 */
  align-items: center;
  justify-content: center;
  padding: 0; /* 去掉多余的 padding */
}

/* 图片样式 */
.fixed-image {
  width: 100%; /* 图片宽度填满容器 */
  height: 100%; /* 图片高度填满容器 */
  object-fit: contain; /* 按比例缩放并完整显示图片 */
  display: block; /* 去掉 inline 元素的空白间隙 */
}

</style>
