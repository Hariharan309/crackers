'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  PhotoIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import AdminHeader from '@/components/AdminHeader'
import { createCategory } from '@/lib/api'

function AddCategoryContent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    is_featured: false
  })

  // 🔐 Auth check
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const authData = localStorage.getItem('admin-auth')
    if (!token || !authData) {
      router.push('/admin/login')
    }
  }, [router])

  // 📸 Image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB.' })
      return
    }

    setImage(file)
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage(null)
    setPreview(null)
  }

  // ✏️ Form change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // ✅ Validation
  const validateForm = () => {
    if (!formData.name.trim()) return 'Category name is required.'
    return null
  }

  // 🚀 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const validationError = validateForm()
    if (validationError) {
      setMessage({ type: 'error', text: validationError })
      setLoading(false)
      return
    }

    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, String(value))
      })
      if (image) submitData.append('image', image)

      const response = await createCategory(submitData)
      console.log('API Response:', response)

      if (response.success) {
        setMessage({ type: 'success', text: '✅ Category created successfully!' })
        setTimeout(() => router.push('/admin/categories'), 2000)
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to create category.' })
      }
    } catch (error) {
      console.error('Error creating category:', error)
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }

    setTimeout(() => setMessage(null), 5000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Add New Category"
        description="Create a new product category"
        backUrl="/admin/categories"
        backLabel="Back to Categories"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 🔔 Notification */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <CheckIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 🧾 Basic Info */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Category Information</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-primary-500"
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-primary-500"
                  placeholder="Enter category description"
                />
              </div>
            </div>
          </div>

          {/* 🖼️ Image Upload */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Category Image</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <label
                    htmlFor="image"
                    className="cursor-pointer text-primary-600 font-medium hover:text-primary-500"
                  >
                    Upload File
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (max 5MB)</p>
                </div>
              </div>

              {preview && (
                <div className="relative mt-4 w-32 h-32">
                  <Image
                    src={preview}
                    alt="Category Preview"
                    width={128}
                    height={128}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ⚙️ Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Category Settings</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-3 md:space-y-0">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active and visible</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured category</span>
                </label>
              </div>
            </div>
          </div>

          {/* 🧭 Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/categories')}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AddCategoryPage() {
  return <AddCategoryContent />
}
