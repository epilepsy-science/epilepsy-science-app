<template>
  <div class="dataset-proposal-page">
    <div class="body-wrapper">
      <header class="page-header">
        <h1>Propose a Dataset</h1>
        <p class="page-intro">
          Tell us about the dataset you would like to contribute to Epilepsy.Science.
          Our team will review your proposal and follow up by email.
        </p>
        <p class="required-legend">
          Fields marked with <span class="required-marker" aria-hidden="true">*</span> are required.
        </p>
      </header>

      <div class="progress-card">
        <div class="progress-label">
          <span>Proposal progress</span>
          <span class="progress-count">{{ completedFieldCount }} of {{ requiredFieldKeys.length }} completed</span>
        </div>
        <el-progress
          :percentage="completionPercentage"
          :stroke-width="10"
          :show-text="false"
          :status="isProposalComplete ? 'success' : undefined"
        />
      </div>

      <el-form
        ref="proposalFormRef"
        :model="proposalForm"
        :rules="proposalFormRules"
        label-position="top"
        class="proposal-form"
        @submit.prevent
      >
        <section class="form-section">
          <h2 class="section-title">
            Dataset Name <span class="required-marker">*</span>
            <el-icon v-if="isSectionComplete(['datasetName'])" class="section-check"><CircleCheckFilled /></el-icon>
          </h2>
          <p class="section-description">Provide a clear, descriptive name for your dataset</p>
          <el-form-item prop="datasetName" label="Dataset Name" class="hidden-label">
            <el-input
              v-model="proposalForm.datasetName"
              placeholder="e.g: Neural Activity in Visual Cortex During Object Recognition"
              maxlength="200"
            />
          </el-form-item>
        </section>

        <section class="form-section">
          <h2 class="section-title">
            Dataset Description <span class="required-marker">*</span>
            <el-icon v-if="isSectionComplete(['datasetDescription'])" class="section-check"><CircleCheckFilled /></el-icon>
          </h2>
          <p class="section-description">
            Provide a detailed description of your dataset including methodology, objectives, and relevance
          </p>
          <el-form-item prop="datasetDescription" label="Dataset Description" class="hidden-label">
            <el-input
              v-model="proposalForm.datasetDescription"
              type="textarea"
              :autosize="{ minRows: 5, maxRows: 12 }"
              placeholder="Provide a detailed description of your dataset including methodology, objectives, and relevance to the repository..."
            />
          </el-form-item>
        </section>

        <section class="form-section">
          <h2 class="section-title">
            Repository Requirements <span class="required-marker">*</span>
            <el-icon v-if="isSectionComplete(repositoryQuestionKeys)" class="section-check"><CircleCheckFilled /></el-icon>
          </h2>
          <p class="section-description">Answer the following questions specific to Epilepsy.Science</p>
          <el-form-item
            v-for="question in repositoryQuestions"
            :key="question.key"
            :prop="question.key"
            :label="question.label"
            required
          >
            <el-input v-model="proposalForm[question.key]" placeholder="Please provide your answer..." />
          </el-form-item>
        </section>

        <p v-if="!isProposalComplete" class="completion-note">
          <el-icon><InfoFilled /></el-icon>
          Complete all required fields to continue
        </p>

        <div class="form-actions">
          <el-button @click="onCancel">Cancel</el-button>
          <el-button :disabled="!isProposalDirty" @click="onSaveProposal">Save Proposal</el-button>
          <el-button type="primary" :disabled="!isProposalComplete" @click="onSubmitProposal">
            Submit Proposal
          </el-button>
        </div>
      </el-form>
    </div>

    <SubmitProposalDialog
      v-model="isSubmitDialogVisible"
      :is-submitting="isSubmitting"
      @confirm="onConfirmSubmission"
    />
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CircleCheckFilled, InfoFilled } from '@element-plus/icons-vue'
import { createEmptyProposal, useDatasetProposal } from '~/composables/useDatasetProposal'

type ProposalFieldKey = keyof ReturnType<typeof createEmptyProposal>

useHead({ title: 'Propose a Dataset - Epilepsy.Science' })

const router = useRouter()
const { loadDraft, saveDraft, clearDraft, submitProposal } = useDatasetProposal()

const repositoryQuestions: { key: ProposalFieldKey; label: string }[] = [
  { key: 'fundingSource', label: 'What is the funding source for this dataset? (NIH, DoD, NSF, etc)' },
  { key: 'largestFileSize', label: 'What is the approximate size of the largest individual file?' },
  { key: 'totalDatasetSize', label: 'What is the approximate total size of the dataset?' },
  { key: 'grantAwardNumber', label: 'What is the Grant Award Number?' },
]
const repositoryQuestionKeys = repositoryQuestions.map((question) => question.key)
const requiredFieldKeys: ProposalFieldKey[] = ['datasetName', 'datasetDescription', ...repositoryQuestionKeys]

const proposalFormRef = ref<FormInstance>()
const proposalForm = reactive(createEmptyProposal())
const lastSavedSnapshot = ref(JSON.stringify(proposalForm))

