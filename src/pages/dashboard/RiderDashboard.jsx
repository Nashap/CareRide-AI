function RiderDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">

      <h1 className="text-3xl font-bold mb-8">
        Rider Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">
            Book a Ride
          </h2>

          <p className="text-gray-500 mt-2">
            Request mobility assistance.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">
            My Rides
          </h2>

          <p className="text-gray-500 mt-2">
            View upcoming and past rides.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold">
            AI Assistant
          </h2>

          <p className="text-gray-500 mt-2">
            Get travel recommendations.
          </p>
        </div>

      </div>

    </div>
  );
}

export default RiderDashboard;