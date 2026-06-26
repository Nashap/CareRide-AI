import { Link } from "react-router-dom";

function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-20">

      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl p-12 text-center text-white shadow-lg">

        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Ready to travel with confidence?
        </h2>

        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          Sign up free and book your first ride in minutes.
        </p>

        <Link
          to="/register"
          className="
            inline-block
            bg-white
            text-teal-600
            hover:bg-gray-100
            px-8
            py-4
            rounded-xl
            font-semibold
            transition
          "
        >
          Get Started
        </Link>

      </div>

    </section>
  );
}

export default CTA;