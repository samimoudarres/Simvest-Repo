import CreatePost from "@/components/create-post"

export default function ActivityPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Activity Feed</h1>

      {/* Create Post Section */}
      <div className="px-4 mb-6">
        <CreatePost gameId="112024" placeholder="What are you trading today? Share your thoughts..." />
      </div>

      {/* Activity Feed (Placeholder) */}
      <div className="bg-gray-100 p-4 rounded-md">
        <p>Activity feed content will be displayed here.</p>
        {/* Add your activity feed components here */}
      </div>
    </div>
  )
}
