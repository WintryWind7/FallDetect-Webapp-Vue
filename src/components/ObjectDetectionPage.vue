<template>
  <div class="detection-records-container">
    <h1>目标检测</h1>
    <div class="main-content">
      <!-- 左侧：上传图片窗口 -->
      <div
          class="upload-area"
          @dragover.prevent
          @drop="handleDrop"
          @dragenter.prevent
          @dragleave.prevent
      >
        <p v-if="!uploadedImageUrl">拖拽图片到此处或点击上传</p>
        <img
            v-else
            :src="uploadedImageUrl"
            alt="Uploaded Image"
            class="preview-image"
        />
        <input
            type="file"
            class="file-input"
            accept="image/*"
            @change="handleFileUpload"
        />
      </div>

      <!-- 右侧：结果显示窗口 -->
      <div class="result-area">
        <p v-if="!detectionResult && !isLoading">检测结果将在此处显示</p>
        <!-- 加载动画 -->
        <div v-if="isLoading" class="loading-spinner"></div>
        <!-- 显示带有标注的图片 -->
        <canvas
            v-if="detectionResult && !isLoading"
            ref="resultCanvas"
            class="result-canvas"
        ></canvas>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="submit-area">
      <button
          class="btn btn-primary"
          :disabled="!uploadedFile || isLoading"
          @click="submitImage"
      >
        提交
      </button>
    </div>

    <!-- Toast 提示框 -->
    <div v-if="toastMessage" class="toast-container">
      <div class="toast">{{ toastMessage }}</div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DetectionRecordsPage",
  data() {
    return {
      uploadedFile: null, // 存储用户上传的图片文件
      uploadedImageUrl: null, // 图片的预览 URL
      detectionResult: null, // 检测结果
      toastMessage: "", // 提示消息内容
      isLoading: false, // 是否正在加载
    };
  },
  methods: {
    // 处理文件上传
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.uploadedFile = file;
        this.uploadedImageUrl = URL.createObjectURL(file); // 创建本地预览 URL
      }
    },
    // 拖拽上传文件处理
    handleDrop(event) {
      const file = event.dataTransfer.files[0];
      if (file) {
        this.uploadedFile = file;
        this.uploadedImageUrl = URL.createObjectURL(file); // 创建本地预览 URL
      }
    },
    // 提交图片到后端
    async submitImage() {
      if (!this.uploadedFile) {
        this.showToast("请先上传图片！");
        return;
      }

      const jwtToken = localStorage.getItem("jwtToken");
      const formData = new FormData();
      formData.append("image", this.uploadedFile); // 直接上传文件

      this.isLoading = true; // 开始加载动画
      this.detectionResult = null; // 清空之前的检测结果

      try {
        // 上传图片至后端
        const uploadResponse = await axios.post(
            "http://127.0.0.1:8000/api/image/upload/",
            formData,
            {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
                "Content-Type": "multipart/form-data",
              },
            }
        );

        const imageId = uploadResponse.data.image_id;
        this.showToast("图片上传成功，正在检测...");

        // 调用检测 API 获取结果
        const predictResponse = await axios.post(
            "http://127.0.0.1:8000/api/image/predict/",
            { image_id: imageId },
            {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
              },
            }
        );

        this.detectionResult = predictResponse.data.detected_objects;
        this.showToast("目标检测完成！");
        this.drawDetectionResult(); // 绘制检测结果
      } catch (error) {
        console.error("检测过程失败：", error);
        this.showToast("检测失败，请稍后再试！");
      } finally {
        this.isLoading = false; // 停止加载动画
      }
    },
    // 显示 Toast 提示消息
    showToast(message) {
      this.toastMessage = message;
      setTimeout(() => {
        this.toastMessage = ""; // 3秒后清除提示消息
      }, 3000);
    },
    // 绘制检测结果到 Canvas 上
    drawDetectionResult() {
      this.$nextTick(() => {
        const canvas = this.$refs.resultCanvas;

        // 确保 Canvas 被正确引用
        if (!canvas) {
          console.error("Canvas 元素未找到！");
          return;
        }

        const ctx = canvas.getContext("2d");
        const image = new Image();
        image.src = this.uploadedImageUrl;

        // 在图片加载完成后再绘制
        image.onload = () => {
          // 设置 Canvas 尺寸与图片一致
          canvas.width = image.width;
          canvas.height = image.height;

          // 绘制图片到 Canvas
          ctx.drawImage(image, 0, 0, image.width, image.height);

          // 绘制边界框、置信度和标签
          this.detectionResult.forEach((item) => {
            const { bbox, confidence, class: label } = item;

            // 绘制边界框
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]);

            // 绘制标签和置信度
            ctx.fillStyle = "red";
            ctx.font = "16px Arial";
            const text = `${label} (${(confidence * 100).toFixed(1)}%)`;
            ctx.fillText(text, bbox[0], bbox[1] - 5);
          });
        };

        // 监听图片加载错误
        image.onerror = () => {
          console.error("图片加载失败，请检查图片 URL！");
        };
      });
    },
  },
};
</script>

<style scoped>
.detection-records-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  text-align: center;
}

.main-content {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin: 20px 0;
}

.upload-area,
.result-area {
  flex: 1;
  border: 2px dashed #007bff;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  text-align: center;
  position: relative;
}

.upload-area:hover {
  background-color: #f8f9fa;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
}

.result-canvas {
  border-radius: 10px;
  max-width: 100%;
  max-height: 100%;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.toast-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.toast {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  10%,
  90% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(20px);
  }
}
</style>
