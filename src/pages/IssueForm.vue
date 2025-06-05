<template>
  <div class="issue-form-container">
    <div class="header">
      <h1>{{ pageTitle }}</h1>
      <div class="header-buttons">
        <button v-if="isDetailMode" @click="goToEdit" class="btn-primary">수정</button>
        <button @click="goBack" class="btn-secondary">목록으로 돌아가기</button>
      </div>
    </div>

    <div v-if="loading" class="loading">로딩 중...</div>

    <!-- 상세 보기 모드 -->
    <div v-else-if="isDetailMode && currentIssue" class="issue-detail">
      <div class="detail-section">
        <h3>제목</h3>
        <p>{{ currentIssue.title }}</p>
      </div>

      <div class="detail-section">
        <h3>설명</h3>
        <p class="description">{{ currentIssue.description }}</p>
      </div>

      <div class="detail-row">
        <div class="detail-section">
          <h3>상태</h3>
          <span :class="['status-badge', currentIssue.status.toLowerCase()]">
            {{ getStatusLabel(currentIssue.status) }}
          </span>
        </div>

        <div class="detail-section">
          <h3>담당자</h3>
          <p>{{ currentIssue.user ? currentIssue.user.name : '미할당' }}</p>
        </div>
      </div>

      <div class="detail-row">
        <div class="detail-section">
          <h3>생성일</h3>
          <p>{{ formatDate(currentIssue.createdAt) }}</p>
        </div>

        <div class="detail-section">
          <h3>수정일</h3>
          <p>{{ formatDate(currentIssue.updatedAt) }}</p>
        </div>
      </div>
    </div>

    <!-- 생성/수정 폼 모드 -->
    <form v-else @submit.prevent="handleSubmit" class="issue-form">
      <!-- 제목 -->
      <div class="form-group">
        <label for="title">제목 *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          placeholder="이슈 제목을 입력하세요"
          class="form-input"
        />
      </div>

      <!-- 설명 -->
      <div class="form-group">
        <label for="description">설명 *</label>
        <textarea
          id="description"
          v-model="form.description"
          required
          placeholder="이슈에 대한 상세 설명을 입력하세요"
          rows="5"
          class="form-input"
        ></textarea>
      </div>

      <!-- 담당자 -->
      <div class="form-group">
        <label for="assignee">담당자</label>
        <select
          id="assignee"
          v-model="form.userId"
          :disabled="isAssigneeDisabled"
          class="form-input"
        >
          <option :value="null">담당자 미할당</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
        <small v-if="isAssigneeDisabled" class="form-help">
          완료 또는 취소된 이슈는 담당자를 변경할 수 없습니다.
        </small>
      </div>

      <!-- 상태 (수정 모드에서만 표시) -->
      <div v-if="isEditMode" class="form-group">
        <label for="status">상태</label>
        <select id="status" v-model="form.status" :disabled="isStatusDisabled" class="form-input">
          <option
            v-for="status in statusOptions"
            :key="status.value"
            :value="status.value"
            :disabled="status.disabled"
          >
            {{ status.label }}
          </option>
        </select>
        <small v-if="isStatusDisabled" class="form-help">
          담당자가 지정되지 않은 이슈는 상태를 변경할 수 없습니다.
        </small>
      </div>

      <!-- 메타 정보 (수정 모드에서만 표시) -->
      <div v-if="isEditMode && currentIssue" class="meta-info">
        <div class="meta-item">
          <strong>생성일:</strong> {{ formatDate(currentIssue.createdAt) }}
        </div>
        <div class="meta-item">
          <strong>수정일:</strong> {{ formatDate(currentIssue.updatedAt) }}
        </div>
      </div>

      <!-- 액션 버튼 -->
      <div class="form-actions">
        <button type="button" @click="goBack" class="btn-secondary">취소</button>
        <button type="submit" :disabled="!isFormValid" class="btn-primary">
          {{ isCreateMode ? '생성' : '수정' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { issueService } from '../services/issueService.js'

export default {
  name: 'IssueForm',
  setup() {
    const router = useRouter()
    const route = useRoute()

    const loading = ref(false)
    const users = ref([])
    const currentIssue = ref(null)

    const form = ref({
      title: '',
      description: '',
      userId: null,
      status: 'PENDING',
    })

    // 모드 구분
    const isCreateMode = computed(() => route.name === 'IssueCreate')
    const isDetailMode = computed(() => route.name === 'IssueDetail')
    const isEditMode = computed(() => route.name === 'IssueEdit')

    const pageTitle = computed(() => {
      if (isCreateMode.value) return '새 이슈 생성'
      if (isDetailMode.value) return '이슈 상세'
      if (isEditMode.value) return '이슈 수정'
      return '이슈'
    })

    const statusOptions = computed(() => [
      { value: 'PENDING', label: '대기', disabled: !form.value.userId },
      { value: 'IN_PROGRESS', label: '진행중', disabled: !form.value.userId },
      { value: 'COMPLETED', label: '완료', disabled: !form.value.userId },
      { value: 'CANCELLED', label: '취소', disabled: !form.value.userId },
    ])

    const isFormValid = computed(() => {
      return form.value.title.trim() && form.value.description.trim()
    })

    const isAssigneeDisabled = computed(() => {
      return (
        isEditMode.value &&
        currentIssue.value &&
        (currentIssue.value.status === 'COMPLETED' || currentIssue.value.status === 'CANCELLED')
      )
    })

    const isStatusDisabled = computed(() => {
      return !form.value.userId
    })

    const loadUsers = async () => {
      try {
        users.value = await issueService.getUsers()
      } catch (error) {
        console.error('사용자 목록 로딩 실패:', error)
      }
    }

    const loadIssue = async (id) => {
      if (!id) return

      loading.value = true
      try {
        currentIssue.value = await issueService.getIssue(id)
        form.value = {
          title: currentIssue.value.title,
          description: currentIssue.value.description,
          userId: currentIssue.value.user ? currentIssue.value.user.id : null,
          status: currentIssue.value.status,
        }
      } catch (error) {
        console.error('이슈 로딩 실패:', error)
        alert('이슈를 불러올 수 없습니다.')
        goBack()
      } finally {
        loading.value = false
      }
    }

    const handleSubmit = async () => {
      if (!isFormValid.value) return

      loading.value = true
      try {
        if (isEditMode.value) {
          await issueService.updateIssue(route.params.id, form.value)
          alert('이슈가 수정되었습니다.')
          // 수정 완료 후 상세 페이지로 이동
          router.push(`/issues/${route.params.id}`)
        } else if (isCreateMode.value) {
          await issueService.createIssue(form.value)
          alert('새 이슈가 생성되었습니다.')
          // 생성 완료 후에는 이슈 리스트로
          router.push('/issues/?created=true')
        }
      } catch (error) {
        console.error('이슈 저장 실패:', error)
        alert('이슈 저장에 실패했습니다.')
      } finally {
        loading.value = false
      }
    }

    const goBack = () => {
      router.push('/issues')
    }

    const goToEdit = () => {
      router.push(`/issues/${route.params.id}/edit`)
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
      return new Date(dateString).toLocaleString('ko-KR')
    }

    // 라우트 변경 감지하여 데이터 다시 로드
    watch(
      () => route.params.id,
      async (newId, oldId) => {
        if (newId && newId !== oldId && (isDetailMode.value || isEditMode.value)) {
          await loadIssue(newId)
        }
      },
    )

    // 라우트 이름 변경 감지 (상세 ↔ 수정 모드 전환)
    watch(
      () => route.name,
      async (newName, oldName) => {
        if (
          newName !== oldName &&
          route.params.id &&
          (newName === 'IssueDetail' || newName === 'IssueEdit')
        ) {
          await loadIssue(route.params.id)
        }
      },
    )

    onMounted(async () => {
      await loadUsers()

      if (isDetailMode.value || isEditMode.value) {
        await loadIssue(route.params.id)
      }
    })

    return {
      loading,
      users,
      currentIssue,
      form,
      isCreateMode,
      isDetailMode,
      isEditMode,
      pageTitle,
      statusOptions,
      isFormValid,
      isAssigneeDisabled,
      isStatusDisabled,
      handleSubmit,
      goBack,
      goToEdit,
      getStatusLabel,
      formatDate,
    }
  },
}
</script>

<style scoped>
.issue-form-container {
  max-width: 800px;
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

.header-buttons {
  display: flex;
  gap: 10px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* 상세 보기 스타일 */
.issue-detail {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
  font-weight: bold;
}

.detail-section p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.detail-section .description {
  white-space: pre-wrap;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #e9ecef;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 25px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
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

/* 폼 스타일 */
.issue-form {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-input:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
}

.form-help {
  display: block;
  margin-top: 5px;
  color: #6c757d;
  font-size: 12px;
}

.meta-info {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.meta-item {
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

.meta-item:last-child {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
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

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary:hover {
  background-color: #545b62;
}
</style>
