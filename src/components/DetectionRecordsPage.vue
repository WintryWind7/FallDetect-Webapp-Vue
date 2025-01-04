<template>
  <div class="records-container">
    <!-- 页面标题 -->
    <h1>检测记录查看</h1>

    <!-- 消息通知 -->
    <div v-if="notification" class="notification">
      {{ notification }}
    </div>

    <!-- 搜索框 -->
    <div class="search-bar">
      <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索检测记录（按标签或结果）"
      />
    </div>

    <!-- 检测记录列表 -->
    <div class="record-list">
      <div v-for="index in itemsPerPage" :key="index" class="record-item">
        <transition name="fade" mode="out-in">
          <div v-if="paginatedRecords[index - 1]" class="record-content">
            <div class="record-details">
              <div class="details-column">
                <p><strong>ID:</strong> {{ paginatedRecords[index - 1].id }}</p>
                <p><strong>检测时间:</strong> {{ paginatedRecords[index - 1].upload_time }}</p>
                <p><strong>状态:</strong> <span :class="getStatusClass(paginatedRecords[index - 1].status)">{{ getStatusText(paginatedRecords[index - 1].status) }}</span></p>
              </div>
              <div class="details-column">
                <p>
                  <strong>备注:</strong>
                  <textarea
                      v-show="editingRecordId === paginatedRecords[index - 1].id"
                      @keydown="handleReviewKeydown(paginatedRecords[index - 1], $event)"
                      @blur="saveReview(paginatedRecords[index - 1])"
                      class="editable-review-textarea"
                      v-model="paginatedRecords[index - 1].review"
                  ></textarea>
                  <span
                      v-show="editingRecordId !== paginatedRecords[index - 1].id"
                      @click="editReview(paginatedRecords[index - 1])"
                      class="editable-review"
                  >
                    {{ paginatedRecords[index - 1].review || '点击添加备注' }}
                  </span>
                </p>
              </div>
            </div>
            <div class="record-images">
              <div class="record-image">
                <p>原图:</p>
                <img
                    :src="getImageUrl(paginatedRecords[index - 1].image)"
                    alt="原图"
                    class="thumbnail scaled-thumbnail"
                />
              </div>
              <div class="record-image">
                <p>检测结果:</p>
                <canvas
                    v-if="paginatedRecords[index - 1].result"
                    :id="'canvas-' + paginatedRecords[index - 1].id"
                    class="result-canvas scaled-thumbnail"
                ></canvas>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 分页控件 -->
    <div class="pagination-fixed">
      <div v-if="totalPages > 1" class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
        <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-if="!filteredRecords.length" class="no-data">
      <p>没有符合条件的检测记录。</p>
    </div>
  </div>
</template>


<script>
import axios from "axios";

