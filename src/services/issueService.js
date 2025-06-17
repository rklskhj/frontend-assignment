import axios from 'axios'
import { issues as initialIssues, users } from '../data/mockData.js'

// 환경 변수 확인
const isDev = import.meta.env.VITE_MODE === 'DEV'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Mock 데이터를 위한 로컬 스토리지 (개발 모드에서만 사용)
let issues = [...initialIssues]
let nextId = Math.max(...issues.map((issue) => issue.id)) + 1

// Axios 인스턴스 생성 (운영 모드에서만 사용)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Mock 서비스 (개발 모드)
const mockService = {
  // 이슈 목록 조회 (상태 필터링 포함)
  getIssues(status = null) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredIssues = [...issues]
        if (status) {
          filteredIssues = issues.filter((issue) => issue.status === status)
        }
        resolve({ issues: filteredIssues })
      }, 100) // Mock API 지연
    })
  },

  // 이슈 상세 조회
  getIssue(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const issue = issues.find((issue) => issue.id === parseInt(id))
        if (issue) {
          resolve(issue)
        } else {
          reject({ error: '이슈를 찾을 수 없음', code: 404 })
        }
      }, 100)
    })
  },

  // 이슈 생성
  createIssue(issueData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date().toISOString()

        // 비즈니스 로직: userId가 제공되면 IN_PROGRESS, 없으면 PENDING
        const status = issueData.userId ? 'IN_PROGRESS' : 'PENDING'
        const user = issueData.userId ? users.find((u) => u.id === issueData.userId) : null

        const newIssue = {
          id: nextId++,
          title: issueData.title,
          description: issueData.description,
          status,
          user,
          createdAt: now,
          updatedAt: now,
        }

        issues.push(newIssue)
        resolve(newIssue)
      }, 100)
    })
  },

  // 이슈 수정
  updateIssue(id, issueData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const issueIndex = issues.findIndex((issue) => issue.id === parseInt(id))
        if (issueIndex === -1) {
          reject({ error: '이슈를 찾을 수 없음', code: 404 })
          return
        }

        const existingIssue = issues[issueIndex]
        const now = new Date().toISOString()

        // 비즈니스 로직: 담당자 최초 할당 시 PENDING → IN_PROGRESS
        let newStatus = issueData.status || existingIssue.status
        if (!existingIssue.user && issueData.userId && existingIssue.status === 'PENDING') {
          newStatus = 'IN_PROGRESS'
        }

        console.log('newStatus', newStatus)
        console.log('existingIssue', existingIssue)

        const user = issueData.userId
          ? users.find((u) => u.id === issueData.userId)
          : existingIssue.user

        console.log('user', user)

        const updatedIssue = {
          ...existingIssue,
          title: issueData.title || existingIssue.title,
          description: issueData.description || existingIssue.description,
          status: newStatus,
          user,
          updatedAt: now,
        }

        issues[issueIndex] = updatedIssue
        resolve(updatedIssue)
      }, 100)
    })
  },

  // 사용자 목록 조회
  getUsers() {
    return Promise.resolve(users)
  },
}

// API 서비스 (운영 모드)
const apiService = {
  // 이슈 목록 조회 (상태 필터링 포함)
  async getIssues(status = null) {
    try {
      const params = status ? { status } : {}
      const response = await apiClient.get('/issues', { params })
      return response.data
    } catch (error) {
      console.error('API 이슈 목록 조회 실패:', error)
      throw error.response?.data || { error: '네트워크 오류', code: 500 }
    }
  },

  // 이슈 상세 조회
  async getIssue(id) {
    try {
      const response = await apiClient.get(`/issue/${id}`)
      return response.data
    } catch (error) {
      console.error('API 이슈 상세 조회 실패:', error)
      throw error.response?.data || { error: '네트워크 오류', code: 500 }
    }
  },

  // 이슈 생성
  async createIssue(issueData) {
    try {
      const response = await apiClient.post('/issue', issueData)
      return response.data
    } catch (error) {
      console.error('API 이슈 생성 실패:', error)
      throw error.response?.data || { error: '네트워크 오류', code: 500 }
    }
  },

  // 이슈 수정
  async updateIssue(id, issueData) {
    try {
      const response = await apiClient.patch(`/issue/${id}`, issueData)
      return response.data
    } catch (error) {
      console.error('API 이슈 수정 실패:', error)
      throw error.response?.data || { error: '네트워크 오류', code: 500 }
    }
  },

  // 사용자 목록 조회 (API에서는 별도 엔드포인트가 없으므로 하드코딩)
  async getUsers() {
    // API 명세에 사용자 목록 조회가 없으므로 하드코딩된 사용자 목록 반환
    return Promise.resolve(users)
  },
}

// 환경에 따라 적절한 서비스 export
export const issueService = isDev ? mockService : apiService
