function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-16">
      <div className="bg-white rounded-3xl p-12 shadow-sm text-center">

        <h2 className="text-4xl font-bold mb-4">
          Ready to travel with confidence?
        </h2>

        <p className="text-gray-500 mb-8">
          Sign up free and book your first ride in minutes.
        </p>

        <button
          className="
            bg-teal-500
            hover:bg-teal-600
            text-white
            px-8
            py-4
            rounded-xl
            font-semibold
            transition
          "
        >
          Get Started
        </button>

      </div>
    </section>
  );
}

export default CTA;