export default {
  name: "DetectionRecordsPage",
  data() {
    return {
      userId: null, // 当前用户 ID
      username: null, // 当前用户名
      detectionRecords: [], // 所有检测记录
      searchQuery: "", // 搜索关键字
      editingRecordId: null, // 当前正在编辑备注的记录 ID
      notification: null, // 消息通知内容
      currentPage: 1, // 当前页码
      itemsPerPage: 3, // 每页显示的记录数
    };
  },
  computed: {
    filteredRecords() {
      if (!this.searchQuery) {
        return this.getSortedRecords();
      }
      return this.detectionRecords
          .filter(
              (record) =>
                  record.result
                      .toLowerCase()
                      .includes(this.searchQuery.toLowerCase()) ||
                  record.status.toLowerCase().includes(this.searchQuery.toLowerCase())
          )
          .sort((a, b) => b.id - a.id);
    },
    totalPages() {
      return Math.ceil(this.filteredRecords.length / this.itemsPerPage);
    },
    paginatedRecords() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredRecords.slice(start, start + this.itemsPerPage);
    },
  },
  async created() {
    try {
      const jwtToken = localStorage.getItem("jwtToken");

      if (!jwtToken) {
        this.redirectToLogin("您的认证已过期，请重新登录。");
        return;
      }

      const userResponse = await axios.get(
          "http://127.0.0.1:8000/api/verify-token/",
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
      );

      this.userId = userResponse.data.id;
      this.username = userResponse.data.username;

      const recordsResponse = await axios.get(
          "http://127.0.0.1:8000/api/image/user-detection-records/",
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
      );

      this.detectionRecords = recordsResponse.data.filter(
          (record) => record.user_id === this.userId
      );

      this.$nextTick(() => {
        this.detectionRecords.forEach((record) => {
          if (record.result) {
            this.drawDetectionResult(record);
          }
        });
      });
    } catch (error) {
      console.error("Error fetching detection records:", error);
      this.redirectToLogin("您的认证已过期，请重新登录。");
    }
  },
  watch: {
    // 监听当前页码的变化
    currentPage() {
      this.$nextTick(() => {
        this.paginatedRecords.forEach((record) => {
          if (record.result) {
            this.drawDetectionResult(record);
          }
        });
      });
    },

    // 如果 `filteredRecords` 或搜索关键字变化，重新绘制
    filteredRecords() {
      this.$nextTick(() => {
        this.paginatedRecords.forEach((record) => {
          if (record.result) {
            this.drawDetectionResult(record);
          }
        });
      });
    },
  },
  methods: {
    getImageUrl(imagePath) {
      const fixedPath = imagePath
          .replace(/\\/g, "/")
          .replace("D:/Codes/Works/FallDetect/api/src", "");
      return `http://127.0.0.1:8000${fixedPath}`;
    },
    redirectToLogin(message) {
      alert(message);
      localStorage.removeItem("jwtToken");
      this.$router.push("/login");
    },
    drawDetectionResult(record) {
      const canvas = document.getElementById("canvas-" + record.id);
      if (!canvas) {
        console.error(`Canvas for record ${record.id} not found.`);
        return;
      }

      const ctx = canvas.getContext("2d");
      const image = new Image();
      image.src = this.getImageUrl(record.image);

      image.onload = () => {
        const originalWidth = image.width;
        const originalHeight = image.height;

        const scaleFactor = 1;
        canvas.width = originalWidth * scaleFactor;
        canvas.height = originalHeight * scaleFactor;

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        try {
          const resultData = JSON.parse(record.result.replace(/'/g, '"'));
          resultData.forEach((item) => {
            const { bbox, confidence, class: label } = item;

            const scaledBBox = [
              bbox[0] * scaleFactor,
              bbox[1] * scaleFactor,
              bbox[2] * scaleFactor,
              bbox[3] * scaleFactor,
            ];

            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(
                scaledBBox[0],
                scaledBBox[1],
                scaledBBox[2] - scaledBBox[0],
                scaledBBox[3] - scaledBBox[1]
            );

            ctx.fillStyle = "red";
            ctx.font = "16px Arial";
            const text = `${label} (${(confidence * 100).toFixed(1)}%)`;
            ctx.fillText(text, scaledBBox[0], scaledBBox[1] - 5);
          });
        } catch (error) {
          console.error("Error parsing detection result:", error);
        }
      };

      image.onerror = () => {
        console.error("Failed to load image for record", record.id);
      };
    },
    getStatusText(status) {
      const statusMapping = {
        pending: "待检测",
        completed: "检测完成",
        failed: "检测失败",
      };
      return statusMapping[status] || "未知状态";
    },
    getStatusClass(status) {
      const classMapping = {
        pending: "status-pending",
        completed: "status-completed",
        failed: "status-failed",
      };
      return classMapping[status] || "";
    },
    editReview(record) {
      this.editingRecordId = record.id;
    },
    async saveReview(record) {
      this.editingRecordId = null;
      try {
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken || !this.username) {
          this.redirectToLogin("用户认证信息丢失，请重新登录。");
          return;
        }

        await axios.post(
            "http://127.0.0.1:8000/api/image/update-review/",
            {
              id: record.id,
              username: this.username,
              review: record.review,
            },
            {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
              },
            }
        );

        this.showNotification("备注保存成功！");
      } catch (error) {
        console.error("Error saving review:", error);
        this.showNotification("保存备注失败，请重试！");
      }
    },
    handleReviewKeydown(record, event) {
      if (event.key === "Enter") {
        if (!event.shiftKey) {
          event.preventDefault();
          this.saveReview(record);
        }
      }
    },
    showNotification(message) {
      this.notification = message;
      setTimeout(() => {
        this.notification = null;
      }, 3000);
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    getSortedRecords() {
      return [...this.detectionRecords].sort((a, b) => b.id - a.id);
    },
  },
};
</script>

<style scoped>
.records-container {
  padding: 20px;
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

.record-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.record-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9f9f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.record-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.record-details {
  display: flex;
  justify-content: space-between;
  flex: 1;
  font-size: 14px;
  line-height: 1.8;
}

.details-column {
  flex: 1;
}

.editable-review {
  cursor: pointer;
  border: 1px dashed transparent;
  padding: 2px;
}

.editable-review-textarea {
  width: 100%;
  border: 1px solid #007bff;
  border-radius: 4px;
  padding: 4px;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
}

.record-images {
  display: flex;
  gap: 20px;
  flex: 1;
  justify-content: flex-end;
}

.record-image {
  text-align: center;
}

.record-image p {
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: bold;
}

.thumbnail.scaled-thumbnail {
  width: auto;
  height: auto;
  max-width: 55%;
  max-height: 55%;
  object-fit: contain;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.result-canvas.scaled-thumbnail {
  width: auto;
  height: auto;
  max-width: 55%;
  max-height: 55%;
  object-fit: contain;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.no-data {
  text-align: center;
  font-size: 16px;
  color: #666;
}

.notification {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  z-index: 1000;
}

.pagination-fixed {
  position: fixed;
  bottom: 20px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  padding: 10px 0;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.pagination button {
  padding: 5px 10px;
  font-size: 14px;
  border: 1px solid #007bff;
  border-radius: 4px;
  background-color: #fff;
  color: #007bff;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ddd;
  color: #999;
  cursor: not-allowed;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.status-pending {
  color: yellow;
}

.status-completed {
  color: green;
}

.status-failed {
  color: red;
}


.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
