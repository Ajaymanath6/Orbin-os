import MainLayout from '../layouts/MainLayout'

export default function PackageDetailsPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto my-10 px-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Package details</h1>
        <p className="text-sm text-gray-600">
          This is a simple placeholder page for viewing your package details. You can customize this
          later with full booking information.
        </p>
      </div>
    </MainLayout>
  )
}

