<template>
  <div class="issue-list-container">
    <div class="header">
      <h1>이슈 관리 대시보드</h1>
      <button @click="goToCreateIssue" class="btn-primary">새 이슈 생성</button>
    </div>

    <!-- 상태 필터링 -->
    <div class="filter-section">
      <button
        v-for="filter in statusFilters"
        :key="filter.value"
        @click="selectedStatus = filter.value"
        :class="['filter-btn', { active: selectedStatus === filter.value }]"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- 이슈 목록 -->
    <div class="issue-list">
      <div v-if="loading" class="loading">로딩 중...</div>

      <div v-else-if="filteredIssues.length === 0" class="empty-state">표시할 이슈가 없습니다.</div>

      <div
        v-else
        v-for="issue in filteredIssues"
        :key="issue.id"
        @click="goToIssueDetail(issue.id)"
        class="issue-item"
      >
        <div class="issue-content">
          <h3 class="issue-title">{{ issue.title }}</h3>
          <div class="issue-meta">
            <span :class="['status-badge', issue.status.toLowerCase()]">
              {{ getStatusLabel(issue.status) }}
            </span>
            <span class="assignee"> 담당자: {{ issue.user ? issue.user.name : '미할당' }} </span>
            <span class="created-date"> 생성일: {{ formatDate(issue.createdAt) }} </span>
          </div>
        </div>
        <div class="issue-arrow">→</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { issueService } from '../services/issueService.js'

export default {
  name: 'IssueList',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const issues = ref([])
    const loading = ref(false)
    const selectedStatus = ref(null)

    const statusFilters = [
      { value: null, label: '전체' },
      { value: 'PENDING', label: '대기' },
      { value: 'IN_PROGRESS', label: '진행중' },
      { value: 'COMPLETED', label: '완료' },
      { value: 'CANCELLED', label: '취소' },
    ]

    const filteredIssues = computed(() => {
      return issues.value
    })

    const loadIssues = async () => {
      loading.value = true
      try {
        const result = await issueService.getIssues(selectedStatus.value)
        issues.value = result.issues
      } catch (error) {
        console.error('이슈 목록 로딩 실패:', error)
      } finally {
        loading.value = false
      }
    }

    const goToCreateIssue = () => {
      router.push('/issues/new')
    }

    const goToIssueDetail = (issueId) => {
      router.push(`/issues/${issueId}`)
    }

    const getStatusLabel = (status) => {
      const statusMap = {
        PENDING: '대기',
        IN_PROGRESS: '진행중',
        COMPLETED: '완료',
        CANCELLED: '취소',
      }
      return statusMap[status] || status
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ko-KR')
    }

    onMounted(() => {
      loadIssues()
    })

    watch(
      () => route.query,
      (query) => {
        if (query && query.created === 'true') {
          loadIssues()
          router.replace('/issues/')
        }
      },
      { immediate: true },
    )

    watch(selectedStatus, () => {
      loadIssues()
    })

    return {
      issues,
      loading,
      selectedStatus,
      statusFilters,
      filteredIssues,
      goToCreateIssue,
      goToIssueDetail,
      getStatusLabel,
      formatDate,
    }
  },
}
</script>

<style scoped>
.issue-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0;
  color: #333;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.filter-section {
  margin-bottom: 30px;
  display: flex;
  gap: 10px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background-color: #f8f9fa;
}

.filter-btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.issue-list {
  space-y: 10px;
}

.loading,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.issue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 10px;
}

.issue-item:hover {
  background-color: #f8f9fa;
  border-color: #007bff;
}

.issue-content {
  flex: 1;
}

.issue-title {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 18px;
}

.issue-meta {
  display: flex;
  gap: 15px;
  align-items: center;
  font-size: 14px;
  color: #666;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.pending {
  background-color: #ffeaa7;
  color: #d63031;
}

.status-badge.in_progress {
  background-color: #74b9ff;
  color: white;
}

.status-badge.completed {
  background-color: #00b894;
  color: white;
}

.status-badge.cancelled {
  background-color: #636e72;
  color: white;
}

.issue-arrow {
  font-size: 18px;
  color: #666;
}
</style>
