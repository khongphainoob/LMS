<template>
  <div class="ai-dashboard-container p-6 bg-gray-50 min-h-screen text-gray-800 font-sans">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">AI Observability Dashboard</h1>
        <p class="text-gray-500 mt-1">Real-time metrics, cost tracking, and system health</p>
      </div>
      <div class="flex space-x-3">
        <select v-model="timeRange" @change="fetchData" class="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="7">Last 7 Days</option>
          <option value="14">Last 14 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
        <button @click="fetchData" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform hover:scale-105 transition-transform duration-200">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Total AI Calls</p>
            <h3 class="text-2xl font-bold text-gray-800">{{ totalCalls.toLocaleString() }}</h3>
          </div>
          <div class="p-3 bg-blue-100 rounded-lg text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform hover:scale-105 transition-transform duration-200">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Total Tokens</p>
            <h3 class="text-2xl font-bold text-gray-800">{{ (totalTokens / 1000).toFixed(1) }}k</h3>
          </div>
          <div class="p-3 bg-purple-100 rounded-lg text-purple-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform hover:scale-105 transition-transform duration-200">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Total Cost</p>
            <h3 class="text-2xl font-bold text-gray-800">${{ totalCost.toFixed(4) }}</h3>
          </div>
          <div class="p-3 bg-green-100 rounded-lg text-green-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transform hover:scale-105 transition-transform duration-200">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Error Rate</p>
            <h3 class="text-2xl font-bold" :class="errorRate > 5 ? 'text-red-500' : 'text-gray-800'">{{ errorRate.toFixed(1) }}%</h3>
          </div>
          <div class="p-3 rounded-lg" :class="errorRate > 5 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Daily Token Usage</h3>
        <div ref="trendChart" class="w-full h-72"></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">Cost Distribution by Agent</h3>
        <div ref="pieChart" class="w-full h-72"></div>
      </div>
    </div>
    
    <!-- Recent Errors Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 class="text-lg font-bold text-gray-800">Recent AI Errors</h3>
        <span class="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">{{ recentErrors.length }} Issues</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th class="px-6 py-3">Time</th>
              <th class="px-6 py-3">Agent</th>
              <th class="px-6 py-3">Error Message</th>
              <th class="px-6 py-3">Log ID</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="recentErrors.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-gray-500">No recent errors detected. Systems are healthy! 🎉</td>
            </tr>
            <tr v-for="err in recentErrors" :key="err.name" class="border-b hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-gray-600">{{ formatTime(err.creation) }}</td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 bg-gray-200 text-gray-800 rounded-md text-xs font-medium">{{ err.agent_name }}</span>
              </td>
              <td class="px-6 py-4 text-red-600 font-mono text-xs max-w-md truncate" :title="err.error_message">{{ err.error_message }}</td>
              <td class="px-6 py-4 text-blue-600 hover:underline cursor-pointer font-mono text-xs">{{ err.name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, inject } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const router = useRouter()
const user = inject('$user')

const timeRange = ref('7')
const rawData = ref(null)

const trendChart = ref(null)
const pieChart = ref(null)
let eTrend = null
let ePie = null

const fetchFrappeData = async () => {
  // Mock frappe call structure
  try {
    const res = await fetch(`/api/method/lms.lms.services.dashboard.api.get_ai_usage_stats?days=${timeRange.value}`)
    const json = await res.json()
    rawData.value = json.message
    renderCharts()
  } catch (e) {
    console.error("Error fetching dashboard data", e)
  }
}

const fetchData = () => {
  fetchFrappeData()
}

// Computed Summaries
const totalCalls = computed(() => {
  if (!rawData.value?.agent_stats) return 0
  return rawData.value.agent_stats.reduce((acc, curr) => acc + curr.total_calls, 0)
})

const totalTokens = computed(() => {
  if (!rawData.value?.agent_stats) return 0
  return rawData.value.agent_stats.reduce((acc, curr) => acc + (curr.total_tokens || 0), 0)
})

const totalCost = computed(() => {
  if (!rawData.value?.agent_stats) return 0
  return rawData.value.agent_stats.reduce((acc, curr) => acc + (curr.total_cost || 0), 0)
})

const errorRate = computed(() => {
  if (!rawData.value?.error_stats || totalCalls.value === 0) return 0
  const errors = rawData.value.error_stats.reduce((acc, curr) => acc + curr.error_count, 0)
  return (errors / totalCalls.value) * 100
})

const recentErrors = computed(() => rawData.value?.recent_errors || [])

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const d = new Date(timeStr)
  return d.toLocaleString()
}

const renderCharts = () => {
  if (!rawData.value) return
  
  // Trend Chart
  if (trendChart.value) {
    if (!eTrend) eTrend = echarts.init(trendChart.value)
    const dates = rawData.value.daily_trend.map(d => d.date)
    const tokens = rawData.value.daily_trend.map(d => d.total_tokens)
    
    eTrend.setOption({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(255, 255, 255, 0.9)' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: dates },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Tokens',
          type: 'line',
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ])
          },
          lineStyle: { width: 3, color: '#3B82F6' },
          itemStyle: { color: '#3B82F6' },
          data: tokens
        }
      ]
    })
  }

  // Pie Chart
  if (pieChart.value) {
    if (!ePie) ePie = echarts.init(pieChart.value)
    const pieData = rawData.value.agent_stats.map(s => ({
      name: s.agent_name,
      value: s.total_cost
    }))
    
    ePie.setOption({
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: ${c} ({d}%)' },
      legend: { orient: 'vertical', left: 'left' },
      series: [
        {
          name: 'Cost',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: '18', fontWeight: 'bold' }
          },
          labelLine: { show: false },
          data: pieData
        }
      ]
    })
  }
}

onMounted(async () => {
  try {
    await user.promise
  } catch (e) {
    console.error("Error loading user info", e)
  }
  if (!user.data?.is_system_manager) {
    router.push({ name: 'Home' })
    return
  }
  fetchData()
  window.addEventListener('resize', () => {
    if (eTrend) eTrend.resize()
    if (ePie) ePie.resize()
  })
})
</script>

<style scoped>
/* Scoped styles to ensure clean aesthetics */
.ai-dashboard-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