const requiredRule = (fieldName: string) => ({
  required: true,
  whitespace: true,
  message: `${fieldName} is required`,
  trigger: 'blur',
})
const proposalFormRules: FormRules = {
  datasetName: [requiredRule('Dataset name')],
  datasetDescription: [requiredRule('Dataset description')],
  ...Object.fromEntries(repositoryQuestionKeys.map((key) => [key, [requiredRule('This answer')]])),
}

const isFieldFilled = (key: ProposalFieldKey) => proposalForm[key].trim().length > 0
const isSectionComplete = (keys: ProposalFieldKey[]) => keys.every(isFieldFilled)

const completedFieldCount = computed(() => requiredFieldKeys.filter(isFieldFilled).length)
const completionPercentage = computed(() =>
  Math.round((completedFieldCount.value / requiredFieldKeys.length) * 100)
)
const isProposalComplete = computed(() => completedFieldCount.value === requiredFieldKeys.length)
const isProposalDirty = computed(() => JSON.stringify(proposalForm) !== lastSavedSnapshot.value)

// Restore a saved draft (client only, localStorage)
onMounted(() => {
  const savedDraft = loadDraft()
  if (!savedDraft) return
  for (const key of requiredFieldKeys) {
    if (typeof savedDraft[key] === 'string') proposalForm[key] = savedDraft[key]
  }
  lastSavedSnapshot.value = JSON.stringify(proposalForm)
  ElMessage({ message: 'Your saved proposal draft was restored.', type: 'info' })
})

const onSaveProposal = () => {
  if (saveDraft(proposalForm)) {
    lastSavedSnapshot.value = JSON.stringify(proposalForm)
    ElMessage({ message: 'Proposal saved. You can return to finish it later.', type: 'success' })
  } else {
    ElMessage({ message: 'Unable to save your proposal in this browser.', type: 'error' })
  }
}

const onCancel = async () => {
  if (isProposalDirty.value) {
    const shouldLeave = await ElMessageBox.confirm(
      'You have unsaved changes. Leave without saving?',
      'Discard changes?',
      { confirmButtonText: 'Leave', cancelButtonText: 'Stay', type: 'warning' }
    ).then(() => true).catch(() => false)
    if (!shouldLeave) return
  }
  router.push('/')
}

const isSubmitDialogVisible = ref(false)
const isSubmitting = ref(false)

const onSubmitProposal = async () => {
  const isFormValid = await proposalFormRef.value?.validate().catch(() => false)
  if (isFormValid) isSubmitDialogVisible.value = true
}

const onConfirmSubmission = async (submitter: { name: string; email: string }) => {
  isSubmitting.value = true
  try {
    await submitProposal({ ...proposalForm }, submitter)
    clearDraft()
    Object.assign(proposalForm, createEmptyProposal())
    lastSavedSnapshot.value = JSON.stringify(proposalForm)
    isSubmitDialogVisible.value = false
    ElMessage({ message: 'Thank you! Your dataset proposal has been submitted.', type: 'success' })
    router.push('/')
  } catch {
    ElMessage({ message: 'Something went wrong submitting your proposal. Please try again.', type: 'error' })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.dataset-proposal-page {
  max-width: 800px;
  margin: 0 auto;

  .body-wrapper {
    padding-inline: 16px;
    margin-block: 40px;

    @media (min-width: 768px) {
      padding-inline: 32px;
      margin-block: 64px;
    }
  }
}

.page-header {
  text-align: center;
  margin-bottom: 32px;

  h1 {
    color: $es-primary-color;
    margin-bottom: 12px;
  }

  .page-intro {
    color: $text-color;
    line-height: 1.5;
  }

  .required-legend {
    color: $mediumGrey;
    font-size: 0.9rem;
    margin: 0;
  }
}

.required-marker {
  color: $danger;
}

.progress-card {
  position: sticky;
  top: 0;
  z-index: 2;
  background: $white;
  border: 1px solid $lineColor1;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;

  .progress-label {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 4px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .progress-count {
    color: $mediumGrey;
    font-weight: 400;
  }
}

.form-section {
  border: 1px solid $lineColor1;
  border-radius: 8px;
  padding: 20px 16px 4px;
  margin-bottom: 24px;
  background: $white;

  @media (min-width: 768px) {
    padding: 24px 24px 8px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 1.25rem;
    font-weight: 500;
    margin: 0 0 4px;
  }

  .section-check {
    color: $success;
    margin-left: auto;
  }

  .section-description {
    color: $mediumGrey;
    margin: 0 0 16px;
  }

  // The section heading already labels single-field sections; keep the label for screen readers only
  .hidden-label :deep(.el-form-item__label) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
}

.completion-note {
  display: flex;
  align-items: center;
  gap: 6px;
  color: $mediumGrey;
  margin: 0 0 16px;
}

.form-actions {
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;

  .el-button {
    margin-left: 0;
    width: 100%;
  }

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: flex-end;

    .el-button {
      width: auto;
    }
  }
}
</style>
