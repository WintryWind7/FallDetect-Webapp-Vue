<template>
  <div class="about-container">
    <h1>关于本系统</h1>
    <section>
      <h2>系统名称</h2>
      <p><strong>基于改进yolov8s的行人摔倒检测识别系统</strong></p>
    </section>
    <section>
      <h2>系统简介</h2>
      <p>
        本系统通过实现图片上传与跌倒检测，结合算法优化的对比展示，直观体现深度学习在目标检测领域的应用与发展。
        系统旨在为跌倒检测的研究提供一个便捷的实验平台，同时展示算法在检测效率和精度上的提升。
      </p>
    </section>
    <section>
      <h2>研究背景</h2>
      <p>
        跌倒是老年人意外事故的主要原因，尤其是在独居场景下，及时发现跌倒行为是降低伤害的重要手段。
        然而，传统方法存在响应慢、误报率高的问题。本系统基于深度学习优化算法，为跌倒检测提供一种快速、准确的解决方案。
      </p>
    </section>
    <section>
      <h2>功能特点</h2>
      <ul>
        <li>用户图片上传与跌倒检测功能。</li>
        <li>跌倒检测结果可视化，提供置信度与耗时信息。</li>
        <li>支持检测历史记录查看与导出。</li>
        <li>展示算法优化前后的性能对比。</li>
      </ul>
    </section>
    <section>
      <h2>作者信息</h2>
      <p><strong>作者姓名：</strong>吴昊阳</p>
      <p><strong>学号：</strong>220402117</p>
      <p><strong>专业：</strong>人工智能技术应用</p>
      <p><strong>指导老师：</strong>孔钦</p>
      <p><strong>邮箱：</strong><a href="mailto:2272142104@qq.com">2272142104@qq.com</a></p>
    </section>
    <section>
      <h2>开发环境</h2>
      <ul>
        <li><strong>开发语言：</strong>Python 3.11, JavaScript</li>
        <li><strong>技术栈：</strong>前端 Vue，后端 Django，深度学习框架 PyTorch 2.3.1</li>
        <li><strong>硬件环境：</strong>NVIDIA RTX 3070 GPU</li>
        <li><strong>操作系统：</strong>Windows 11</li>
      </ul>
    </section>
  </div>
</template>

<script>
export default {
  name: "AboutPage",
};
</script>

<style scoped>
.about-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.8;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

section {
  margin-bottom: 20px;
}

h2 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #007bff;
}

p, li {
  font-size: 16px;
  color: #333;
}

ul {
  list-style-type: disc;
  padding-left: 20px;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
