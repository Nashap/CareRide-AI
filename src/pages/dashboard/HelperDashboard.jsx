function HelperDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">

      <h1 className="text-3xl font-bold mb-8">
        Helper Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">
            Recommended Requests
          </h2>

          <p className="text-gray-500 mt-2">
            AI matched ride requests.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">
            Available Requests
          </h2>

          <p className="text-gray-500 mt-2">
            Browse all ride requests.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">
            Accepted Rides
          </h2>

          <p className="text-gray-500 mt-2">
            Manage assigned rides.
          </p>
        </div>

      </div>

    </div>
  );
}

export default HelperDashboard;