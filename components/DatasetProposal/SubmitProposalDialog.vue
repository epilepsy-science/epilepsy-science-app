<template>
  <el-dialog
    v-model="isDialogVisible"
    title="Confirm Submission"
    width="min(480px, 92vw)"
    class="submit-proposal-dialog"
    :close-on-click-modal="!isSubmitting"
    @closed="resetSubmitterForm"
  >
    <p class="dialog-intro">
      Please provide your contact details so our team can follow up on your proposal.
    </p>
    <el-form
      ref="submitterFormRef"
      :model="submitterForm"
      :rules="submitterFormRules"
      label-position="top"
      @submit.prevent="onConfirmSubmission"
    >
      <el-form-item label="Name" prop="name">
        <el-input v-model="submitterForm.name" placeholder="Your full name" autocomplete="name" />
      </el-form-item>
      <el-form-item label="Email" prop="email">
        <el-input v-model="submitterForm.email" placeholder="you@institution.edu" autocomplete="email" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="isSubmitting" @click="isDialogVisible = false">Back</el-button>
      <el-button type="primary" :loading="isSubmitting" @click="onConfirmSubmission">
        Confirm Submission
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'

defineProps<{ isSubmitting: boolean }>()
const emit = defineEmits<{ confirm: [submitter: { name: string; email: string }] }>()

const isDialogVisible = defineModel<boolean>({ default: false })

const submitterFormRef = ref<FormInstance>()
const submitterForm = reactive({ name: '', email: '' })

const submitterFormRules: FormRules = {
  name: [{ required: true, message: 'Please enter your name', trigger: 'blur' }],
  email: [
    { required: true, message: 'Please enter your email', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email address', trigger: ['blur', 'change'] },
  ],
}

const onConfirmSubmission = async () => {
  const isFormValid = await submitterFormRef.value?.validate().catch(() => false)
  if (!isFormValid) return
  emit('confirm', { name: submitterForm.name.trim(), email: submitterForm.email.trim() })
}

const resetSubmitterForm = () => {
  submitterFormRef.value?.resetFields()
}
</script>

<style scoped lang="scss">
.dialog-intro {
  margin-top: 0;
  color: $text-color;
}
</style>
