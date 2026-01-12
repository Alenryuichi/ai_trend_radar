# Story 3.2: 實踐狀態本地持久化

Status: ready-for-dev

## Dependencies
- **Story 3.1**: PracticeProgress 組件（狀態變更來源）

## Story

As a 開發者用戶,
I want 我的實踐記錄在頁面刷新後仍然保留,
so that 我不會因為意外關閉瀏覽器而丟失學習進度.

## Acceptance Criteria

1. **AC1 - 狀態即時保存**
   - **Given** 用戶標記或取消一個精選的實踐狀態
   - **When** 狀態變更發生
   - **Then** 系統立即將狀態保存至 LocalStorage (key: `llmpulse_completed_practices`)
   - **And** 保存操作不阻塞用戶界面

2. **AC2 - 狀態恢復**
   - **Given** 用戶之前已標記某些精選為「已實踐」
   - **When** 用戶刷新頁面或重新訪問應用
   - **Then** 所有之前的實踐標記正確恢復顯示

## Tasks / Subtasks

- [ ] Task 1: 創建實踐狀態持久化服務 (AC: 1, 2)
  - [ ] 1.1 創建 `services/practiceStorageService.ts` 或在現有 `utils/` 添加
  - [ ] 1.2 定義 LocalStorage key 常量: `llmpulse_completed_practices`
  - [ ] 1.3 定義數據結構類型: `Record<string, boolean>` 或 `string[]`

- [ ] Task 2: 實現狀態保存邏輯 (AC: 1)
  - [ ] 2.1 實現 `savePracticeStatus(practiceId: string, isCompleted: boolean)` 方法
  - [ ] 2.2 讀取現有數據，更新指定 practiceId 的狀態
  - [ ] 2.3 使用 try-catch 處理 localStorage 異常（如配額超限）
  - [ ] 2.4 確保保存操作為同步非阻塞（localStorage 本身是同步的）

- [ ] Task 3: 實現狀態恢復邏輯 (AC: 2)
  - [ ] 3.1 實現 `loadCompletedPractices(): Set<string>` 方法
  - [ ] 3.2 從 LocalStorage 讀取並解析 JSON 數據
  - [ ] 3.3 處理數據格式錯誤或損壞的情況（返回空集合）
  - [ ] 3.4 實現 `isPracticeCompleted(practiceId: string): boolean` 輔助方法

- [ ] Task 4: 整合到 PracticeProgress 組件 (AC: 1, 2)
  - [ ] 4.1 在父組件初始化時調用 `loadCompletedPractices()`
  - [ ] 4.2 在 PracticeProgress 的 onToggle 中調用 `savePracticeStatus()`
  - [ ] 4.3 確保狀態變更即時反映在 UI 和 LocalStorage 中

## Dev Notes

### 技術約束
- LocalStorage key 必須使用: `llmpulse_completed_practices`（符合架構規範）
- 數據格式: JSON 字符串
- 無需考慮跨設備同步（MVP 階段無用戶系統）

### 數據結構設計

```typescript
// 方案 A: 對象結構 (推薦，便於快速查找)
interface CompletedPractices {
  [practiceId: string]: boolean;
}

// 方案 B: 數組結構 (更緊湊)
type CompletedPractices = string[]; // 只存儲已完成的 ID
```

### LocalStorage 操作模式

```typescript
// 保存
const save = (data: CompletedPractices) => {
  try {
    localStorage.setItem('llmpulse_completed_practices', JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save practice status:', e);
  }
};

// 讀取
const load = (): CompletedPractices => {
  try {
    const raw = localStorage.getItem('llmpulse_completed_practices');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Failed to load practice status:', e);
    return {};
  }
};
```

### 錯誤處理
- localStorage 不可用: 靜默失敗，僅記錄 console.warn
- 數據損壞: 返回空對象/數組，不中斷應用
- 配額超限: 考慮清理舊數據或警告用戶

### Project Structure Notes

- 新建文件: `src/services/practiceStorageService.ts` 或 `src/utils/practiceStorage.ts`
- 符合架構設計的 LocalStorage 緩存 key 格式
- 與 Story 3.1 的 PracticeProgress 組件整合

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#LocalStorage Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling Patterns]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### Change Log

### File List

