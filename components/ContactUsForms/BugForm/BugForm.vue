<template>
  <el-form
    ref="submitForm"
    label-position="top"
    :model="form"
    :rules="formRules"
    :hide-required-asterisk="true"
  >
    <el-form-item prop="pageUrl" label="Please provide the specific page URL">
      <el-input v-model="form.pageUrl" placeholder="URL">
        <template slot="prepend">Http://</template>
      </el-input>
    </el-form-item>

    <el-form-item
      prop="shortDescription"
      label="Provide a short description of what you were doing *"
    >
      <el-input
        v-model="form.shortDescription"
        placeholder="(Example: When I click <this button>, <this happens>.)"
      />
    </el-form-item>

    <el-form-item prop="detailedDescription" label="Provide a detailed description *">
      <el-input
        v-model="form.detailedDescription"
        type="textarea"
        :rows="3"
        placeholder="Please provide specific steps so our team can reproduce your experience in order to resolve the issue."
      />
    </el-form-item>
    
    <el-form-item class="file-upload" prop="fileAttachment" label="File Upload">
      <div class="body4 mb-8"><i>To help others understand your issue an image can really help.</i></div>
      <el-upload
        ref="fileUploader"
        action=""
        :limit="limit"
        :auto-upload="false"
        :on-change="onUploadChange"
        :on-remove="onRemove"
        :before-remove="beforeRemove" >
        <el-button slot="trigger" class="secondary">Select file</el-button>
        <span slot="tip" class="el-upload__tip ml-16">jpg/png file with a size less than 5MB</span>
      </el-upload>
    </el-form-item>

    <hr/>

    <user-contact-form-item
      showFollowUpOption
      @type-of-user-updated="form.typeOfUser = $event"
      @first-name-updated="form.firstName = $event"
      @last-name-updated="form.lastName = $event"
      @email-updated="form.email = $event"
      @follow-up-updated="form.shouldFollowUp = $event"
      @sned-copy-updated="form.sendCopy = $event"
      @subscribe-updated="form.shouldSubscribe = $event"
    />

    <hr/>

    <div class="heading2">
      Please check the box to proceed
    </div>
    <recaptcha class="recaptcha my-16 pl-16"/>

    <hr/>

    <el-form-item>
      <el-button class="primary" :disabled="isSubmitting" @click="onSubmit">
        Submit
      </el-button>
      <p v-if="hasError" class="error">
        An error has occurred, please try again.
      </p>
    </el-form-item>
  </el-form>
</template>

<script>
import NewsletterMixin from '../NewsletterMixin'
import FileUploadMixin from '@/mixins/file-upload/index'
import RecaptchaMixin from '@/mixins/recaptcha/index'
import UserContactFormItem from '../UserContactFormItem.vue'
import { propOr } from 'ramda'
import { mapState } from 'vuex'

export default {
  name: 'BugForm',

  mixins: [NewsletterMixin, FileUploadMixin, RecaptchaMixin],

  components: {
    UserContactFormItem
  },

  data() {
    return {
      form: {
        pageUrl: '',
        typeOfUser: '',
        shortDescription: '',
        detailedDescription: '',
        firstName: '',
        lastName: '',
        email: '',
        shouldFollowUp: true,
        sendCopy: true,
        shouldSubscribe: false,
      },
      isSubmitting: false,
      formRules: {
        typeOfUser: [
          {
            required: true,
            message: 'Please select one',
            trigger: 'change'
          }
        ],

        email: [
          {
            required: true,
            message: 'Please enter your email',
            type: 'email',
            trigger: 'blur',
          }
        ],

        firstName: [
          {
            required: true,
            message: 'Please enter your first name',
            trigger: 'blur',
          }
        ],

        lastName: [
          {
            required: true,
            message: 'Please enter your last name',
            trigger: 'blur',
          }
        ],

        shortDescription: [
          {
            required: true,
            message: 'Please enter a description',
            trigger: 'change'
          }
        ],

        detailedDescription: [
          {
            required: true,
            message: 'Please enter a description',
            trigger: 'change'
          }
        ],
      }
    }
  },

  computed: {
    ...mapState('pages/contact-us', {
      userTypes: state => state.formOptions.userTypes
    }),
    bugSourceUrl() {
      return this.$route.query.source_url
    },
  },

  mounted() {
    // Reset form fields when showing the form
    this.$refs.submitForm.resetFields()
    this.hasError = false

    if (this.bugSourceUrl != undefined) {
      const fullUrl = process.env.ROOT_URL + this.bugSourceUrl
      this.form.pageUrl = fullUrl.replace(/^https?:\/\//, '')
    }
  },

  methods: {
    validateUrl: function(rule, value, callback) {
      if (!value.includes('.') || value.lastIndexOf('.') == value.length - 1 || value.indexOf('.') == 0) {
        callback(new Error(rule.message))
      }
      callback()
    },

    /**
     * Send form to endpoint
     */
    async sendForm() {
      this.isSubmitting = true
      const fileName = propOr('', 'name', this.file)
      const description = `
        <b>Problematic page URL:</b><br>${this.form.pageUrl ? this.form.pageUrl : 'N/A'}<br><br>
        <b>Detailed Description</b><br>${this.form.detailedDescription}<br><br>
        ${fileName != '' ? `<b>File Attachment:</b><br>${fileName}<br><br>` : ''}
        <b>What type of user are you?</b><br>${this.form.typeOfUser}<br><br>
        <b>I'd like updates about this submission:</b><br>${this.form.shouldFollowUp ? 'Yes' : 'No'}<br><br>
        <b>Name:</b><br>${this.form.firstName} ${this.form.lastName}<br><br>
        <b>Email:</b><br>${this.form.email}
      `
      let formData = new FormData();
      formData.append("type", "bug")
      formData.append("sendCopy", this.form.sendCopy)
      formData.append("title", `SPARC Bug Submission: ${this.form.shortDescription}`)
      formData.append("description", description)
      formData.append("userEmail", this.form.email)
      if (propOr('', 'name', this.file) != ''){
        formData.append("attachment", this.file, this.file.name)
      }

      await this.$axios
        .post(`${process.env.portal_api}/tasks`, formData)
        .then(() => {
          if (this.form.shouldSubscribe) {
            this.subscribeToNewsletter(this.form.email, this.form.firstName, this.form.lastName)
          } else {
            this.$emit('submit', this.form.firstName)
          }
        })
        .catch(() => {
          this.hasError = true
        })
        .finally(() => {
          this.isSubmitting = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@nih-sparc/sparc-design-system-components/src/assets/_variables.scss';

.submit-button {
  text-align: left;
  margin-bottom: 0 !important;
}
hr {
  border-top: none;
  border-left: none;
  border-width: 2px;
  border-color: $lineColor1;
  margin: 2rem 0;
}
.error {
  color: $danger;
}
.recaptcha {
  display: flex;
  justify-content: left;
}
::v-deep .file-upload {
  .el-form-item__label {
    margin-bottom: .3rem;
  }
}
</style>
