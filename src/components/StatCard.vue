<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon: unknown
  color: string
  suffix?: string
}>()
</script>

<template>
  <el-card shadow="hover" class="stat-card" :body-style="{ padding: '20px' }">
    <div class="stat-card__inner">
      <div class="stat-card__icon" :style="{ backgroundColor: color }">
        <el-icon :size="26" color="#fff"><component :is="icon" /></el-icon>
      </div>
      <div class="stat-card__content">
        <div class="stat-card__title">{{ title }}</div>
        <div class="stat-card__value">
          {{ value }}<span v-if="suffix" class="stat-card__suffix">{{ suffix }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.stat-card__inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card__title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 6px;
}

.stat-card__value {
  font-size: 26px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-card__suffix {
  font-size: 14px;
  font-weight: 400;
  color: #909399;
  margin-left: 4px;
}
</style>
