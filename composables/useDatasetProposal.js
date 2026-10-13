const DRAFT_STORAGE_KEY = 'epilepsy-science:dataset-proposal-draft'

export const createEmptyProposal = () => ({
  datasetName: '',
  datasetDescription: '',
  fundingSource: '',
  largestFileSize: '',
  totalDatasetSize: '',
  grantAwardNumber: '',
})

export function useDatasetProposal() {
  const loadDraft = () => {
    if (!import.meta.client) return null
    try {
      const storedDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY)
      return storedDraft ? JSON.parse(storedDraft) : null
    } catch {
      return null
    }
  }

  const saveDraft = (proposal) => {
    if (!import.meta.client) return false
    try {
      const draftWithTimestamp = { ...proposal, savedAt: new Date().toISOString() }
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftWithTimestamp))
      return true
    } catch {
      return false
    }
  }

  const clearDraft = () => {
    if (!import.meta.client) return
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch {
      // storage unavailable (private mode, blocked site data) - nothing to clear
    }
  }

  // TODO: replace with a real API call once the proposal endpoint exists
  const submitProposal = async (proposal, submitter) => {
    const proposalPayload = { ...proposal, submitterName: submitter.name, submitterEmail: submitter.email }
    await new Promise((resolve) => setTimeout(resolve, 600))
    return proposalPayload
  }

  return { loadDraft, saveDraft, clearDraft, submitProposal }
}
