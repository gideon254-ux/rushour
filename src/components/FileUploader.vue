<template>
  <div class="space-y-4">
    <div 
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
      :class="[
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300',
        isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50',
        file ? 'border-green-500 bg-green-50' : ''
      ]"
    >
      <input 
        ref="fileInput"
        type="file"
        :accept="acceptedTypes"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <div v-if="!file" class="space-y-3">
        <i data-lucide="upload-cloud" class="w-12 h-12 mx-auto text-gray-400"></i>
        <div>
          <p class="font-medium text-gray-700">
            {{ isDragging ? 'Drop file here' : 'Drag & drop your file here' }}
          </p>
          <p class="text-sm text-gray-500 mt-1">or click to browse</p>
        </div>
        <p class="text-xs text-gray-400">
          Max size: {{ maxSizeMB }}MB. Formats: PDF, ZIP, PPT, DOCX
        </p>
      </div>
      
      <div v-else class="space-y-3">
        <i data-lucide="file-check" class="w-12 h-12 mx-auto text-green-500"></i>
        <div>
          <p class="font-medium text-gray-900">{{ file.name }}</p>
          <p class="text-sm text-gray-500">{{ formatFileSize(file.size) }}</p>
        </div>
        <button 
          @click.stop="clearFile"
          class="text-sm text-red-500 hover:text-red-700"
        >
          Remove file
        </button>
      </div>
    </div>
    
    <!-- Upload Progress -->
    <div v-if="uploading" class="bg-gray-50 rounded-lg p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Uploading...</span>
        <span class="text-sm text-gray-500">{{ uploadProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="bg-orange-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="error" class="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { uploadToR2 } from '../lib/r2'

const props = defineProps({
  modelValue: Object,
  acceptedTypes: {
    type: String,
    default: '.pdf,.zip,.ppt,.pptx,.doc,.docx'
  },
  maxSizeMB: {
    type: Number,
    default: 500
  },
  folder: {
    type: String,
    default: 'products'
  }
})

const emit = defineEmits(['update:modelValue', 'uploaded'])

const fileInput = ref(null)
const file = ref(null)
const isDragging = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const selectedFile = event.target.files[0]
  if (selectedFile) {
    validateAndSetFile(selectedFile)
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const droppedFile = event.dataTransfer.files[0]
  if (droppedFile) {
    validateAndSetFile(droppedFile)
  }
}

const validateAndSetFile = (selectedFile) => {
  error.value = null
  
  // Check file size
  if (selectedFile.size > props.maxSizeMB * 1024 * 1024) {
    error.value = `File too large. Maximum size is ${props.maxSizeMB}MB`
    return
  }
  
  // Check file type
  const extension = '.' + selectedFile.name.split('.').pop().toLowerCase()
  const accepted = props.acceptedTypes.split(',').map(t => t.trim())
  if (!accepted.includes(extension)) {
    error.value = `Invalid file type. Accepted: ${props.acceptedTypes}`
    return
  }
  
  file.value = selectedFile
  emit('update:modelValue', selectedFile)
}

const clearFile = () => {
  file.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  emit('update:modelValue', null)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadFile = async () => {
  if (!file.value) return null
  
  uploading.value = true
  uploadProgress.value = 0
  error.value = null
  
  try {
    const key = `${props.folder}/${Date.now()}-${file.value.name}`
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)
    
    await uploadToR2(file.value, key)
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    emit('uploaded', key)
    return key
  } catch (err) {
    error.value = 'Upload failed. Please try again.'
    console.error('Upload error:', err)
    return null
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  setTimeout(() => {
    if (window.lucide) {
      window.lucide.createIcons()
    }
  }, 100)
})

defineExpose({ uploadFile, clearFile })
</script>
