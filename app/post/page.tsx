import { Suspense } from 'react'
import PostForm from './PostForm'

export default function PostPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <PostForm />
    </Suspense>
  )
}