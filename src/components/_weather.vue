<!-- 天气组件 -->
<template>
  <div class="weather-wrapper">
    <el-skeleton v-if="loading" :rows="1" animated />
    <el-alert v-else-if="error" :title="error" type="error" :closable="false" />
    <template v-else>
      <div class="weather-main">
        <span class="city">{{ city }}</span>
        <span class="temperature">{{ temperature }}℃</span>
      </div>
      <div class="weather-info">
        <span class="weather-desc">{{ weather }}</span>
        <el-divider direction="vertical" />
        <span class="wind-info">{{ windPower }}级{{ windDirection }}风</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const API_KEY = '318d6e64adc9c16f6dab3879b6cee04c'
const ip = ref('')

const city = ref('')
const weather = ref('')
const temperature = ref('')
const windDirection = ref('')
const windPower = ref('')
const loading = ref(true)
const error = ref('')

// 获取用户IP地址
const getIpAddress = async () => {
  try {
    // 使用 ipify API 获取 IP 地址
    const response = await axios.get('https://api.ipify.org?format=json')
    ip.value = response.data.ip
    console.log('获取到IP:', ip.value)
  } catch (err) {
    console.error('获取IP失败:', err)
    error.value = '获取IP地址失败'
  }
}

// 获取天气数据
const getWeatherByCity = async () => {
  try {
    loading.value = true
    error.value = ''

    // 如果没有 IP，先获取 IP
    if (!ip.value) {
      await getIpAddress()
    }

    // 获取用户所在城市编码
    const cityResponse = await axios.get(
      `https://restapi.amap.com/v3/ip?key=${API_KEY}&ip=${ip.value}`,
    )
    if (cityResponse.data.status !== '1') {
      throw new Error(cityResponse.data.info || '获取城市信息失败')
    }

    const adcode = cityResponse.data.adcode
    if (!adcode) {
      throw new Error('无法获取城市编码')
    }
    city.value = cityResponse.data.city

    // 获取天气数据
    const weatherResponse = await axios.get(
      `https://restapi.amap.com/v3/weather/weatherInfo?key=${API_KEY}&city=${adcode}`,
    )

    if (weatherResponse.data.status !== '1') {
      throw new Error(weatherResponse.data.info || '获取天气信息失败')
    }

    const weatherData = weatherResponse.data.lives[0]
    weather.value = weatherData.weather || '暂无天气数据'
    temperature.value = weatherData.temperature || 'N/A'
    windDirection.value = weatherData.winddirection || 'N/A'
    windPower.value = weatherData.windpower || 'N/A'
  } catch (err) {
    error.value = `获取天气数据失败：${err.message || '未知错误'}`
    console.error('天气数据获取失败:', err)
  } finally {
    loading.value = false
  }
}

let refreshTimer: number

onMounted(async () => {
  await getIpAddress() // 组件加载时先获取 IP
  getWeatherByCity()
  // 每30分钟刷新一次天气数据
  refreshTimer = window.setInterval(getWeatherByCity, 30 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.weather-wrapper {
  padding: 8px;
}

.weather-main {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.city {
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.temperature {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.weather-desc {
  color: var(--el-color-success);
}

.wind-info {
  color: var(--el-text-color-secondary);
}

:deep(.el-divider--vertical) {
  margin: 0;
}
</style>
